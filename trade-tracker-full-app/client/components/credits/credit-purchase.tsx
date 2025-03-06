"use client";

import { useState } from "react";
import { UserSubscriptionPlan } from "@/types";
import { ShoppingCart } from "lucide-react";

import { creditConfig } from "@/config/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Icons } from "@/components/shared/icons";

interface CreditPurchaseProps {
  userId: string;
  subscriptionPlan: UserSubscriptionPlan;
}

export function CreditPurchase({
  userId,
  subscriptionPlan,
}: CreditPurchaseProps) {
  const [amount, setAmount] = useState<number>(6); // Start with minimum amount (6€)
  const [isLoading, setIsLoading] = useState(false);

  // Calculate credits based on amount and subscription status
  const pricePerCredit = subscriptionPlan.isPaid ? 0.143 : 0.22; // Pro users pay 0.143€, free users 0.22€
  const creditUnits = Math.floor(amount / pricePerCredit);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      console.log("Initiating purchase:", { userId, creditUnits, amount });

      const response = await fetch(`/api/credits/${userId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          creditUnits,
          amount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Purchase failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Failed to purchase credits: ${errorText}`);
      }

      const data = await response.json();
      console.log("Purchase successful, redirecting to:", data.url);
      window.location.href = data.url; // Redirect to Stripe checkout
    } catch (error) {
      console.error("Error purchasing credits:", {
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Purchase Credits</CardTitle>
        <ShoppingCart className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount to Pay</span>
            <span className="font-medium">{amount.toFixed(2)}€</span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={([value]) => setAmount(value)}
            min={6}
            max={1000}
            step={1}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Credits to Receive</span>
            <span>{creditUnits} credits</span>
          </div>
        </div>

        <div className="space-y-2 rounded-md bg-muted p-2">
          <div className="flex justify-between text-sm">
            <span>Plan Type</span>
            <span>
              {subscriptionPlan.isPaid ? "Pro Rate" : "Standard Rate"}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Price per Credit</span>
            <span>{pricePerCredit.toFixed(3)}€</span>
          </div>
          {subscriptionPlan.isPaid && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pro Discount Applied</span>
              <span>✓</span>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          ) : null}
          Pay {amount.toFixed(2)}€ for {creditUnits} Credits
        </Button>
      </CardContent>
    </Card>
  );
}
