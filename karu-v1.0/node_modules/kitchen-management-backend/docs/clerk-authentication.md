# Clerk Authentication Integration

This document outlines how Clerk authentication has been integrated into the backend of the application.

## Overview

Clerk is used for authentication in this application, with the following components:

1. **Prisma Schema**: User model updated to support Clerk authentication
2. **Authentication Middleware**: Validates Clerk session tokens
3. **Webhook Handler**: Processes Clerk events to create and update users
4. **Protected Routes**: tRPC procedures that require authentication

## Prisma Schema Update

The User model has been updated to support Clerk authentication:

```prisma
model User {
  // ...other fields
  clerkId   String    @unique @map("clerk_id")
  imageUrl  String?   @map("image_url")
  // ...other fields
}
```

Note that the `password` field has been removed from the User model as Clerk handles authentication, avoiding the schema mismatch issue that previously prevented user creation from session events.

## Authentication Middleware

Authentication is handled through two mechanisms:

1. **Express Middleware**: For REST API routes
2. **tRPC Middleware**: For tRPC procedures

### tRPC Authentication

Three types of procedures are available:

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authentication
- `adminProcedure`: Requires authentication and admin role

## Webhook Handler

A webhook handler processes events from Clerk to create and update users:

```typescript
// Important events
- user.created: Creates a new user in the database
- user.updated: Updates existing user data
- session.created: Ensures a user exists even if user.created events are missed
```

### Session.created Fallback Mechanism

Based on past issues, we've implemented a robust fallback mechanism for session.created events:

1. When a session.created event is received, we check if the user exists
2. If the user doesn't exist, we fetch user details from Clerk API
3. If Clerk API fails, we create a minimal user record with just the clerk_id and email

This ensures users are always created in the database, even if user.created events don't make it through from Clerk. This fixes the previous issue where session.created events were failing to persist users due to a schema mismatch.

## Environment Variables

The following environment variables need to be set for Clerk integration:

```
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="your_clerk_webhook_signing_secret"
```

## API Endpoints

### Webhook Endpoint

The webhook endpoint is available at:

```
POST /api/webhooks/clerk
```

This endpoint is specially configured to handle raw JSON and verifies the webhook signature before processing events.

### Protected Endpoints

All endpoints that create, update, or delete data are protected and require authentication. Public endpoints include:

- Getting all recipes
- Getting recipe by id
- Getting all menus
- Getting menu by id

## Frontend Integration

For the frontend implementation, follow these steps:

1. Install the Clerk Next.js package: `npm install @clerk/nextjs`
2. Create a `middleware.ts` file in the src directory (App Router approach):

```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

3. Wrap your application with ClerkProvider in app/layout.tsx:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

4. Use Clerk components for sign-in and user profile:

```typescript
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Example usage in a navbar component
<div>
  <SignedOut>
    <SignInButton />
    <SignUpButton />
  </SignedOut>
  <SignedIn>
    <UserButton />
  </SignedIn>
</div>
```

5. Add the session token to your API requests:

```typescript
import { useAuth } from "@clerk/nextjs";

// Inside your component
const { getToken } = useAuth();

// When making requests to your backend
const fetchData = async () => {
  const token = await getToken();
  
  const response = await fetch('/api/your-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Process response
};
```

## Troubleshooting

If user creation fails, check:

1. Webhook events in the Clerk dashboard
2. Backend logs for webhook processing
3. Ensure no schema mismatch between Prisma schema and database
4. Verify the `session.created` event handler is working properly
5. Check that the webhook URL is properly configured in Clerk dashboard
6. Make sure the webhook secret is correctly set in environment variables

## Security Considerations

1. Always validate the webhook signature
2. Never expose sensitive Clerk keys in the frontend
3. Implement proper authorization checks for all protected routes
4. Regularly rotate webhook signing secrets
