"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const tradingPhrases = [
  "Market Analysis",
  "Pattern Recognition",
  "Risk Management",
  "Trading Signals",
  "Portfolio Tracking",
];

// Static content component
function AnnouncementBanner() {
  return (
    <div className="inline-flex items-center rounded-full border bg-white/40 px-6 py-2 backdrop-blur-sm dark:bg-white/5">
      <span className="mr-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/30">
        New
      </span>
      <p className="text-sm text-muted-foreground">
        AI-Powered Trading Assistant Now Available
      </p>
    </div>
  );
}

export default function HeroLanding() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % tradingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-20 md:py-32">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-primary/30 dark:to-blue-500/30">
            <svg
              aria-hidden="true"
              className="dark:fill-white/2.5 absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:stroke-white/5"
            >
              <defs>
                <pattern
                  id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                  width="72"
                  height="56"
                  patternUnits="userSpaceOnUse"
                  x="-12"
                  y="4"
                >
                  <path d="M.5 56V.5H72" fill="none" />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                strokeWidth="0"
                fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
              />
            </svg>
          </div>
          <svg
            viewBox="0 0 1113 440"
            aria-hidden="true"
            className="absolute left-1/2 top-0 ml-[-19rem] w-[69.5625rem] fill-white blur-[26px] dark:hidden"
          >
            <path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
          </svg>
        </div>
      </div>

      <div className="container relative">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:gap-8">
          {/* Announcement banner - Hidden on smallest screens */}
          <div className="hidden sm:block">
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AnnouncementBanner />
              </motion.div>
            ) : (
              <AnnouncementBanner />
            )}
          </div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 px-4 sm:space-y-4 sm:px-0"
          >
            <h1 className="font-urban text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Trader Tracker</span>
              <span className="mt-1 block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-medium text-transparent sm:mt-2 sm:text-3xl md:text-4xl">
                Trading Solutions
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-xl">
              Analyze markets faster with intelligent pattern recognition,
              real-time signals, and automated trading suggestions.
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({
                    variant: "default",
                    size: "lg",
                    className: "min-w-[160px]",
                  }),
                )}
              >
                Get Started →
              </Link>
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "min-w-[160px]",
                  }),
                )}
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards - Redesigned */}
          <div className="w-full max-w-4xl px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-6 sm:grid-cols-3"
            >
              <div className="group relative rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:bg-black/40 dark:hover:border-primary/50">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-white/5">
                    <svg
                      className="size-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">
                      Pattern Recognition
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                      Auto-detect trading patterns with advanced algorithms
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:bg-black/40 dark:hover:border-primary/50">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-white/5">
                    <svg
                      className="size-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 20h.01" />
                      <path d="M7 20v-4" />
                      <path d="M12 20v-8" />
                      <path d="M17 20V8" />
                      <path d="M22 4v16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">
                      Signal Alerts
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                      Real-time trading signals and market notifications
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:bg-black/40 dark:hover:border-primary/50">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-white/5">
                    <svg
                      className="size-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">
                      AI Analysis
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                      Smart market insights powered by machine learning
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Remove the trading chart and animated features for mobile */}
          <div className="hidden sm:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto w-full max-w-3xl"
            >
              <div className="aspect-[16/9] overflow-hidden rounded-xl border bg-white/40 shadow-2xl dark:bg-white/5">
                <Image
                  src="/_static/trading-chart.svg"
                  alt="Trading Chart"
                  width={1200}
                  height={675}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              {/* Floating elements */}
              <motion.div
                className="absolute -right-4 -top-4 rounded-lg border bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">
                    AI Analysis Active
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
