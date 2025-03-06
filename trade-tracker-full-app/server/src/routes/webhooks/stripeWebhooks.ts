import express from "express";
import Stripe from "stripe";
import { creditService } from "../../services/CreditService";
import { userService } from "../../services/UserService";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const router = express.Router();

// Raw body parser for Stripe webhooks
router.use(express.raw({ type: "application/json" }));

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "Missing Stripe signature or webhook secret" });
  }

  try {
    const event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook error" });
  }
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { customer, metadata } = paymentIntent;
  if (!customer || !metadata.userId || !metadata.credits) {
    throw new Error("Missing required payment metadata");
  }

  const credits = parseInt(metadata.credits as string);

  // Update user's credits and create transaction
  await creditService.useCredits(metadata.userId, credits, "PURCHASE");
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await userService.findByStripeCustomerId(customerId);

  if (!user) {
    throw new Error(`No user found for Stripe customer ${customerId}`);
  }

  // Update subscription status
  await userService.updateSubscription(user.id, {
    status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
    stripeSubscriptionId: subscription.id,
  });

  // If subscription is new or reactivated, add pro credits
  if (subscription.status === "active") {
    await creditService.refreshCredits();
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await userService.findByStripeCustomerId(customerId);

  if (!user) {
    throw new Error(`No user found for Stripe customer ${customerId}`);
  }

  // Update subscription status
  await userService.updateSubscription(user.id, {
    status: "EXPIRED",
    stripeSubscriptionId: null,
  });
}

export default router;
