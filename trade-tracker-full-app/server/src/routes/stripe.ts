import express from "express";
import { stripe } from "../services/stripe";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Schema for generating stripe session
const generateSessionSchema = z.object({
  priceId: z.string(),
  returnUrl: z.string().url(),
});

interface AuthenticatedRequest extends express.Request {
  user: {
    id: string;
    email: string;
  };
}

// Generate stripe session endpoint
router.post("/session", validateRequest({ body: generateSessionSchema }), async (req: AuthenticatedRequest, res) => {
  try {
    const { priceId, returnUrl } = req.body;
    const { id: userId, email } = req.user;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    let sessionUrl: string;

    if (subscription?.stripeCustomerId) {
      // User has a Stripe customer ID - Create portal session
      sessionUrl = await stripe.generatePortalSession(subscription.stripeCustomerId, returnUrl);
    } else {
      // User doesn't have a Stripe customer ID - Create checkout session
      sessionUrl = await stripe.generateCheckoutSession(userId, email, priceId, returnUrl);
    }

    return res.json({ url: sessionUrl });
  } catch (error) {
    console.error("Error generating stripe session:", error);
    return res.status(500).json({ error: "Failed to generate stripe session" });
  }
});

export default router;
