import express from "express";
import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { prisma } from "../lib/prisma";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("Missing CLERK_SECRET_KEY");
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const router = express.Router();

/**
 * Sync user data from Clerk to our database
 * POST /api/public/sync-user
 */
router.post("/sync-user", async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.split(" ")[1];
    if (!sessionId) {
      return res.status(401).json({ error: "No session token provided" });
    }

    try {
      const session = await clerk.sessions.getSession(sessionId);
      if (!session || !session.userId) {
        return res.status(401).json({ error: "Invalid session" });
      }

      const user = await clerk.users.getUser(session.userId);
      const primaryEmailAddress = user.emailAddresses[0]?.emailAddress;

      if (!primaryEmailAddress) {
        return res.status(400).json({ error: "No email address found" });
      }

      // Create or update user in our database
      const dbUser = await prisma.user.upsert({
        where: { clerkId: session.userId },
        update: {
          email: primaryEmailAddress,
        },
        create: {
          clerkId: session.userId,
          email: primaryEmailAddress,
        },
      });

      res.json({ user: dbUser });
    } catch (error) {
      console.error("Session verification error:", error);
      return res.status(401).json({ error: "Invalid session" });
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// Clerk webhook endpoint
router.post("/webhooks/clerk", express.json(), async (req, res) => {
  console.log("----------------------------------------");
  console.log("🔄 Clerk webhook received at:", new Date().toISOString());

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    // Get the headers
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({
        error: "Error occurred -- no svix headers",
      });
    }

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    const payload = req.body;
    const evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Get the event type
    const { type } = evt;
    const eventData = evt.data;

    console.log(`📝 Webhook with type ${type}:`, JSON.stringify(eventData, null, 2));

    switch (type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name } = eventData as {
          id: string;
          email_addresses: { email_address: string }[];
          first_name?: string;
          last_name?: string;
        };

        await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email: email_addresses[0]?.email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          },
          create: {
            clerkId: id,
            email: email_addresses[0]?.email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          },
        });
        break;
      }

      case "user.deleted":
        await prisma.user.delete({
          where: { clerkId: eventData.id },
        });
        break;

      default:
        console.log(`🤔 Unhandled webhook type: ${type}`);
    }

    console.log("✅ Webhook handled successfully");
    console.log("----------------------------------------");
    return res.status(200).json({
      success: true,
      message: `Webhook processed: ${type}`,
    });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    console.log("----------------------------------------");
    return res.status(400).json({
      error: "Webhook verification failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
