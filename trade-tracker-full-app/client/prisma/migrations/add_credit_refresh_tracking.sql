-- Add lastRefreshDate to AICredit table
ALTER TABLE "ai_credits" ADD COLUMN "lastRefreshDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "ai_credits" ADD COLUMN "hasPurchaseHistory" BOOLEAN NOT NULL DEFAULT false;

-- Add new transaction types for monthly credit operations
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'MONTHLY_REFRESH';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'MONTHLY_RESET';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'MONTHLY_TOPUP';
