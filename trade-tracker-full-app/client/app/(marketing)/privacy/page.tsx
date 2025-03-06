import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shell } from "@/components/shells/shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy and data protection information for Trade Tracker.",
};

export default function PrivacyPage() {
  return (
    <Shell as="div" className="gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground",
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
          <time
            className="text-sm text-muted-foreground"
            dateTime={new Date().toISOString()}
          >
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl">Privacy Policy</h1>
      </div>

      <div className="grid gap-12 md:gap-16">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">1. Introduction</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              At Trade Tracker, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              platform.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            2. Information We Collect
          </h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>We collect several types of information, including:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address, and
                profile information you provide
              </li>
              <li>
                <strong>Usage Data:</strong> How you interact with our platform,
                features used, and time spent
              </li>
              <li>
                <strong>Trading Data:</strong> Trading patterns, analysis
                requests, and portfolio information
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type,
                device information, and cookies
              </li>
            </ul>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            3. How We Use Your Information
          </h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>We use the collected information for:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Service Provision:</strong> Delivering our AI-powered
                trading analysis and insights
              </li>
              <li>
                <strong>Personalization:</strong> Customizing your experience
                and providing tailored recommendations
              </li>
              <li>
                <strong>Communication:</strong> Sending you updates, alerts, and
                support messages
              </li>
              <li>
                <strong>Improvement:</strong> Enhancing our platform and
                developing new features
              </li>
            </ul>
          </div>
        </section>

        {/* Data Protection */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">4. Data Protection</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>We implement robust security measures including:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Encryption:</strong> All sensitive data is encrypted in
                transit and at rest
              </li>
              <li>
                <strong>Access Controls:</strong> Strict access controls and
                authentication requirements
              </li>
              <li>
                <strong>Regular Audits:</strong> Continuous monitoring and
                security assessments
              </li>
              <li>
                <strong>Data Backups:</strong> Regular backups with secure
                off-site storage
              </li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">5. Your Rights</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>You have the right to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Access:</strong> Request copies of your personal data
              </li>
              <li>
                <strong>Rectification:</strong> Correct any inaccurate
                information
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your data
                (&quot;right to be forgotten&quot;)
              </li>
              <li>
                <strong>Portability:</strong> Receive and transfer your data to
                another controller
              </li>
            </ul>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">6. Cookies</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>Our cookie policy includes:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for basic platform
                functionality
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how you
                use our platform
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and
                preferences
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Help us provide relevant
                content (can be disabled)
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">7. Contact Us</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              If you have any questions about our Privacy Policy or data
              practices, please contact us:
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-2",
                )}
              >
                Contact Support
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        <div className="text-center text-sm text-muted-foreground">
          This privacy policy was last updated on{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          . We will notify you of any changes by posting the new policy on this
          page.
        </div>
      </div>
    </Shell>
  );
}
