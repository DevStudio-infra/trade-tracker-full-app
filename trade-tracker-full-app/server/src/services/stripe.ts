import Stripe from "stripe";
import { PrismaClient, Plan } from "@prisma/client";

const prisma = new PrismaClient();
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Price IDs for different subscription plans
const SUBSCRIPTION_PRICES = {
  FREE: "price_free", // Free tier doesn't need a Stripe price ID
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
};

class StripeService {
  private static instance: StripeService;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async createCustomer(userId: string, email: string): Promise<string> {
    const customer = await stripeClient.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    await prisma.subscription.update({
      where: { userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer.id;
  }

  public async createSubscription(userId: string, plan: Plan): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new Error("User not found");

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      customerId = await this.createCustomer(userId, user.email);
    }

    if (plan === "FREE") {
      await this.cancelSubscription(userId);
      return "FREE_SUBSCRIPTION";
    }

    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: SUBSCRIPTION_PRICES[plan] }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    await prisma.subscription.update({
      where: { userId },
      data: {
        plan,
        stripeSubscriptionId: subscription.id,
        status: "ACTIVE",
      },
    });

    return subscription.id;
  }

  public async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription?.stripeSubscriptionId) {
      await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        plan: "FREE",
        status: "CANCELLED",
        stripeSubscriptionId: null,
      },
    });
  }

  public async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await this.getUserIdFromCustomerId(subscription.customer as string);
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: "FREE",
              status: "CANCELLED",
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await this.getUserIdFromCustomerId(subscription.customer as string);
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
            },
          });
        }
        break;
      }
    }
  }

  public async generateCheckoutSession(userId: string, email: string, priceId: string, returnUrl: string): Promise<string> {
    const stripeSession = await stripeClient.checkout.sessions.create({
      success_url: returnUrl,
      cancel_url: returnUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return stripeSession.url || "";
  }

  public async generatePortalSession(customerId: string, returnUrl: string): Promise<string> {
    const stripeSession = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return stripeSession.url || "";
  }

  private async getUserIdFromCustomerId(customerId: string): Promise<string | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
    return subscription?.userId || null;
  }
}

export const stripe = StripeService.getInstance();
