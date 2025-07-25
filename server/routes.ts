import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});
import { 
  updateProfileSchema,
  insertLikeSchema,
  insertMessageSchema,
  insertSocialConnectionSchema 
} from "@shared/schema";
import { ZodError } from "zod";

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

  // Profile routes
  app.post('/api/profile/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Discovery routes
  app.get('/api/discover/potential-matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const potentialMatches = await storage.getPotentialMatches(userId, limit);
      res.json(potentialMatches);
    } catch (error) {
      console.error("Error fetching potential matches:", error);
      res.status(500).json({ message: "Failed to fetch potential matches" });
    }
  });

  // Like/Match routes
  app.post('/api/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likeData = insertLikeSchema.parse(req.body);
      
      // Create the like
      const like = await storage.createLike(userId, likeData);
      
      // Check if it's a mutual like
      const isMutualLike = await storage.checkMutualLike(userId, likeData.likedId);
      
      let match = null;
      if (isMutualLike) {
        // Create a match
        match = await storage.createMatch(userId, likeData.likedId);
      }
      
      res.json({ like, match, isMutualLike });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid like data", errors: error.errors });
      } else {
        console.error("Error creating like:", error);
        res.status(500).json({ message: "Failed to create like" });
      }
    }
  });

  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse(req.body);
      
      const message = await storage.createMessage(userId, messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Error creating message:", error);
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  app.get('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { matchId } = req.params;
      
      // Verify user is part of this match
      const matchData = await storage.getMatchWithMessages(matchId);
      if (!matchData || (matchData.user1Id !== userId && matchData.user2Id !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(matchData);
    } catch (error) {
      console.error("Error fetching match messages:", error);
      res.status(500).json({ message: "Failed to fetch match messages" });
    }
  });

  // Social connection routes
  app.post('/api/social-connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connectionData = insertSocialConnectionSchema.parse(req.body);
      
      const connection = await storage.createSocialConnection(userId, connectionData);
      res.json(connection);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid connection data", errors: error.errors });
      } else {
        console.error("Error creating social connection:", error);
        res.status(500).json({ message: "Failed to create social connection" });
      }
    }
  });

  app.get('/api/social-connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserSocialConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching social connections:", error);
      res.status(500).json({ message: "Failed to fetch social connections" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-checkout-session", isAuthenticated, async (req: any, res) => {
    try {
      const { priceId, plan } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.email) {
        return res.status(400).json({ message: "User email required" });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'thb',
              product_data: {
                name: `LoveMatch Premium - ${plan === 'yearly' ? 'รายปี' : 'รายเดือน'}`,
                description: 'ปลดล็อคฟีเจอร์พรีเมียมทั้งหมด',
              },
              unit_amount: plan === 'yearly' ? 299900 : 29900, // Thai Baht in satang
              recurring: {
                interval: plan === 'yearly' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.hostname}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.hostname}/discover`,
        metadata: {
          userId: userId,
          plan: plan,
        },
      });

      res.json({ sessionId: session.id });
    } catch (error: any) {
      console.error("Stripe checkout session error:", error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // User settings routes
  app.post("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;
      
      // In a real app, you'd save these settings to the database
      // For now, we'll just return success
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
