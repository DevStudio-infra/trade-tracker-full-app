import { describe, expect, it, vi, beforeEach } from "vitest";
import { calculateCredits, createCreditPurchase, deductCredits, getUserCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// Mock Prisma and Stripe
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    aICredit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    aICreditTransaction: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("Credit System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateCredits", () => {
    it("should calculate correct number of credits for non-subscribers", async () => {
      const amount = 10; // 10 EUR
      const hasSubscription = false;
      const credits = await calculateCredits(amount, hasSubscription);
      expect(credits).toBe(Math.floor(10 / 0.38)); // ~26 credits
    });

    it("should apply 30% discount for subscribers", async () => {
      const amount = 10; // 10 EUR
      const hasSubscription = true;
      const credits = await calculateCredits(amount, hasSubscription);
      expect(credits).toBe(Math.floor(10 / (0.38 * 0.7))); // ~37 credits
    });
  });

  describe("createCreditPurchase", () => {
    const mockUser = {
      id: "user-123",
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
    };

    const mockCreditRecord = {
      id: "credit-123",
      userId: "user-123",
      balance: 0,
    };

    const mockTransaction = {
      id: "transaction-123",
      creditId: "credit-123",
      amount: 26,
      type: "PURCHASE",
      status: "PENDING",
    };

    beforeEach(() => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.aICredit.upsert as any).mockResolvedValue(mockCreditRecord);
      (prisma.aICreditTransaction.create as any).mockResolvedValue(mockTransaction);
    });

    it("should create a credit purchase for non-subscribers", async () => {
      const purchase = await createCreditPurchase({
        amount: 10,
        userId: "user-123",
      });

      expect(purchase.credits).toBe(Math.floor(10 / 0.38));
      expect(purchase.amount).toBe(10);
      expect(prisma.aICredit.upsert).toHaveBeenCalled();
      expect(prisma.aICreditTransaction.create).toHaveBeenCalled();
    });

    it("should create a credit purchase with subscription discount", async () => {
      const subscribedUser = {
        ...mockUser,
        stripeSubscriptionId: "sub-123",
        stripeCurrentPeriodEnd: new Date(Date.now() + 86400000), // tomorrow
      };
      (prisma.user.findUnique as any).mockResolvedValue(subscribedUser);

      const purchase = await createCreditPurchase({
        amount: 10,
        userId: "user-123",
      });

      expect(purchase.credits).toBe(Math.floor(10 / (0.38 * 0.7)));
      expect(purchase.amount).toBe(10);
    });
  });

  describe("deductCredits", () => {
    const mockCreditRecord = {
      id: "credit-123",
      userId: "user-123",
      balance: 100,
    };

    beforeEach(() => {
      (prisma.aICredit.findUnique as any).mockResolvedValue(mockCreditRecord);
      (prisma.aICredit.update as any).mockResolvedValue({
        ...mockCreditRecord,
        balance: 90,
      });
    });

    it("should deduct credits from user balance", async () => {
      await deductCredits("user-123", 10);

      expect(prisma.aICredit.update).toHaveBeenCalledWith({
        where: { id: "credit-123" },
        data: {
          balance: {
            decrement: 10,
          },
          transactions: {
            create: {
              amount: -10,
              type: "USAGE",
              status: "COMPLETED",
            },
          },
        },
      });
    });

    it("should throw error if insufficient credits", async () => {
      (prisma.aICredit.findUnique as any).mockResolvedValue({
        ...mockCreditRecord,
        balance: 5,
      });

      await expect(deductCredits("user-123", 10)).rejects.toThrow("Insufficient credits");
    });
  });

  describe("getUserCredits", () => {
    it("should return user credit balance", async () => {
      (prisma.aICredit.findUnique as any).mockResolvedValue({
        balance: 50,
      });

      const balance = await getUserCredits("user-123");
      expect(balance).toBe(50);
    });

    it("should return 0 if no credit record exists", async () => {
      (prisma.aICredit.findUnique as any).mockResolvedValue(null);

      const balance = await getUserCredits("user-123");
      expect(balance).toBe(0);
    });
  });
});
