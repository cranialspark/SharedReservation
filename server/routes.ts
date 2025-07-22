import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReservationSchema, insertGroupMemberSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getUserDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Reservation routes
  app.post('/api/reservations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReservationSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const reservation = await storage.createReservation(validatedData);
      
      // Create a group for this reservation
      const group = await storage.createGroup({
        reservationId: reservation.id,
        name: `${reservation.venueName} Group`,
      });

      // Add owner as first member
      await storage.addGroupMember({
        groupId: group.id,
        userId,
        shareAmount: reservation.totalCost,
        isPaid: false,
      });

      // Create activity
      await storage.createActivity({
        userId,
        reservationId: reservation.id,
        type: "create",
        message: `Created reservation for ${reservation.venueName}`,
      });

      res.json({ reservation, group });
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation" });
    }
  });

  app.get('/api/reservations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const reservation = await storage.getReservation(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const group = await storage.getGroupByReservationId(reservationId);
      const members = group ? await storage.getGroupMembers(group.id) : [];

      res.json({ reservation, group, members });
    } catch (error) {
      console.error("Error fetching reservation:", error);
      res.status(500).json({ message: "Failed to fetch reservation" });
    }
  });

  // Group routes
  app.post('/api/groups/:inviteCode/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.params;

      const group = await storage.getGroupByInviteCode(inviteCode);
      if (!group) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      // Check if user is already a member
      const existingMember = await storage.getUserGroupMembership(userId, group.id);
      if (existingMember) {
        return res.status(400).json({ message: "Already a member of this group" });
      }

      const reservation = await storage.getReservation(group.reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      // Calculate share amount (equal split for now)
      const members = await storage.getGroupMembers(group.id);
      const shareAmount = parseFloat(reservation.totalCost) / (members.length + 1);

      // Update existing members' share amounts
      for (const member of members) {
        await storage.addGroupMember({
          ...member,
          shareAmount: shareAmount.toString(),
        });
      }

      // Add new member
      const newMember = await storage.addGroupMember({
        groupId: group.id,
        userId,
        shareAmount: shareAmount.toString(),
        isPaid: false,
      });

      // Create activity
      const user = await storage.getUser(userId);
      await storage.createActivity({
        userId,
        reservationId: reservation.id,
        type: "join",
        message: `${user?.firstName || 'Someone'} joined the group for ${reservation.venueName}`,
      });

      res.json(newMember);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, groupMemberId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          groupMemberId: groupMemberId.toString(),
        },
      });

      // Create payment record
      await storage.createPayment({
        groupMemberId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount.toString(),
        status: "pending",
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/payments/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        const groupMemberId = parseInt(paymentIntent.metadata.groupMemberId);
        
        // Update payment status
        await storage.updatePaymentStatus(
          groupMemberId, 
          "completed", 
          paymentIntentId
        );
        
        // Update member payment status
        await storage.updateMemberPaymentStatus(groupMemberId, true);

        // Create activity
        const userId = req.user.claims.sub;
        await storage.createActivity({
          userId,
          type: "payment",
          message: `Payment completed for ${paymentIntent.amount / 100} USD`,
        });
      }

      res.json({ status: paymentIntent.status });
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
