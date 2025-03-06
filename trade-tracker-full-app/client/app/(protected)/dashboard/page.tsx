import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CreditCard,
  History,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Dashboard – Trade Tracker",
  description: "View your trading analytics and performance.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);

  // Get AI credits and recent transactions
  const credits = await prisma.aICredit.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "COMPLETED" },
      },
    },
  });

  // Get active sessions and recent analyses
  const [activeSessions, recentAnalyses] = await Promise.all([
    prisma.analysisSession.findMany({
      where: { userId: user.id },
      include: { analyses: true },
    }),
    prisma.analysis.findMany({
      where: {
        session: { userId: user.id },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        session: true,
      },
    }),
  ]);

  // Calculate relevant stats
  const totalAnalyses = activeSessions.reduce(
    (sum, session) => sum + session.analyses.length,
    0,
  );

  // Calculate analyses this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const analysesThisMonth = activeSessions.reduce(
    (sum, session) =>
      sum +
      session.analyses.filter(
        (analysis) => new Date(analysis.createdAt) >= startOfMonth,
      ).length,
    0,
  );

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your trading activity."
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Credits
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionPlan.isPaid ? "Pro Plan" : "Free Plan"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Brain className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Analyses
            </CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysesThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <History className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">Trading sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Credit Usage */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your latest trading analyses and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-8">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {analysis.type === "OPPORTUNITY"
                          ? "Trade Opportunity"
                          : "Trade Guidance"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Session: {analysis.session.name}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent analyses
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
            <CardDescription>
              Recent credit transactions and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {credits?.transactions.length ? (
                <div className="space-y-4">
                  {credits.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {transaction.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`ml-auto font-medium ${
                          transaction.type === "USAGE"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transaction.type === "USAGE" ? "-" : "+"}
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent transactions
                </p>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Actions</div>
                <div className="grid gap-2">
                  <Link href="/dashboard/copilot">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span>New Analysis</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  {!subscriptionPlan.isPaid && (
                    <Link href="/dashboard/billing">
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-primary/5 hover:bg-primary/10"
                      >
                        <span>Upgrade to Pro</span>
                        <Sparkles className="size-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
