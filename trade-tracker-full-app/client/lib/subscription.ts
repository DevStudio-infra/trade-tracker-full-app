// Remove @ts-nocheck and add proper type safety
import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { UserSubscriptionPlan } from "types";
import { Stripe } from "stripe";

const getDefaultPlan = (): UserSubscriptionPlan => ({
  ...pricingData[0],
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: 0,
  isPaid: false,
  interval: null,
  isCanceled: false
});

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  if (!userId) {
    return getDefaultPlan();
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        stripeCustomerId: true,
        stripePriceId: true,
      },
    });

    if (!user) {
      return getDefaultPlan();
    }

    // Check if user is on a paid plan.
    const isPaid = Boolean(
      user.stripePriceId &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    );

    // Find the pricing data corresponding to the user's plan
    const userPlan =
      pricingData.find((plan) => plan.stripeIds.monthly === user.stripePriceId) ||
      pricingData.find((plan) => plan.stripeIds.yearly === user.stripePriceId);

    const plan = isPaid && userPlan ? userPlan : pricingData[0];

    const interval = isPaid && userPlan
      ? userPlan.stripeIds.monthly === user.stripePriceId
        ? "month"
        : userPlan.stripeIds.yearly === user.stripePriceId
        ? "year"
        : null
      : null;

    let isCanceled = false;
    if (isPaid && user.stripeSubscriptionId) {
      try {
        const stripePlan = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
        isCanceled = stripePlan.cancel_at_period_end;
      } catch (error) {
        console.error("Error retrieving stripe subscription:", error instanceof Stripe.errors.StripeError ? error.message : error);
        // Don't throw, just mark as not canceled
      }
    }

    return {
      ...plan,
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
      stripePriceId: user.stripePriceId ?? null,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() ?? 0,
      isPaid,
      interval,
      isCanceled
    };
  } catch (error) {
    console.error("Error in getUserSubscriptionPlan:", error);
    return getDefaultPlan();
  }
}
