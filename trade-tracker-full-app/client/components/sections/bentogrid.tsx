"use client";

import { motion } from "framer-motion";
import { Brain, LineChart, Lock, Zap } from "lucide-react";

const features = [
  {
    title: "Real-Time Analysis",
    description:
      "Get instant insights on market trends and patterns as they develop.",
    icon: LineChart,
    className: "col-span-2",
    gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
  },
  {
    title: "AI-Powered",
    description:
      "Advanced machine learning models analyze charts and market data.",
    icon: Brain,
    className: "col-span-2",
    gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
  },
  {
    title: "Lightning Fast",
    description: "Execute trades and analyze markets with minimal latency.",
    icon: Zap,
    className: "col-span-2",
    gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
  },
  {
    title: "Secure Platform",
    description:
      "Enterprise-grade security for your trading data and analysis.",
    icon: Lock,
    className: "col-span-2",
    gradient: "from-blue-500/20 via-blue-400/20 to-blue-300/20",
  },
];

export default function BentoGrid() {
  return (
    <section className="overflow-hidden bg-background py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Modern Trading
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Advanced features designed to enhance your trading experience and
            improve decision making.
          </p>
        </motion.div>

        <div className="mt-16">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border bg-card p-8 ${feature.className}`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mt-6 font-urban text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative corner borders */}
                <div className="absolute right-2 top-2 size-[calc(100%-16px)] rounded-xl border border-primary/10" />
                <div className="absolute right-0 top-0 size-[calc(100%-8px)] rounded-xl border border-primary/10" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
