"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icons } from "@/components/shared/icons";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = {
  title: string;
  description: string;
  icon: keyof typeof Icons;
};

const steps: Step[] = [
  {
    title: "Welcome to Trade Tracker",
    description: "Let's get you set up with your new account.",
    icon: "home",
  },
  {
    title: "Terms of Service",
    description: "Please review and accept our terms of service.",
    icon: "post",
  },
  {
    title: "Privacy Policy",
    description:
      "Review our privacy policy to understand how we handle your data.",
    icon: "settings",
  },
  {
    title: "Preferences",
    description: "Set up your account preferences for a better experience.",
    icon: "settings",
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Wait for session to be stable before showing modal
  useEffect(() => {
    if (status === "loading") {
      setIsReady(false);
      return;
    }

    // Add a small delay to ensure session is stable
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [status]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAcceptTerms(false);
      setAcceptPrivacy(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Don't render anything until ready
  if (!isReady) {
    return null;
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Prevent multiple submissions
      if (isSubmitting) return;
      setIsSubmitting(true);
      setIsLoading(true);

      try {
        // Update user's terms acceptance status
        const response = await fetch("/api/user/accept-terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            acceptTerms: true,
            acceptPrivacy: true,
            hasCompletedOnboarding: true,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update terms acceptance");
        }

        // Update the session to reflect the changes
        await update();

        // Show success message
        toast.success("Welcome to Trade Tracker!", {
          description: "Your account is ready to use.",
        });

        // Close modal and refresh the page
        onClose();

        // Longer delay before refresh to ensure modal is closed and session is updated
        setTimeout(() => {
          router.refresh();
        }, 300);
      } catch (error) {
        console.error("Setup error:", error);
        toast.error("Something went wrong", {
          description:
            "Please try again later or contact support if the issue persists.",
        });
        setIsSubmitting(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Don't handle changes until ready
    if (!isReady) return;

    // Prevent closing if we're in loading state or submitting
    if (isLoading || isSubmitting) {
      return;
    }
    // Only allow closing if user has completed onboarding
    if (!session?.user?.hasCompletedOnboarding) {
      return;
    }
    onClose();
  };

  const currentStepData = steps[currentStep];
  const Icon = Icons[currentStepData.icon];

  return (
    <Dialog
      open={isOpen && isReady}
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="rounded-full bg-muted p-3">
            <Icon className="size-6" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">{currentStepData.title}</h2>
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Step content */}
          <div className="w-full space-y-4 py-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-lg border p-4 text-sm">
                  <h3 className="font-medium">Terms of Service</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>1. Acceptance of Terms</p>
                    <p>
                      By accessing and using Trade Tracker, you agree to be
                      bound by these Terms of Service and all applicable laws
                      and regulations.
                    </p>
                    <p>2. User Responsibilities</p>
                    <p>
                      You are responsible for maintaining the confidentiality of
                      your account and for all activities under your account.
                    </p>
                    <p>3. Service Usage</p>
                    <p>
                      Our services are provided &quot;as is&quot; and we make no
                      warranties about the accuracy or reliability of the
                      platform.
                    </p>
                    <p>4. Data Usage</p>
                    <p>
                      We collect and use data as outlined in our Privacy Policy
                      to provide and improve our services.
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm">
                    I accept the Terms of Service
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-lg border p-4 text-sm">
                  <h3 className="font-medium">Privacy Policy</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>1. Information Collection</p>
                    <p>
                      We collect information you provide directly to us,
                      including registration data, trading preferences, and
                      usage data.
                    </p>
                    <p>2. How We Use Your Information</p>
                    <p>
                      Your information helps us provide personalized trading
                      insights, improve our services, and maintain account
                      security.
                    </p>
                    <p>3. Information Sharing</p>
                    <p>
                      We do not sell your personal information. We may share
                      data with service providers who assist our operations.
                    </p>
                    <p>4. Data Security</p>
                    <p>
                      We implement appropriate security measures to protect your
                      personal information from unauthorized access or
                      disclosure.
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm">I accept the Privacy Policy</label>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose which notifications you&apos;d like to receive.
                  </p>
                  {/* Add notification preferences UI */}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                isLoading ||
                (currentStep === 1 && !acceptTerms) ||
                (currentStep === 2 && !acceptPrivacy)
              }
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Complete"
              ) : (
                "Next"
              )}
            </Button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                      ? "bg-primary/60"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
