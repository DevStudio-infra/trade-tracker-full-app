export const creditConfig = {
  // Base pricing
  BASE_PRICE: 0.22, // Base price per credit for free users
  PRO_DISCOUNT: 0.35, // 35% discount for Pro users

  // Monthly allocations
  FREE_TIER_CREDITS: 6,
  PAID_TIER_CREDITS: 100,

  // Purchase limits
  MIN_PURCHASE_AMOUNT: 6, // Minimum purchase in EUR
  MAX_PURCHASE_AMOUNT: 1000, // Maximum purchase in EUR

  // Credit costs for different actions
  ANALYSIS_CREDIT_COST: 1,
  GUIDANCE_CREDIT_COST: 1,

  // Thresholds
  LOW_CREDITS_WARNING_THRESHOLD: 2,
  LOW_CREDITS_NOTICE_THRESHOLD: 10,

  // Stripe Price IDs for credit purchases
  STRIPE_PRICES: {
    CREDITS: {
      FREE: process.env.NEXT_PUBLIC_STRIPE_FREE_CREDITS_PRICE_ID, // Price ID for standard rate (0.22€)
      PRO: process.env.NEXT_PUBLIC_STRIPE_PRO_CREDITS_PRICE_ID, // Price ID for pro rate (0.143€)
    },
  },
} as const;

// Helper functions
export const calculateCreditPrice = (isPro: boolean) => {
  return isPro
    ? creditConfig.BASE_PRICE * (1 - creditConfig.PRO_DISCOUNT)
    : creditConfig.BASE_PRICE;
};

export const calculateCreditsFromAmount = (amount: number, isPro: boolean) => {
  const pricePerCredit = calculateCreditPrice(isPro);
  return Math.floor(amount / pricePerCredit);
};

export const formatCreditPrice = (price: number) => {
  return `${price.toFixed(2)}€`;
};
