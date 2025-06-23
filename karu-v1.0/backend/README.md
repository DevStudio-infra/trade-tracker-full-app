# Kitchen Management Backend

## Overview

This backend has been enhanced with two major changes:

1. **Database Migration**: Migrated from Drizzle ORM to Prisma ORM
2. **Authentication**: Implemented Clerk authentication with proper webhook handling

## Database Migration: Drizzle to Prisma

The backend has been migrated from Drizzle ORM to Prisma ORM for better type safety, schema validation, and development experience.

### Migration Changes

- Replaced Drizzle ORM with Prisma ORM
- Created Prisma schema file based on existing Drizzle schema
- Added repository pattern for better code organization and reusability
- Enhanced tRPC router with improved error handling and additional endpoints

### Benefits of Prisma

- Better type safety and auto-completion
- Improved documentation and developer experience
- Simplified queries with built-in relation handling
- Comprehensive client-side validation
- Simpler transaction handling

## Authentication: Clerk Integration

A robust authentication system has been implemented using Clerk, with special attention to user creation reliability.

### Key Authentication Features

- **Token Validation**: Secures API endpoints with JWT verification
- **Role-Based Access**: Supports staff and admin roles
- **Protected Routes**: tRPC procedures that require authentication
- **Webhook Processing**: Creates and updates users from Clerk events

### Fixing Session Event User Creation

**Previous Issue**: Session events weren't creating users due to schema mismatch with the 'password' column.

**Solution**:
- Updated User schema to match the database (removed password field)
- Added dedicated session.created event handler
- Implemented backup user creation when user.created events are missed
- Added comprehensive logging for webhook debugging

### Authentication Levels

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authentication
- `adminProcedure`: Requires authentication and admin role

## Project Structure

- `/prisma` - Prisma schema and migration files
- `/db` - Database connection and helper functions
- `/repositories` - Repository pattern classes for data access
- `/trpc` - tRPC routers and procedures
- `/middleware` - Authentication middleware
- `/webhooks` - Webhook handlers for external services
- `/utils` - Utility functions
- `/config` - Configuration files
- `/docs` - Documentation files

## Getting Started

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
```
# Copy the .env.example and update the values
cp .env.example .env
```

3. Generate Prisma client:
```
npx prisma generate
```

4. Start the development server:
```
npm run dev
```

## Testing & Validation

### Validating Prisma Setup

Run the validation script to ensure Prisma is working correctly:
```
npx ts-node scripts/validate-prisma.ts
```

### Testing Clerk Integration

Run the Clerk integration test to verify authentication is set up properly:
```
npx ts-node scripts/test-clerk-integration.ts
```

## Environment Variables

```
# Server
PORT=8000

# Database
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# Clerk Authentication
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="your_clerk_webhook_signing_secret"
```

## Development Commands

- `npm run dev` - Start the development server
- `npx prisma studio` - Open Prisma Studio to view and edit data
- `npx prisma db pull` - Update Prisma schema from the database
- `npx prisma generate` - Generate Prisma client after schema changes

## Documentation

Detailed documentation is available in the `/docs` directory:
- [Clerk Authentication](./docs/clerk-authentication.md) - Complete authentication setup details
