import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Bot, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Shell } from "@/components/shells/shell";

export const metadata: Metadata = {
  title: "Features - Trade Tracker",
  description:
    "Discover the powerful features of Trade Tracker that help you make better trading decisions.",
};

export default function FeaturesPage() {
  return (
    <Shell as="div" className="gap-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="font-heading text-3xl leading-[1.1] md:text-5xl">
          Powerful Features for
          <span className="bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
            {" "}
            Smart Trading
          </span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Discover tools designed to enhance your trading strategy and improve
          your results.
        </p>
      </section>

      {/* Features Grid */}
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Trading Copilot - Current Feature */}
        <div className="group relative rounded-lg border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" />
          </div>
          <h3 className="mb-2 font-heading text-xl">Trading Copilot</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            AI-powered analysis and real-time insights to help you make informed
            trading decisions.
          </p>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            <li>• Pattern Recognition</li>
            <li>• Market Analysis</li>
            <li>• Trading Signals</li>
            <li>• Risk Assessment</li>
          </ul>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full",
            )}
          >
            Try Now
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <div className="absolute -right-1 -top-1">
            <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
              Available Now
            </span>
          </div>
        </div>

        {/* Bots Marketplace - Coming Soon */}
        <div className="group relative rounded-lg border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Bot className="size-6 text-primary" />
          </div>
          <h3 className="mb-2 font-heading text-xl">Bots Marketplace</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Discover and deploy automated trading bots created by expert traders
            and developers.
          </p>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            <li>• Custom Bot Creation</li>
            <li>• Performance Tracking</li>
            <li>• Risk Management</li>
            <li>• Strategy Marketplace</li>
          </ul>
          <button
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "w-full cursor-not-allowed opacity-70",
            )}
            disabled
          >
            Coming Soon
            <ArrowRight className="ml-2 size-4" />
          </button>
          <div className="absolute -right-1 -top-1">
            <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-yellow-600">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Trading Journal - Coming Soon */}
        <div className="group relative rounded-lg border bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpenCheck className="size-6 text-primary" />
          </div>
          <h3 className="mb-2 font-heading text-xl">Trading Journal</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Track, analyze, and improve your trading performance with detailed
            insights and analytics.
          </p>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            <li>• Trade Tracking</li>
            <li>• Performance Analytics</li>
            <li>• Strategy Analysis</li>
            <li>• Learning Insights</li>
          </ul>
          <button
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "w-full cursor-not-allowed opacity-70",
            )}
            disabled
          >
            Coming Soon
            <ArrowRight className="ml-2 size-4" />
          </button>
          <div className="absolute -right-1 -top-1">
            <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-yellow-600">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* AI Trading Copilot Explanation Section */}
      <section className="mx-auto max-w-4xl rounded-xl border bg-card p-8 shadow-lg">
        <h2 className="font-heading text-2xl md:text-3xl">
          How Our AI Trading Copilot Works
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-lg">
                Real-Time Market Analysis
              </h3>
              <p className="text-muted-foreground">
                Our AI continuously analyzes market data, price patterns, and
                trading volumes to identify potential opportunities and risks in
                real-time.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg">Personalized Insights</h3>
              <p className="text-muted-foreground">
                The AI adapts to your trading style and risk tolerance,
                providing customized recommendations and alerts tailored to your
                preferences.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-lg">Pattern Recognition</h3>
              <p className="text-muted-foreground">
                Advanced machine learning algorithms detect complex market
                patterns and technical indicators that might be missed by human
                traders.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg">Risk Management</h3>
              <p className="text-muted-foreground">
                Get intelligent suggestions for position sizing, stop-loss
                levels, and risk exposure based on market volatility and your
                portfolio.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Note:</span> Our AI
            Copilot is designed to assist and enhance your trading decisions,
            not to replace human judgment. Always conduct your own research and
            risk assessment.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-2xl md:text-3xl">
          Ready to Enhance Your Trading?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start with our Trading Copilot today and be the first to know when new
          features launch.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Get Started
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Contact Sales
          </Link>
        </div>
      </section>
    </Shell>
  );
}
