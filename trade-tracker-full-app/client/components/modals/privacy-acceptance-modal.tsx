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

interface PrivacyAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyAcceptanceModal({
  isOpen,
  onClose,
}: PrivacyAcceptanceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const acceptPrivacy = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/accept-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept privacy policy");
      }

      toast.success("Privacy policy accepted successfully");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Failed to accept privacy policy. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const declinePrivacy = () => {
    router.push("/");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Privacy Policy Update</DialogTitle>
          <DialogDescription>
            Please review and accept our privacy policy to continue using the
            platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-md border p-4 text-sm text-muted-foreground">
            <p>
              At Trade Tracker, we take your privacy seriously. This policy
              explains how we handle your data:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Data Collection:</strong> We collect personal
                information, usage data, and trading patterns
              </li>
              <li>
                <strong>Data Usage:</strong> Your data helps us provide and
                improve our services
              </li>
              <li>
                <strong>Data Protection:</strong> We use industry-standard
                security measures
              </li>
              <li>
                <strong>Your Rights:</strong> You can access, modify, or delete
                your data
              </li>
            </ul>
            <p className="pt-2">
              By accepting, you acknowledge that you have read and agree to our
              full{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={declinePrivacy}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button onClick={acceptPrivacy} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Accept Privacy Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
