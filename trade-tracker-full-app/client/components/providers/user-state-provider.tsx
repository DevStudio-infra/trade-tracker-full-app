"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { WelcomeCreditsToast } from "@/components/credits/welcome-credits-toast";
import { OnboardingModal } from "@/components/modals/onboarding-modal";

// Paths that don't require terms acceptance
const EXEMPT_PATHS = ["/", "/login", "/register", "/terms", "/privacy"];

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: session, status, update } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      !EXEMPT_PATHS.includes(pathname)
    ) {
      const { hasAcceptedToS, hasAcceptedPrivacy } = session.user;

      // If any required state is false, show the onboarding
      if (!hasAcceptedToS || !hasAcceptedPrivacy) {
        setShowOnboarding(true);
        // Remove localStorage item to ensure modal shows when needed
        localStorage.removeItem("onboardingCompleted");
      }
    }
  }, [session, pathname, status]);

  // Handle onboarding close - only close if all states are properly set
  const handleOnboardingClose = async () => {
    // Refresh session to get latest user state
    await update();

    // Double check all states are true before allowing close
    if (
      session?.user &&
      session.user.hasAcceptedToS &&
      session.user.hasAcceptedPrivacy
    ) {
      setShowOnboarding(false);
      localStorage.setItem("onboardingCompleted", "true");
    } else {
      // If states aren't properly set, keep modal open
      setShowOnboarding(true);
    }
  };

  // Show welcome toast if user hasn't seen it
  const shouldShowWelcome =
    status === "authenticated" && session?.user && !session.user.hasSeenWelcome;

  return (
    <>
      {/* Onboarding Modal for Terms and Privacy */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />

      {/* Welcome Credits Toast */}
      {shouldShowWelcome && <WelcomeCreditsToast />}

      {children}
    </>
  );
}
