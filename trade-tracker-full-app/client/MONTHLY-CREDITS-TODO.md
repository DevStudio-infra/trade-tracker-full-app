# Monthly Credits System Implementation

## Overview

This system will handle the monthly credit allocation for both free and paid users:

### Free Tier Rules

- Reset to 6 credits if user has not purchased any credits
- If user has purchased credits:
  - Do nothing if balance > 6
  - Top up to 6 if balance is between 1-5
  - Reset to 6 if balance is 0

### Paid Tier Rules

- Add 100 credits to current balance monthly
- No maximum limit
- Credits accumulate (don't reset)

## Implementation Tasks

### 1. Database Updates

- [ ] Create new table/columns for tracking:
  - Last credit refresh date
  - Credit purchase history flag
  - Credit source (subscription/purchase/initial)

### 2. API Endpoint Creation

- [ ] Create `/api/credits/refresh` endpoint
  - Implement credit refresh logic
  - Add security measures
  - Add logging for tracking
- [ ] Create credit update transaction types:
  - `MONTHLY_REFRESH`
  - `MONTHLY_RESET`
  - `MONTHLY_TOPUP`

### 3. Credit Processing Logic

- [ ] Implement user tier check (free vs paid)
- [ ] Implement credit calculation logic:
  ```typescript
  if (isPaidUser) {
    // Add 100 credits to existing balance
  } else {
    if (hasNeverPurchased) {
      // Reset to 6
    } else if (balance > 6) {
      // Do nothing
    } else if (balance > 0 && balance < 6) {
      // Top up to 6
    } else {
      // Reset to 6
    }
  }
  ```
- [ ] Add transaction records for all credit changes

### 4. Cron Job Setup (cron-job.org)

- [ ] Create secure endpoint for cron job to hit
- [ ] Set up cron job on cron-job.org:
  - Schedule: First day of each month
  - Method: POST
  - Headers: Include API key
  - Error handling
  - Retry logic

### 5. Testing

- [ ] Unit tests for credit calculation logic
- [ ] Integration tests for API endpoint
- [ ] Test scenarios:
  - Free user with no purchases
  - Free user with previous purchases
  - Free user with varying credit amounts
  - Paid user credit addition
  - Edge cases (0 credits, max credits, etc.)

### 6. Monitoring & Logging

- [ ] Add detailed logging for:
  - Credit updates
  - Errors
  - User tier changes
- [ ] Set up alerts for:
  - Failed credit updates
  - System errors
  - Unusual patterns

### 7. User Communication

- [ ] Email notifications for:
  - Monthly credit updates
  - Credit top-ups
  - Credit resets
- [ ] UI updates to show:
  - Next credit refresh date
  - Credit history with source

### 8. Documentation

- [ ] API documentation
- [ ] System architecture documentation
- [ ] Monitoring and maintenance procedures
- [ ] Troubleshooting guide

## Security Considerations

- Secure the cron job endpoint
- Validate all credit operations
- Prevent duplicate credit allocations
- Transaction logging for audit trail

## Future Improvements

- Consider timezone handling for global users
- Add credit expiry system
- Implement credit usage analytics
- Add custom credit amounts for different paid tiers
