"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/trpc/router";

// Create React hooks for tRPC
export const trpc = createTRPCReact<AppRouter>();

// Environment-aware base URL
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // In browser, use relative path
    return "";
  }
  // In SSR or SSG, use the API URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

// TRPCProvider component for wrapping the app
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          // Include credentials like cookies in requests
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
