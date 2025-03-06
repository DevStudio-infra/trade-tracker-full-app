"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface SubscriptionFormProps {
  planId: string;
  planName: string;
  isCurrentPlan: boolean;
  isLoading?: boolean;
}

export function SubscriptionForm({
  planId,
  planName,
  isCurrentPlan,
  isLoading: isLoadingProp = false,
}: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(isLoadingProp);
  const router = useRouter();

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Failed to process subscription. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      variant={isCurrentPlan ? "outline" : "default"}
      disabled={isCurrentPlan || isLoading}
      onClick={onSubmit}
    >
      {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
      {isCurrentPlan ? "Current Plan" : `Upgrade to ${planName}`}
    </Button>
  );
}
