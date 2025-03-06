"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function WelcomeCreditsToast() {
  const { data: session } = useSession();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Skip if we've already shown it in this session
    const hasShownWelcome = localStorage.getItem("hasShownWelcomeCredits");
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");

    // Only show welcome toast if:
    // 1. User has completed onboarding
    // 2. User hasn't seen welcome message yet (in DB)
    // 3. Toast hasn't been shown in this session
    // 4. We have a valid session
    if (
      !hasShownWelcome &&
      hasCompletedOnboarding === "true" &&
      session?.user &&
      !session.user.hasSeenWelcome &&
      !hasShown
    ) {
      toast.custom(
        (t) => (
          <div
            className={cn(
              "pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5",
              "animate-in slide-in-from-top-2",
            )}
          >
            <div className="w-0 flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Coins className="size-5 animate-bounce text-primary" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Welcome Gift! 🎉
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You&apos;ve received 6 AI credits to start analyzing your
                    trades!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-center",
        },
      );

      // Update both localStorage and database
      localStorage.setItem("hasShownWelcomeCredits", "true");
      setHasShown(true);

      // Update database state
      fetch("/api/user/welcome-seen", {
        method: "POST",
      }).catch(console.error);
    }
  }, [session, hasShown]);

  return null;
}
