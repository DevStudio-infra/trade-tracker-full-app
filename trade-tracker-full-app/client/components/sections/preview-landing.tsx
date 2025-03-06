"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Code2, MessageSquare, Sparkles, Terminal } from "lucide-react";

const TradingChart = () => {
  // Main price data with smoother curve
  const pricePoints = [35, 38, 36, 42, 38, 40, 44, 41, 45, 48, 46, 50];
  const priceString = pricePoints
    .map((p, i) => `${(i * 400) / (pricePoints.length - 1)},${180 - p * 2.5}`)
    .join(" ");

  // Create smooth curve using bezier
  const smoothLine = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return "";
    const path: (string | number)[] = [];
    path.push("M", points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;

      path.push("C", midX, current.y, midX, next.y, next.x, next.y);
    }
    return path.join(" ");
  };

  const curvePoints = pricePoints.map((p, i) => ({
    x: (i * 400) / (pricePoints.length - 1),
    y: 180 - p * 2.5,
  }));

  return (
    <svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      style={{
        filter: "drop-shadow(0 0 1px rgba(0,0,0,0.05))",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <pattern
        id="grid"
        x="0"
        y="0"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.03"
        />
      </pattern>
      <rect width="400" height="200" fill="url(#grid)" />

      {/* Price area gradient */}
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.12" />
          <stop
            offset="100%"
            stopColor="rgb(56, 189, 248)"
            stopOpacity="0.01"
          />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Area fill */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        d={`${smoothLine(curvePoints)} L 400,200 L 0,200 Z`}
        fill="url(#areaGradient)"
      />

      {/* Main line */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        d={smoothLine(curvePoints)}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1.5"
        style={{ filter: "url(#glow)" }}
      />

      {/* Interactive points */}
      {pricePoints.map((p, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5 + i * 0.1 }}
        >
          <circle
            cx={(i * 400) / (pricePoints.length - 1)}
            cy={180 - p * 2.5}
            r="2"
            className="fill-sky-400"
            style={{ filter: "url(#glow)" }}
          />
        </motion.g>
      ))}

      {/* Glass card with current stats */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <rect
          x="280"
          y="20"
          width="100"
          height="50"
          rx="8"
          fill="rgba(255,255,255,0.03)"
          className="stroke-white/10"
          strokeWidth="0.5"
        />
        <text
          x="330"
          y="45"
          textAnchor="middle"
          className="fill-sky-400 text-xs font-medium"
        >
          $48,234.21
        </text>
        <text
          x="330"
          y="60"
          textAnchor="middle"
          className="fill-green-400 text-xs"
        >
          +2.4%
        </text>
      </motion.g>

      {/* Time markers */}
      <g className="text-xs text-muted-foreground/40">
        <text x="0" y="195">
          1D
        </text>
        <text x="190" y="195" textAnchor="middle">
          1W
        </text>
        <text x="380" y="195" textAnchor="end">
          1M
        </text>
      </g>
    </svg>
  );
};

const ScoreChart = () => {
  return (
    <motion.div className="flex h-full items-center gap-3">
      <div className="flex flex-1 flex-col gap-4">
        {[
          { score: 92, label: "Bull Flag" },
          { score: 87, label: "Support Level" },
          { score: 78, label: "Volume Trend" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="font-medium text-sky-400"
              >
                {item.score}%
              </motion.span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{
                  delay: 0.4 + i * 0.1,
                  duration: 1,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const SignalIndicator = () => {
  const signals = [
    "Bull Flag Detected",
    "Strong Support Level",
    "Volume Breakout",
    "Trend Continuation",
    "Momentum Building",
  ];

  return (
    <div className="relative h-6 overflow-hidden">
      {signals.map((signal, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-20, 0, 0, 20] }}
          transition={{
            duration: 3,
            delay: i * 3,
            repeat: Infinity,
            repeatDelay: signals.length * 3 - 3,
          }}
          className="absolute inset-x-0 flex items-center justify-between text-xs"
        >
          <span className="font-medium text-sky-400">{signal}</span>
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-400">
            85%
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default function PreviewLanding() {
  return (
    <section className="overflow-hidden bg-background py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl">
            AI-Powered Trading Assistant
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Analyze markets faster with intelligent pattern recognition,
            real-time signals, and automated trading suggestions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-12 max-w-[65rem]"
        >
          {/* IDE Preview */}
          <div className="relative z-0 rounded-xl bg-secondary/30 p-3 shadow-2xl ring-1 ring-secondary/60 dark:bg-secondary/20">
            <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500" />
              <div className="size-2.5 rounded-full bg-yellow-500" />
              <div className="size-2.5 rounded-full bg-green-500" />
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-background">
              <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/30 backdrop-blur-sm">
                <div className="flex h-full">
                  {/* File Explorer - reduced width */}
                  <div className="w-44 border-r bg-card/50">
                    <div className="p-3">
                      <div className="h-6 w-24 rounded bg-muted/50" />
                      <div className="mt-4 space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="h-3 w-full rounded bg-muted/30"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-3">
                    <div className="grid h-full grid-rows-2 gap-3">
                      {/* Score Chart Section */}
                      <div className="rounded-lg border bg-card/50 p-3">
                        <div className="flex h-full flex-col">
                          <ScoreChart />
                          <SignalIndicator />
                        </div>
                      </div>

                      {/* Chart Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-lg border bg-card/50 p-3"
                      >
                        <div className="h-full">
                          <TradingChart />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* AI Suggestions Panel - reduced width */}
                  <div className="ml-3 w-60 rounded-lg border bg-card/80 p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <div className="text-xs font-medium">AI Analysis</div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 + i * 0.2 }}
                          className="h-16 rounded-md bg-muted/20 p-2"
                        >
                          <div className="h-2 w-3/4 rounded bg-muted/30" />
                          <div className="mt-2 h-8 rounded bg-muted/20" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute -right-4 top-8 z-10 w-60 space-y-3"
          >
            {[
              {
                icon: Code2,
                title: "Pattern Recognition",
                desc: "Auto-detect trading patterns",
              },
              {
                icon: Terminal,
                title: "Signal Alerts",
                desc: "Real-time trading signals",
              },
              {
                icon: MessageSquare,
                title: "AI Analysis",
                desc: "Smart market insights",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.2 }}
                className="rounded-lg border bg-background p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.desc}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
