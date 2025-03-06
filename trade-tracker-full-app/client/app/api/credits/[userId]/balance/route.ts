import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.id !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    const isPro = subscriptionPlan.isPaid;

    const creditInfo = await prisma.aICredit.findUnique({
      where: {
        userId: params.userId,
      },
      include: {
        transactions: {
          where: {
            type: "USAGE",
            createdAt: {
              gte: new Date(new Date().setDate(1)), // Start of current month
            },
          },
          select: {
            amount: true,
          },
        },
      },
    });

    if (!creditInfo) {
      // Create initial credit record if it doesn't exist
      const newCreditInfo = await prisma.aICredit.create({
        data: {
          userId: params.userId,
          balance: isPro ? 100 : 6,
        },
      });

      return NextResponse.json({
        balance: newCreditInfo.balance,
        usedThisMonth: 0,
        totalCredits: isPro ? 100 : 6,
      });
    }

    const usedThisMonth = creditInfo.transactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount),
      0,
    );

    return NextResponse.json({
      balance: creditInfo.balance,
      usedThisMonth,
      totalCredits: isPro ? 100 : 6,
    });
  } catch (error) {
    console.error("[CREDITS_BALANCE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
