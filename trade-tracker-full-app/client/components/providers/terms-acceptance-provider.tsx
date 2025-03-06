"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { OnboardingModal } from "@/components/modals/onboarding-modal";

// Paths that don't require terms acceptance
const EXEMPT_PATHS = ["/", "/login", "/register", "/terms", "/privacy"];

export function TermsAcceptanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // Check if onboarding was completed in this session
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");

    // Only check when the session is loaded and onboarding hasn't been completed
    if (
      status === "authenticated" &&
      session?.user &&
      !hasCompletedOnboarding &&
      (!session.user.hasAcceptedToS || !session.user.hasAcceptedPrivacy) &&
      !EXEMPT_PATHS.includes(pathname)
    ) {
      setShowModal(true);
    }
  }, [session, pathname, status]);

  // Force modal to stay closed after user action and mark as completed
  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem("onboardingCompleted", "true");
  };

  return (
    <>
      <OnboardingModal isOpen={showModal} onClose={handleClose} />
      {children}
    </>
  );
}
