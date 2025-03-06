import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditBalance } from "@/components/credits/credit-balance";
import { CreditHistory } from "@/components/credits/credit-history";
import { CreditPurchase } from "@/components/credits/credit-purchase";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = constructMetadata({
  title: "Credits – Trade Tracker",
  description: "Manage your AI analysis credits",
});

interface CreditsPageProps {
  searchParams: {
    success?: string;
  };
}

export default async function CreditsPage({ searchParams }: CreditsPageProps) {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login");
  }

  const success = searchParams.success;

  try {
    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    return (
      <div className="space-y-6">
        {success === "true" && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertTitle>Payment successful!</AlertTitle>
            <AlertDescription>
              Your credits have been added to your account. You can now use them
              for AI analysis.
            </AlertDescription>
          </Alert>
        )}

        {success === "false" && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Payment failed</AlertTitle>
            <AlertDescription>
              The payment was not completed. Please try again or contact support
              if the problem persists.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI analysis credits and purchase history.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CreditBalance userId={user.id} />
          <CreditPurchase
            userId={user.id}
            subscriptionPlan={subscriptionPlan}
          />
        </div>

        <CreditHistory userId={user.id} />
      </div>
    );
  } catch (error) {
    throw error;
  }
}
