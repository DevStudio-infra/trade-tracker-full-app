// Credit costs for different actions
export const ANALYSIS_CREDIT_COST = 1;
export const GUIDANCE_CREDIT_COST = 1;

// Credit limits and thresholds
export const FREE_TIER_CREDITS = 6;
export const PAID_TIER_CREDITS = 100;
export const LOW_CREDITS_WARNING_THRESHOLD = 2;
export const LOW_CREDITS_NOTICE_THRESHOLD = 10;

// Credit management functions
export function hasEnoughCredits(
  currentCredits: number,
  requiredCredits: number,
): boolean {
  return currentCredits >= requiredCredits;
}

export function calculateRemainingCredits(
  currentCredits: number,
  costPerAction: number,
  numberOfActions: number = 1,
): number {
  return Math.max(0, currentCredits - costPerAction * numberOfActions);
}

export function shouldShowLowCreditsWarning(currentCredits: number): boolean {
  return currentCredits <= LOW_CREDITS_WARNING_THRESHOLD;
}

export function shouldShowLowCreditsNotice(currentCredits: number): boolean {
  return (
    currentCredits <= LOW_CREDITS_NOTICE_THRESHOLD &&
    currentCredits > LOW_CREDITS_WARNING_THRESHOLD
  );
}
