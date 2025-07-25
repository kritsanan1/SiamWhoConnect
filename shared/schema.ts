import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  index, 
  integer, 
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Dating app specific fields
  displayName: varchar("display_name"),
  age: integer("age"),
  gender: varchar("gender"), // male, female, other
  location: varchar("location"),
  bio: text("bio"),
  occupation: varchar("occupation"),
  education: varchar("education"),
  videoUrl: varchar("video_url"),
  isProfileComplete: boolean("is_profile_complete").default(false),
  interests: text("interests").array(),
  isPremium: boolean("is_premium").default(false),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  likerId: varchar("liker_id").notNull().references(() => users.id),
  likedId: varchar("liked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isSuper: boolean("is_super").default(false),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const socialConnections = pgTable("social_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // facebook, instagram, tiktok, twitter
  platformUserId: varchar("platform_user_id"),
  username: varchar("username"),
  isConnected: boolean("is_connected").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentLikes: many(likes, { relationName: "liker" }),
  receivedLikes: many(likes, { relationName: "liked" }),
  matches1: many(matches, { relationName: "user1" }),
  matches2: many(matches, { relationName: "user2" }),
  sentMessages: many(messages),
  socialConnections: many(socialConnections),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
  messages: many(messages),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  liker: one(users, {
    fields: [likes.likerId],
    references: [users.id],
    relationName: "liker",
  }),
  liked: one(users, {
    fields: [likes.likedId],
    references: [users.id],
    relationName: "liked",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  user: one(users, {
    fields: [socialConnections.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  displayName: true,
  age: true,
  gender: true,
  location: true,
  bio: true,
  occupation: true,
  education: true,
  videoUrl: true,
  interests: true,
});

export const updateProfileSchema = createInsertSchema(users).pick({
  displayName: true,
  age: true,
  gender: true,
  location: true,
  bio: true,
  occupation: true,
  education: true,
  videoUrl: true,
  interests: true,
}).extend({
  displayName: z.string().min(1),
  age: z.number().min(18).max(100),
  gender: z.enum(["male", "female", "other"]),
  location: z.string().min(1),
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  likedId: true,
  isSuper: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  content: true,
}).extend({
  content: z.string().min(1),
});

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).pick({
  platform: true,
  platformUserId: true,
  username: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
