"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface CreditBalanceProps {
  userId: string;
}

interface CreditInfo {
  balance: number;
  usedThisMonth: number;
  totalCredits: number;
}

export function CreditBalance({ userId }: CreditBalanceProps) {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCreditInfo() {
      try {
        const response = await fetch(`/api/credits/${userId}/balance`);
        const data = await response.json();
        setCreditInfo(data);
      } catch (error) {
        console.error("Error fetching credit info:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreditInfo();
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Icons.spinner className="size-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!creditInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Error loading credit information
          </p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage =
    (creditInfo.usedThisMonth / creditInfo.totalCredits) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Available Credits
            </span>
            <span className="text-2xl font-bold">{creditInfo.balance}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Usage</span>
              <span>
                {creditInfo.usedThisMonth} / {creditInfo.totalCredits}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
