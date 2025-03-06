import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const billingUrl = absoluteUrl("/dashboard/billing");

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId, interval = "month" } = await req.json();

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email,
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_CREATE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
