# Database Operations Migration Tasks

This document lists all database operations that need to be migrated from the Next.js client to the Express server.

## User Management

- [x] User Operations
  - [x] Delete user (`/api/user/route.ts`)
  - [x] Update user welcome seen status (`/api/user/welcome-seen/route.ts`)
  - [x] Update user terms acceptance (`/api/user/accept-terms/route.ts`)
  - [x] Update user privacy acceptance (`/api/user/accept-privacy/route.ts`)
  - [x] Find user by ID (`/lib/user.ts`)
  - [x] Find user by subscription (`/lib/subscription.ts`)

## Analysis Sessions

- [x] Session Management
  - [x] Find session by ID (`/api/sessions/[id]/route.ts`)
  - [x] Update session (`/api/sessions/[id]/route.ts`)
  - [x] Delete session (`/api/sessions/[id]/route.ts`)
  - [x] List all sessions (`/api/sessions/route.ts`)
  - [x] Create new session (`/api/sessions/route.ts`)
  - [x] Create analysis record (`/api/analyze/route.ts`)
  - [x] Update session with analysis results (`/api/analyze/route.ts`)

## Credits System

- [x] Credit Management
  - [x] Find credit balance (`/api/credits/[userId]/balance/route.ts`)
  - [x] Create new credit record (`/api/credits/[userId]/balance/route.ts`)
  - [x] Get credit history (`/api/credits/[userId]/history/route.ts`)
  - [x] Use credits (`/api/credits/[userId]/use/route.ts`)
  - [x] Refresh credits (`/api/credits/refresh/route.ts`)
  - [x] Create credit transactions (`/api/credits/[userId]/use/route.ts`)

## Newsletter

- [x] Newsletter Management
  - [x] Find subscriber (`/api/newsletter/route.ts`)
  - [x] Create subscriber (`/api/newsletter/route.ts`)
  - [x] List all subscribers (`/api/newsletter/route.ts`)

## Knowledge Base

- [x] Knowledge Base Operations
  - [x] Execute raw queries for knowledge base (`/api/knowledge/route.ts`)
  - [x] Update knowledge base items (`/api/knowledge/[id]/route.ts`)
  - [x] Create RAG feedback (`/lib/feedback/rag-feedback.ts`)
  - [x] Manage knowledge usage metrics (`/lib/feedback/rag-feedback.ts`)

## Trading Patterns

- [x] Create trading pattern (`/api/trading-patterns/route.ts`)
- [x] Update trading pattern (`/api/trading-patterns/[id]/route.ts`)
- [x] Delete trading pattern (`/api/trading-patterns/[id]/route.ts`)
- [x] Find similar patterns (`/api/trading-patterns/search/route.ts`)

## Stripe Integration

- [x] Webhook Handling
  - [x] Update AI credits (`/api/webhooks/stripe/route.ts`)
  - [x] Create credit transactions (`/api/webhooks/stripe/route.ts`)
  - [x] Update user subscription status (`/api/webhooks/stripe/route.ts`)

## Migration Steps for Each Operation

For each operation above:

1. [ ] Create corresponding route in Express server
2. [ ] Move database logic to appropriate service class
3. [ ] Update client API calls to use new server endpoints
4. [ ] Add proper error handling and validation
5. [ ] Add authentication middleware
6. [ ] Test the migrated endpoint
7. [ ] Update TypeScript types and interfaces
8. [ ] Add logging and monitoring
9. [ ] Document the new endpoint

## General Tasks

- [ ] Set up proper error handling middleware in Express
- [ ] Create service classes for different domains (UserService, CreditService, etc.)
- [ ] Set up request validation using Zod or similar
- [ ] Add proper logging system
- [ ] Set up monitoring for database operations
- [ ] Create TypeScript interfaces for all data models
- [ ] Document all new API endpoints
- [ ] Create tests for all new endpoints
- [ ] Set up CI/CD pipeline for the server

## Notes

- All database operations should be moved to the server side
- Client should only interact with the server through REST API
- Use proper error handling and validation
- Maintain transaction integrity where needed
- Follow REST best practices
- Document all API endpoints
