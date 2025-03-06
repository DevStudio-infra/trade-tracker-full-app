import { PrismaClient, Prisma } from "@prisma/client";
import { stripe } from "./stripe";
import Stripe from "stripe";

const prisma = new PrismaClient();

export enum CreditOperation {
  SIGNAL_DETECTION = "SIGNAL_DETECTION",
  SIGNAL_CONFIRMATION = "SIGNAL_CONFIRMATION",
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export const CREDIT_COSTS = {
  [CreditOperation.SIGNAL_DETECTION]: 2,
  [CreditOperation.SIGNAL_CONFIRMATION]: 2,
};

interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  operation: string;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}

interface CreditPurchase {
  id: string;
  userId: string;
  amount: number;
  cost: number;
  stripePaymentId?: string;
  status: PurchaseStatus;
  createdAt: Date;
  completedAt?: Date;
}

export class CreditsService {
  private static instance: CreditsService;

  private constructor() {}

  public static getInstance(): CreditsService {
    if (!CreditsService.instance) {
      CreditsService.instance = new CreditsService();
    }
    return CreditsService.instance;
  }

  /**
   * Check if a user has enough credits for an operation
   */
  public async hasEnoughCredits(userId: string, operation: CreditOperation): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.credits >= CREDIT_COSTS[operation];
  }

  /**
   * Deduct credits for an operation
   */
  public async deductCredits(userId: string, operation: CreditOperation, metadata: Record<string, any> = {}): Promise<void> {
    const cost = CREDIT_COSTS[operation];

    // Start a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Get user and check credits
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.credits < cost) {
        throw new Error("Insufficient credits");
      }

      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: { credits: user.credits - cost },
      });

      // Store transaction in memory (until DB schema is updated)
      const transaction: CreditTransaction = {
        id: `${Date.now()}-${userId}`,
        userId,
        amount: -cost,
        operation,
        metadata: JSON.parse(JSON.stringify(metadata)),
        createdAt: new Date(),
      };

      console.log("Credit transaction recorded:", transaction);
    });
  }

  /**
   * Purchase additional credits
   */
  public async purchaseCredits(userId: string, amount: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.subscription) {
      throw new Error("User has no active subscription");
    }

    // Default extra credit prices based on plan
    const extraCreditPrice = user.subscription.plan === "PRO" ? 0.11 : 0.22;
    const cost = amount * extraCreditPrice;

    // Store purchase in memory (until DB schema is updated)
    const purchase: CreditPurchase = {
      id: `${Date.now()}-${userId}`,
      userId,
      amount,
      cost,
      status: PurchaseStatus.PENDING,
      createdAt: new Date(),
    };

    try {
      // Create Stripe payment intent directly
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-02-24.acacia",
      });

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(cost * 100), // Convert to cents
        currency: "eur",
        customer: user.subscription.stripeCustomerId || undefined,
        metadata: {
          purchaseId: purchase.id,
          userId,
          credits: amount,
        },
      });

      purchase.stripePaymentId = paymentIntent.id;
      console.log("Credit purchase initiated:", purchase);
    } catch (error) {
      purchase.status = PurchaseStatus.FAILED;
      console.error("Credit purchase failed:", purchase);
      throw error;
    }
  }

  /**
   * Complete a credit purchase after successful payment
   */
  public async completePurchase(purchaseId: string): Promise<void> {
    // This is a simplified version until DB schema is updated
    const [timestamp, userId] = purchaseId.split("-");

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Update user credits (amount would come from stored purchase in real implementation)
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: 10 } }, // Default amount for testing
      });

      console.log("Credit purchase completed:", { purchaseId, userId });
    });
  }

  /**
   * Recharge monthly credits for a user
   */
  public async rechargeMonthlyCredits(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user || !user.subscription) {
        throw new Error("User or subscription not found");
      }

      const monthlyCredits = user.subscription.plan === "PRO" ? 100 : 6;

      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: monthlyCredits,
          lastCreditRecharge: new Date(),
        },
      });

      // Store transaction in memory (until DB schema is updated)
      const transaction: CreditTransaction = {
        id: `${Date.now()}-${userId}`,
        userId,
        amount: monthlyCredits,
        operation: "MONTHLY_RECHARGE",
        metadata: {
          plan: user.subscription.plan,
          rechargeDate: new Date().toISOString(),
        },
        createdAt: new Date(),
      };

      console.log("Monthly credit recharge recorded:", transaction);
    });
  }

  /**
   * Get credit usage analytics for a user
   */
  public async getUserCreditAnalytics(userId: string, startDate: Date, endDate: Date) {
    // This is a simplified version until DB schema is updated
    // In real implementation, this would query the creditTransactions table
    return {
      transactions: [],
      usage: {},
      totalUsed: 0,
      totalAdded: 0,
      netChange: 0,
    };
  }
}

export const creditsService = CreditsService.getInstance();
