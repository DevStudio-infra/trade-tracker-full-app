"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { Icons } from "@/components/shared/icons";

export default function ContactPage() {
  return (
    <div className="container flex max-w-6xl flex-col gap-8 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col items-center gap-4 text-center md:max-w-[58rem]">
        <h2 className="font-urban text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Let&apos;s Talk Trading
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Whether you have questions about our AI trading analysis, need
          technical support, or want to learn more about our services,
          we&apos;re here to assist you.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold">Connect With Us</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icons.help className="size-5" />
                <span>Support team available Monday to Friday</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Icons.messages className="size-5" />
                <span>Response within 24 hours</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold">Follow Our Journey</h3>
            <div className="flex gap-4">
              <Link
                href="https://twitter.com/TheTradeTacker"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Icons.twitter className="size-5" />
                <span>@TheTradeTacker</span>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Follow us for trading insights, feature updates, and community
              highlights
            </p>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-900/10 dark:to-blue-900/20">
            <h3 className="mb-2 text-xl font-semibold">
              Upgrade to Pro Support
            </h3>
            <p className="mb-4 text-muted-foreground">
              Get priority support and faster response times with our Pro plan.
            </p>
            <Link href="/pricing">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Explore Pro Benefits
                <Icons.arrowRight className="size-4" />
              </span>
            </Link>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex-1 p-6">
            <h3 className="mb-6 text-xl font-semibold">Send Us a Message</h3>
            <ContactForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
