export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TransactionType {
  CREDIT_PURCHASE = 'CREDIT_PURCHASE',
  CREDIT_USE = 'CREDIT_USE',
  CREDIT_REFUND = 'CREDIT_REFUND'
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: UserRole;
  credits: number;
  stripeCustomerId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}
