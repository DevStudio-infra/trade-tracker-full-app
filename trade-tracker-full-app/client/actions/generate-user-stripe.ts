"use server";

import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
}

const billingUrl = absoluteUrl("/pricing")

export async function generateUserStripe(priceId: string): Promise<responseAction> {
  try {
    const session = await auth()
    const user = session?.user;

    if (!user || !user.email || !user.id) {
      throw new Error("Unauthorized");
    }

    // Call the server endpoint to generate a Stripe session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        priceId,
        returnUrl: billingUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate stripe session');
    }

    const { url } = await response.json();

    if (!url) {
      throw new Error('No URL returned from stripe session');
    }

    // no revalidatePath because redirect
    redirect(url);
  } catch (error) {
    console.error('Error generating stripe session:', error);
    throw new Error("Failed to generate user stripe session");
  }
}
