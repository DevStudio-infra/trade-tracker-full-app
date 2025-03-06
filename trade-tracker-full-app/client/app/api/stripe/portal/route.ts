import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const billingUrl = absoluteUrl("/dashboard/billing");

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stripeCustomerId = searchParams.get("stripeCustomerId");

    if (!stripeCustomerId) {
      return new NextResponse("Stripe customer ID is required", {
        status: 400,
      });
    }

    // Create a billing portal session
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: billingUrl,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_PORTAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
