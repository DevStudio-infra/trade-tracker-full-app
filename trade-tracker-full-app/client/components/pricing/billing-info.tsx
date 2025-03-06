"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { UserSubscriptionPlan } from "types";
import { cn, formatDate } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerPortalButton } from "@/components/forms/customer-portal-button";

interface BillingInfoProps extends React.HTMLAttributes<HTMLFormElement> {
  userSubscriptionPlan: UserSubscriptionPlan;
}

export function BillingInfo({ userSubscriptionPlan }: BillingInfoProps) {
  const {
    title,
    description,
    stripeCustomerId,
    isPaid,
    isCanceled,
    stripeCurrentPeriodEnd,
  } = userSubscriptionPlan;

  const scrollToPlans = () => {
    const plansSection = document.querySelector("#available-plans");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          You are currently on the <strong>{title}</strong> plan.
          {isPaid && isCanceled && (
            <span className="ml-1 text-yellow-600">
              (Cancels on {formatDate(stripeCurrentPeriodEnd)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description}

        {isPaid && isCanceled && (
          <Alert className="mt-4">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Your subscription has been canceled and will end on{" "}
              {formatDate(stripeCurrentPeriodEnd)}. You can continue using Pro
              features until then. Want to stay? You can reactivate your
              subscription through the customer portal.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 border-t bg-accent py-2 md:flex-row md:justify-between md:space-y-0">
        {isPaid ? (
          <p className="text-sm font-medium text-muted-foreground">
            {isCanceled
              ? "Your plan will be canceled on "
              : "Your plan renews on "}
            {formatDate(stripeCurrentPeriodEnd)}.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 md:flex-row">
          {isPaid && stripeCustomerId ? (
            <>
              <CustomerPortalButton userStripeId={stripeCustomerId} />
              {!isCanceled && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to cancel your subscription? You can reactivate it later through the customer portal.",
                      )
                    ) {
                      window.location.href = `/api/stripe/portal?stripeCustomerId=${stripeCustomerId}`;
                    }
                  }}
                >
                  Cancel Subscription
                </Button>
              )}
            </>
          ) : (
            <Button onClick={scrollToPlans} className={cn(buttonVariants())}>
              Choose a plan
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
