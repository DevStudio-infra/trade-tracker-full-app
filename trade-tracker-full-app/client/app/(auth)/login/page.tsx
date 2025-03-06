"use client";

import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Icons } from "@/components/shared/icons";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { theme } = useTheme();

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 size-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-md sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Image
            src={
              theme === "dark"
                ? "/_static/favicons/t2white.png"
                : "/_static/favicons/t2black.png"
            }
            alt="Trade Tracker Logo"
            width={64}
            height={64}
            className="mx-auto"
          />
          <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Access your account and start trading smarter.
          </p>
        </div>

        {error === "OAuthAccountNotLinked" && (
          <Alert variant="destructive">
            <AlertTitle>Account Not Linked</AlertTitle>
            <AlertDescription>
              The Google account is not linked to any existing account. Please
              sign in with your email and link your Google account in the
              settings.
            </AlertDescription>
          </Alert>
        )}

        <Suspense>
          <UserAuthForm />
        </Suspense>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
