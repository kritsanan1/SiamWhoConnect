import {
  users,
  matches,
  likes,
  messages,
  socialConnections,
  type User,
  type UpsertUser,
  type Match,
  type Like,
  type Message,
  type SocialConnection,
  type InsertLike,
  type InsertMessage,
  type InsertSocialConnection,
  type UpdateProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, not, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateProfile(userId: string, profile: UpdateProfile): Promise<User>;
  markProfileComplete(userId: string): Promise<void>;
  getPotentialMatches(userId: string, limit?: number): Promise<User[]>;
  
  // Like/Match operations
  createLike(likerId: string, like: InsertLike): Promise<Like>;
  checkMutualLike(userId1: string, userId2: string): Promise<boolean>;
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<(Match & { otherUser: User })[]>;
  
  // Message operations
  createMessage(senderId: string, message: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: string): Promise<(Message & { sender: User })[]>;
  getMatchWithMessages(matchId: string): Promise<(Match & { user1: User; user2: User; messages: (Message & { sender: User })[] }) | undefined>;
  
  // Social connections
  createSocialConnection(userId: string, connection: InsertSocialConnection): Promise<SocialConnection>;
  getUserSocialConnections(userId: string): Promise<SocialConnection[]>;
  
  // Premium status
  updateUserPremiumStatus(id: string, isPremium: boolean): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Profile operations
  async updateProfile(userId: string, profile: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        isProfileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async markProfileComplete(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        isProfileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getPotentialMatches(userId: string, limit = 10): Promise<User[]> {
    // Get users that haven't been liked by current user and exclude current user
    const likedUserIds = await db
      .select({ likedId: likes.likedId })
      .from(likes)
      .where(eq(likes.likerId, userId));
    
    const excludedIds = [userId, ...likedUserIds.map(l => l.likedId)];
    
    return await db
      .select()
      .from(users)
      .where(
        and(
          not(inArray(users.id, excludedIds)),
          eq(users.isProfileComplete, true)
        )
      )
      .limit(limit)
      .orderBy(asc(users.createdAt));
  }

  // Like/Match operations
  async createLike(likerId: string, like: InsertLike): Promise<Like> {
    const [newLike] = await db
      .insert(likes)
      .values({
        likerId,
        ...like,
      })
      .returning();
    return newLike;
  }

  async checkMutualLike(userId1: string, userId2: string): Promise<boolean> {
    const mutualLikes = await db
      .select()
      .from(likes)
      .where(
        or(
          and(eq(likes.likerId, userId1), eq(likes.likedId, userId2)),
          and(eq(likes.likerId, userId2), eq(likes.likedId, userId1))
        )
      );
    
    return mutualLikes.length === 2;
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({
        user1Id,
        user2Id,
      })
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<(Match & { otherUser: User })[]> {
    const userMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.isActive, true)
        )
      )
      .orderBy(desc(matches.createdAt));

    // Get other users for each match
    const matchesWithOtherUser = await Promise.all(
      userMatches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const [otherUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, otherUserId));

        return {
          ...match,
          otherUser: otherUser!
        };
      })
    );

    return matchesWithOtherUser;
  }

  // Message operations
  async createMessage(senderId: string, message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId,
        ...message,
      })
      .returning();
    return newMessage;
  }

  async getMatchMessages(matchId: string): Promise<(Message & { sender: User })[]> {
    return await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(asc(messages.createdAt))
      .then(results => 
        results.map(({ message, sender }) => ({
          ...message,
          sender: sender!,
        }))
      );
  }

  async getMatchWithMessages(matchId: string): Promise<(Match & { user1: User; user2: User; messages: (Message & { sender: User })[] }) | undefined> {
    const [matchData] = await db
      .select({
        match: matches,
        user1: users,
        user2: users,
      })
      .from(matches)
      .leftJoin(users, eq(matches.user1Id, users.id))
      .leftJoin(users, eq(matches.user2Id, users.id))
      .where(eq(matches.id, matchId));

    if (!matchData) return undefined;

    const matchMessages = await this.getMatchMessages(matchId);

    return {
      ...matchData.match,
      user1: matchData.user1!,
      user2: matchData.user2!,
      messages: matchMessages,
    };
  }

  // Social connections
  async createSocialConnection(userId: string, connection: InsertSocialConnection): Promise<SocialConnection> {
    const [socialConnection] = await db
      .insert(socialConnections)
      .values({
        userId,
        ...connection,
      })
      .returning();
    return socialConnection;
  }

  async getUserSocialConnections(userId: string): Promise<SocialConnection[]> {
    return await db
      .select()
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.isConnected, true)
        )
      );
  }

  async updateUserPremiumStatus(id: string, isPremium: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isPremium,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
