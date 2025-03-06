import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { ComparePlans } from "@/components/pricing/compare-plans";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = constructMetadata({
  title: "Pricing – Trade Tracker",
  description: "Choose the perfect plan for your trading analysis needs.",
});

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-5xl font-bold">Admin Access</h1>
        <Image
          src="/_static/illustrations/call-waiting.svg"
          alt="403"
          width={560}
          height={560}
          className="pointer-events-none -my-20 dark:invert"
        />
        <p className="text-balance px-4 text-center text-2xl font-medium">
          Admins don&apos;t need a subscription. Back to{" "}
          <Link
            href="/admin"
            className="text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  let subscriptionPlan;
  if (user && user.id) {
    subscriptionPlan = await getUserSubscriptionPlan(user.id);
  }

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <div className="container flex max-w-5xl flex-col items-center gap-4 text-center">
        <h1 className="font-urban text-3xl font-bold sm:text-4xl md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="max-w-[85%] text-balance leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Choose the plan that best fits your trading needs. All plans include
          access to our AI-powered trading analysis tools. Upgrade or downgrade
          at any time.
        </p>
      </div>

      <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />

      <div className="container max-w-6xl">
        <hr className="my-8" />
        <ComparePlans />
      </div>

      <PricingFaq />
    </div>
  );
}
