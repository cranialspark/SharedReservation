import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  venueName: varchar("venue_name").notNull(),
  venueImage: varchar("venue_image"),
  eventDate: timestamp("event_date").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: varchar("status", { enum: ["active", "completed", "cancelled"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  name: varchar("name").notNull(),
  inviteCode: varchar("invite_code").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  shareAmount: decimal("share_amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  groupMemberId: integer("group_member_id").notNull().references(() => groupMembers.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "completed", "failed", "refunded"] }).default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reservationId: integer("reservation_id").references(() => reservations.id),
  type: varchar("type", { enum: ["payment", "join", "create", "reminder"] }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedReservations: many(reservations),
  groupMemberships: many(groupMembers),
  activities: many(activities),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  owner: one(users, {
    fields: [reservations.ownerId],
    references: [users.id],
  }),
  groups: many(groups),
  activities: many(activities),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  reservation: one(reservations, {
    fields: [groups.reservationId],
    references: [reservations.id],
  }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one, many }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  groupMember: one(groupMembers, {
    fields: [payments.groupMemberId],
    references: [groupMembers.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  reservation: one(reservations, {
    fields: [activities.reservationId],
    references: [reservations.id],
  }),
}));

// Schemas
export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  inviteCode: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
