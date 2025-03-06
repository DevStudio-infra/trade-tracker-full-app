import { NextResponse } from "next/server";

import { creditConfig } from "@/config/credits";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { absoluteUrl } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    console.log("Received purchase request for user:", params.userId);

    const user = await getCurrentUser();

    if (!user) {
      console.error("Unauthorized: No current user");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.id !== params.userId) {
      console.error("Forbidden: User ID mismatch", {
        currentUser: user.id,
        requestedUser: params.userId,
      });
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { amount, creditUnits } = body;

    if (!amount || amount < creditConfig.MIN_PURCHASE_AMOUNT) {
      console.error("Invalid amount:", {
        amount,
        minimum: creditConfig.MIN_PURCHASE_AMOUNT,
      });
      return new NextResponse(
        `Amount must be at least ${creditConfig.MIN_PURCHASE_AMOUNT}€`,
        { status: 400 },
      );
    }

    if (!creditUnits || creditUnits < 1) {
      console.error("Invalid credit units:", { creditUnits });
      return new NextResponse("Invalid credit amount", { status: 400 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    console.log("User subscription plan:", {
      isPaid: subscriptionPlan.isPaid,
      userId: user.id,
    });

    // Get the appropriate price ID based on subscription status
    const priceId = subscriptionPlan.isPaid
      ? creditConfig.STRIPE_PRICES.CREDITS.PRO
      : creditConfig.STRIPE_PRICES.CREDITS.FREE;

    if (!priceId) {
      console.error("Missing price ID for tier:", {
        tier: subscriptionPlan.isPaid ? "pro" : "free",
        priceId,
      });
      return new NextResponse("Price ID configuration error", { status: 500 });
    }

    // Create Stripe checkout session with price ID and quantity
    console.log("Creating Stripe session with:", {
      priceId,
      creditUnits,
      amount,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: creditUnits,
        },
      ],
      mode: "payment",
      success_url: absoluteUrl("/dashboard/credits?success=true"),
      cancel_url: absoluteUrl("/dashboard/credits?success=false"),
      metadata: {
        userId: user.id,
        creditUnits: creditUnits.toString(),
        amount: amount.toString(),
        tier: subscriptionPlan.isPaid ? "pro" : "free",
      },
    });

    console.log("Stripe session created:", {
      sessionId: session.id,
      url: session.url,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CREDITS_PURCHASE]", {
      error: error.message,
      stack: error.stack,
      userId: params.userId,
    });
    return new NextResponse(`Internal Error: ${error.message}`, {
      status: 500,
    });
  }
}
