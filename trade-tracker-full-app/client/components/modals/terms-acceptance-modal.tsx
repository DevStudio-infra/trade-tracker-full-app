"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "@/components/shared/icons";

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAcceptanceModal({
  isOpen,
  onClose,
}: TermsAcceptanceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const acceptTerms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept terms");
      }

      toast.success("Terms accepted successfully");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Failed to accept terms. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const declineTerms = () => {
    router.push("/");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Terms of Service Update</DialogTitle>
          <DialogDescription>
            Please review and accept our terms of service to continue using the
            platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-md border p-4 text-sm text-muted-foreground">
            <p>
              Welcome to Trade Tracker. These Terms of Service govern your
              access to and use of our platform, services, and features.
            </p>
            <p>Key points:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Service Usage:</strong> Our platform provides AI-powered
                trading analysis and insights
              </li>
              <li>
                <strong>User Obligations:</strong> You agree to provide accurate
                information and use the service legally
              </li>
              <li>
                <strong>Data Privacy:</strong> We protect your data and respect
                your privacy rights
              </li>
              <li>
                <strong>Subscription:</strong> Service operates on a
                credit-based system with various tiers
              </li>
            </ul>
            <p className="pt-2">
              By accepting, you acknowledge that you have read and agree to our
              full{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={declineTerms} disabled={isLoading}>
            Decline
          </Button>
          <Button onClick={acceptTerms} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Accept Terms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
