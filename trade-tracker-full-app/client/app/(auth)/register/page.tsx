"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Icons } from "@/components/shared/icons";

export default function RegisterPage() {
  const { theme } = useTheme();

  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        Login
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <Suspense>
            <UserAuthForm type="register" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
