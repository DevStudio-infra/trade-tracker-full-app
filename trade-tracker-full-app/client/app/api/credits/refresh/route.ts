import { NextResponse } from "next/server";
import { TransactionStatus, TransactionType } from "@prisma/client";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";

const CRON_API_KEY = env.CRON_JOB_API_KEY;
const FREE_TIER_CREDITS = 6;
const PAID_TIER_CREDITS = 100;

type CreditRefreshResult = {
  userId: string;
  action: TransactionType | "CREATED" | "ERROR";
  newBalance?: number;
  previousBalance?: number;
  creditsAdded?: number;
  error?: string;
  details?: string;
};

export async function POST(req: Request) {
  try {
    // Verify the request is from cron-job.org
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${CRON_API_KEY}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all users with their credit records
    const users = await prisma.user.findMany({
      include: {
        AICredit: {
          include: {
            transactions: {
              where: {
                type: TransactionType.PURCHASE,
                status: TransactionStatus.COMPLETED,
              },
            },
          },
        },
      },
    });

    const results: CreditRefreshResult[] = [];

    // Process each user
    for (const user of users) {
      try {
        const subscriptionPlan = await getUserSubscriptionPlan(user.id);
        const isPaidUser = subscriptionPlan.isPaid;
        const userCredits = user.AICredit;

        if (!userCredits) {
          // Create initial credit record if none exists
          const newCredit = await prisma.aICredit.create({
            data: {
              userId: user.id,
              balance: isPaidUser ? PAID_TIER_CREDITS : FREE_TIER_CREDITS,
              lastRefreshDate: new Date(),
              hasPurchaseHistory: false,
            },
          });

          // Record the initial credit transaction
          await prisma.aICreditTransaction.create({
            data: {
              creditId: newCredit.id,
              amount: isPaidUser ? PAID_TIER_CREDITS : FREE_TIER_CREDITS,
              type: TransactionType.MONTHLY_REFRESH,
              status: TransactionStatus.COMPLETED,
              metadata: { reason: "Initial credit allocation" },
            },
          });

          results.push({
            userId: user.id,
            action: "CREATED",
            newBalance: newCredit.balance,
          });
          continue;
        }

        // Check if user has ever purchased credits
        const hasPurchaseHistory =
          userCredits.hasPurchaseHistory || userCredits.transactions.length > 0;

        let newBalance = userCredits.balance;
        let transactionType: TransactionType = TransactionType.MONTHLY_REFRESH;
        let amount = 0;

        if (isPaidUser) {
          // Paid users: Add monthly credits to existing balance
          amount = PAID_TIER_CREDITS;
          newBalance += PAID_TIER_CREDITS;
        } else {
          // Free users
          if (!hasPurchaseHistory) {
            // Reset to FREE_TIER_CREDITS if never purchased
            amount = FREE_TIER_CREDITS - userCredits.balance;
            newBalance = FREE_TIER_CREDITS;
            transactionType = TransactionType.MONTHLY_RESET;
          } else if (userCredits.balance > FREE_TIER_CREDITS) {
            // Do nothing if balance is above FREE_TIER_CREDITS
            continue;
          } else if (userCredits.balance > 0) {
            // Top up to FREE_TIER_CREDITS if balance is between 1-5
            amount = FREE_TIER_CREDITS - userCredits.balance;
            newBalance = FREE_TIER_CREDITS;
            transactionType = TransactionType.MONTHLY_TOPUP;
          } else {
            // Reset to FREE_TIER_CREDITS if balance is 0
            amount = FREE_TIER_CREDITS;
            newBalance = FREE_TIER_CREDITS;
            transactionType = TransactionType.MONTHLY_RESET;
          }
        }

        // Update credit record
        await prisma.aICredit.update({
          where: { id: userCredits.id },
          data: {
            balance: newBalance,
            lastRefreshDate: new Date(),
            hasPurchaseHistory: hasPurchaseHistory,
          },
        });

        // Record the transaction if any credits were added
        if (amount !== 0) {
          await prisma.aICreditTransaction.create({
            data: {
              creditId: userCredits.id,
              amount,
              type: transactionType,
              status: TransactionStatus.COMPLETED,
              metadata: {
                reason: "Monthly credit refresh",
                previousBalance: userCredits.balance,
              },
            },
          });
        }

        results.push({
          userId: user.id,
          action: transactionType,
          previousBalance: userCredits.balance,
          newBalance,
          creditsAdded: amount,
        });
      } catch (error) {
        results.push({
          userId: user.id,
          action: "ERROR",
          error: "Failed to process user",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("[CREDIT_REFRESH]", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
}
