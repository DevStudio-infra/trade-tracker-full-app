import { redirect } from "next/navigation";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";

import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import { BillingInfo } from "@/components/pricing/billing-info";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Billing – Trade Tracker",
  description: "Manage billing and your subscription plan.",
});

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login");
  }

  const [userSubscriptionPlan, aiCredits] = await Promise.all([
    getUserSubscriptionPlan(user.id),
    prisma.aICredit.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: "desc" },
          where: { status: "COMPLETED" },
        },
      },
    }),
  ]);

  // Calculate credits used this billing period
  const startOfBillingPeriod = userSubscriptionPlan.stripeCurrentPeriodEnd
    ? new Date(
        userSubscriptionPlan.stripeCurrentPeriodEnd - 30 * 24 * 60 * 60 * 1000,
      )
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const creditsUsedThisPeriod =
    aiCredits?.transactions
      .filter(
        (t) =>
          t.type === "USAGE" && new Date(t.createdAt) >= startOfBillingPeriod,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  return (
    <div className="grid gap-8">
      <DashboardHeader
        heading="Billing"
        text="Manage your subscription and credit usage."
      />

      {/* Current Plan Overview */}
      <div className="grid gap-8">
        <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />

        {/* Credit Usage Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credits Used
              </CardTitle>
              <Zap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditsUsedThisPeriod}</div>
              <p className="text-xs text-muted-foreground">
                This billing period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credits Available
              </CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {aiCredits?.balance || 0}
              </div>
              <p className="text-xs text-muted-foreground">Current balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="grid gap-8">
          <div id="available-plans" className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Available Plans
            </h2>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="monthly">Monthly billing</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly billing
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-md px-1 py-0.5"
                  >
                    Save 20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {pricingData.map((plan) => (
                    <Card
                      key={plan.title}
                      className={
                        plan.badge
                          ? "relative border-primary/50 shadow-md"
                          : undefined
                      }
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-0 right-0 flex justify-center">
                          <Badge
                            variant="default"
                            className="rounded-sm px-3 py-1"
                          >
                            <Sparkles className="mr-2 size-3" />
                            {plan.badge}
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            ${plan.prices.monthly}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-sm">
                          {plan.benefits.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2"
                            >
                              <Check className="size-4 text-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {plan.limitations?.map((limitation) => (
                            <div
                              key={limitation}
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <Icons.close className="size-4" />
                              <span>{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <SubscriptionForm
                          planId={plan.stripeIds.monthly || ""}
                          planName={plan.title}
                          isCurrentPlan={
                            userSubscriptionPlan.title === plan.title
                          }
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {pricingData.map((plan) => (
                    <Card
                      key={plan.title}
                      className={
                        plan.badge
                          ? "relative border-primary/50 shadow-md"
                          : undefined
                      }
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-0 right-0 flex justify-center">
                          <Badge
                            variant="default"
                            className="rounded-sm px-3 py-1"
                          >
                            <Sparkles className="mr-2 size-3" />
                            {plan.badge}
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            ${plan.prices.yearly}
                          </span>
                          <span className="text-muted-foreground">/year</span>
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-sm">
                          {plan.benefits.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2"
                            >
                              <Check className="size-4 text-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {plan.limitations?.map((limitation) => (
                            <div
                              key={limitation}
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <Icons.close className="size-4" />
                              <span>{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <SubscriptionForm
                          planId={plan.stripeIds.yearly || ""}
                          planName={plan.title}
                          isCurrentPlan={
                            userSubscriptionPlan.title === plan.title
                          }
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
