import { Request, Response } from "express";
import { creditsService, CreditOperation } from "../services/credits";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Request validation schemas
const purchaseCreditsSchema = z.object({
  amount: z.number().positive().int(),
});

const checkCreditsSchema = z.object({
  operation: z.nativeEnum(CreditOperation),
});

const analyticsQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const creditsController = {
  async purchaseCredits(req: Request, res: Response) {
    try {
      const { amount } = purchaseCreditsSchema.parse(req.body);
      const userId = req.user.id;

      await creditsService.purchaseCredits(userId, amount);

      res.json({
        success: true,
        message: "Credit purchase initiated",
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async checkCredits(req: Request, res: Response) {
    try {
      const { operation } = checkCreditsSchema.parse(req.body);
      const userId = req.user.id;

      const hasEnough = await creditsService.hasEnoughCredits(userId, operation);

      res.json({
        success: true,
        data: { hasEnough },
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async getAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = analyticsQuerySchema.parse(req.query);
      const userId = req.user.id;

      const analytics = await creditsService.getUserCreditAnalytics(userId, startDate, endDate);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      res.status(400).json({
        success: false,
        error: "Missing Stripe signature or webhook secret",
      });
      return;
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { purchaseId } = paymentIntent.metadata;

        if (purchaseId) {
          await creditsService.completePurchase(purchaseId);
        }
      }

      res.json({ success: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: "Invalid webhook",
      });
    }
  },
};
