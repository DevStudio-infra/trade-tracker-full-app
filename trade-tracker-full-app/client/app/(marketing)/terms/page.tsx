import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shell } from "@/components/shells/shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Trade Tracker.",
};

export default function TermsPage() {
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
        <h1 className="font-heading text-3xl md:text-4xl">Terms of Service</h1>
      </div>

      <div className="grid gap-12 md:gap-16">
        {/* Introduction */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">1. Introduction</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Welcome to Trade Tracker. These Terms of Service govern your
              access to and use of our platform, services, and features. By
              accessing or using our services, you agree to be bound by these
              terms and our Privacy Policy.
            </p>
            <p>
              Please read these terms carefully before using our platform. If
              you do not agree with any part of these terms, you may not access
              or use our services.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">2. Services</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Trade Tracker provides AI-powered trading analysis and insights
              through our platform:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Pattern Recognition:</strong> Advanced AI algorithms to
                identify market patterns and trends
              </li>
              <li>
                <strong>Trading Signals:</strong> Real-time alerts and
                notifications for potential trading opportunities
              </li>
              <li>
                <strong>Portfolio Management:</strong> Tools for tracking and
                analyzing your trading performance
              </li>
              <li>
                <strong>Educational Resources:</strong> Comprehensive guides and
                tutorials for trading strategies
              </li>
            </ul>
          </div>
        </section>

        {/* User Obligations */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">3. User Obligations</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>As a user of our services, you agree to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Account Accuracy:</strong> Provide and maintain
                accurate, current, and complete information
              </li>
              <li>
                <strong>Account Security:</strong> Protect your account
                credentials and notify us of any unauthorized access
              </li>
              <li>
                <strong>Legal Compliance:</strong> Use our services in
                accordance with applicable laws and regulations
              </li>
              <li>
                <strong>Ethical Trading:</strong> Not engage in market
                manipulation or illegal trading practices
              </li>
              <li>
                <strong>Platform Security:</strong> Not attempt to reverse
                engineer or compromise our systems
              </li>
            </ul>
          </div>
        </section>

        {/* Subscription and Payments */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            4. Subscription and Payments
          </h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Our service operates on a credit-based system with the following
              terms:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Credit System:</strong> Credits are required for
                accessing premium features and analysis
              </li>
              <li>
                <strong>Free Tier:</strong> Basic access with limited monthly
                credits for essential features
              </li>
              <li>
                <strong>Paid Plans:</strong> Premium subscriptions with
                additional credits and advanced features
              </li>
              <li>
                <strong>Payment Processing:</strong> Secure payment handling
                through Stripe
              </li>
              <li>
                <strong>Refunds:</strong> Handled on a case-by-case basis
                according to our refund policy
              </li>
            </ul>
          </div>
        </section>

        {/* Data and Privacy */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">5. Data and Privacy</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>We prioritize the protection of your data and privacy:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Data Security:</strong> Implementation of
                industry-standard encryption and security measures
              </li>
              <li>
                <strong>Data Usage:</strong> Trading data is used solely for
                authorized platform features
              </li>
              <li>
                <strong>Privacy Controls:</strong> Users maintain control over
                their data sharing preferences
              </li>
              <li>
                <strong>Data Rights:</strong> Users can request data export or
                deletion at any time
              </li>
            </ul>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">6. Disclaimer</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              Trading involves significant risk. Our services are provided
              &quot;as is&quot; without warranties:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>No Guarantees:</strong> We do not guarantee trading
                profits or specific outcomes
              </li>
              <li>
                <strong>User Responsibility:</strong> Users are solely
                responsible for their trading decisions
              </li>
              <li>
                <strong>Information Purpose:</strong> Analysis and signals are
                for informational purposes only
              </li>
              <li>
                <strong>Service Availability:</strong> Platform access may be
                subject to technical limitations
              </li>
            </ul>
          </div>
        </section>

        {/* Termination */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">7. Termination</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>We reserve the right to terminate or suspend accounts that:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Terms Violation:</strong> Breach these terms of service
              </li>
              <li>
                <strong>Fraudulent Activity:</strong> Engage in suspicious or
                fraudulent behavior
              </li>
              <li>
                <strong>Platform Abuse:</strong> Misuse the platform or harass
                other users
              </li>
              <li>
                <strong>Payment Issues:</strong> Fail to pay required fees or
                have payment disputes
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">8. Contact Us</h2>
          <div className="grid gap-4 text-muted-foreground">
            <p>
              If you have any questions about these Terms of Service, please
              reach out to our support team:
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
          By using Trade Tracker, you acknowledge that you have read and agree
          to these Terms of Service. We recommend reviewing these terms
          periodically as they may be updated.
        </div>
      </div>
    </Shell>
  );
}
