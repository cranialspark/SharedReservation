import {
  users,
  reservations,
  groups,
  groupMembers,
  payments,
  activities,
  type User,
  type UpsertUser,
  type Reservation,
  type InsertReservation,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type Payment,
  type InsertPayment,
  type Activity,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;

  // Reservation operations
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  getReservation(id: number): Promise<Reservation | undefined>;
  getUserReservations(userId: string): Promise<Reservation[]>;
  updateReservationStatus(id: number, status: string): Promise<void>;

  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupByReservationId(reservationId: number): Promise<Group | undefined>;
  getGroupByInviteCode(inviteCode: string): Promise<Group | undefined>;

  // Group member operations
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  getUserGroupMembership(userId: string, groupId: number): Promise<GroupMember | undefined>;
  updateMemberPaymentStatus(memberId: number, isPaid: boolean): Promise<void>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<void>;
  getPaymentsByGroup(groupId: number): Promise<Payment[]>;

  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;

  // Dashboard data
  getUserDashboardData(userId: string): Promise<{
    reservations: (Reservation & { group: Group & { members: (GroupMember & { user: User; payments: Payment[] })[] } })[];
    stats: {
      activeReservations: number;
      totalSaved: number;
      groupMembers: number;
    };
    activities: (Activity & { user: User; reservation?: Reservation })[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createReservation(reservationData: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(reservationData)
      .returning();
    return reservation;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id));
    return reservation;
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return await db
      .select()
      .from(reservations)
      .where(eq(reservations.ownerId, userId))
      .orderBy(desc(reservations.createdAt));
  }

  async updateReservationStatus(id: number, status: string): Promise<void> {
    await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, id));
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const inviteCode = nanoid(8);
    const [group] = await db
      .insert(groups)
      .values({ ...groupData, inviteCode })
      .returning();
    return group;
  }

  async getGroupByReservationId(reservationId: number): Promise<Group | undefined> {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.reservationId, reservationId));
    return group;
  }

  async getGroupByInviteCode(inviteCode: string): Promise<Group | undefined> {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode));
    return group;
  }

  async addGroupMember(memberData: InsertGroupMember): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values(memberData)
      .returning();
    return member;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
  }

  async getUserGroupMembership(userId: string, groupId: number): Promise<GroupMember | undefined> {
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));
    return member;
  }

  async updateMemberPaymentStatus(memberId: number, isPaid: boolean): Promise<void> {
    await db
      .update(groupMembers)
      .set({ isPaid })
      .where(eq(groupMembers.id, memberId));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async updatePaymentStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<void> {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.paidAt = new Date();
    }
    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId;
    }
    
    await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id));
  }

  async getPaymentsByGroup(groupId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .innerJoin(groupMembers, eq(payments.groupMemberId, groupMembers.id))
      .where(eq(groupMembers.groupId, groupId));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  async getUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getUserDashboardData(userId: string): Promise<{
    reservations: (Reservation & { group: Group & { members: (GroupMember & { user: User; payments: Payment[] })[] } })[];
    stats: {
      activeReservations: number;
      totalSaved: number;
      groupMembers: number;
    };
    activities: (Activity & { user: User; reservation?: Reservation })[];
  }> {
    // Get user's reservations with groups and members
    const userReservations = await db.query.reservations.findMany({
      where: eq(reservations.ownerId, userId),
      with: {
        groups: {
          with: {
            members: {
              with: {
                user: true,
                payments: true,
              }
            }
          }
        }
      },
      orderBy: desc(reservations.createdAt),
    });

    // Get reservations where user is a member
    const memberReservations = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
      with: {
        group: {
          with: {
            reservation: {
              with: {
                groups: {
                  with: {
                    members: {
                      with: {
                        user: true,
                        payments: true,
                      }
                    }
                  }
                }
              }
            },
            members: {
              with: {
                user: true,
                payments: true,
              }
            }
          }
        }
      }
    });

    // Combine and format reservations
    const allReservations = [
      ...userReservations.map(r => ({
        ...r,
        group: r.groups[0],
      })),
      ...memberReservations.map(m => ({
        ...m.group.reservation,
        group: m.group,
      }))
    ];

    // Calculate stats
    const activeReservations = allReservations.filter(r => r.status === 'active').length;
    const totalSaved = allReservations.reduce((sum, r) => {
      const totalCost = parseFloat(r.totalCost);
      const memberCount = r.group?.members?.length || 1;
      const individualCost = totalCost / memberCount;
      return sum + (totalCost - individualCost);
    }, 0);
    const groupMembers = allReservations.reduce((sum, r) => sum + (r.group?.members?.length || 0), 0);

    // Get recent activities
    const recentActivities = await db.query.activities.findMany({
      where: eq(activities.userId, userId),
      with: {
        user: true,
        reservation: true,
      },
      orderBy: desc(activities.createdAt),
      limit: 10,
    });

    return {
      reservations: allReservations,
      stats: {
        activeReservations,
        totalSaved: Math.round(totalSaved),
        groupMembers,
      },
      activities: recentActivities,
    };
  }
}

export const storage = new DatabaseStorage();
