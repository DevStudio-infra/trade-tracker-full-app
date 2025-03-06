import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Icons } from "@/components/shared/icons";

function SignInModal({
  showSignInModal,
  setShowSignInModal,
  theme,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
  theme: string;
}) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSignInClicked(true);
    setError(null);
    try {
      const result = await signIn("resend", {
        email: email.toLowerCase(),
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error("Something went wrong.", {
          description: "Your sign in request failed. Please try again.",
        });
      } else {
        setIsEmailSent(true);
        toast.success("Check your email", {
          description:
            "We sent you a login link. Be sure to check your spam too.",
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setSignInClicked(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("[GOOGLE_SIGN_IN_ERROR]", error);
      toast.error("An error occurred during sign in. Please try again.");
    }
  };

  return (
    <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Access your account and start trading smarter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {!isEmailSent ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={signInClicked}
                />
              </div>
              <Button
                type="submit"
                variant="default"
                disabled={signInClicked || !email}
                className="w-full"
              >
                {signInClicked ? (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 size-4" />
                )}
                Sign in with Email
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="rounded-md bg-green-50 p-4 text-green-800">
                <p>Check your email!</p>
                <p className="mt-1 text-sm">
                  We sent you a magic link to {email}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [theme, setTheme] = useState("dark");

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
        theme={theme}
      />
    );
  }, [showSignInModal, setShowSignInModal, theme]);

  return useMemo(
    () => ({
      setShowSignInModal,
      SignInModal: SignInModalCallback,
    }),
    [setShowSignInModal, SignInModalCallback],
  );
}
