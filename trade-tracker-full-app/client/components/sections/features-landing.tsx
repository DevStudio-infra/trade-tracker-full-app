"use client";

import { motion } from "framer-motion";
import { FileText, Layers, LineChart, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Computer Vision Analysis",
    description:
      "Advanced chart pattern recognition and technical analysis powered by state-of-the-art AI models. Get real-time insights on market trends and potential setups.",
    Icon: LineChart,
    gradient: "from-blue-500/20 to-cyan-400/20",
  },
  {
    title: "Platform Integration",
    description:
      "Seamlessly connect with major trading platforms through secure webhooks and REST APIs. Support for MT4, MT5, TradingView, and more.",
    Icon: Layers,
    gradient: "from-indigo-500/20 to-purple-400/20",
  },
  {
    title: "Automated Trading Journal",
    description:
      "Coming soon: AI-powered trading journal that automatically captures and analyzes your trades. Join the waitlist to get early access to personalized insights.",
    Icon: FileText,
    gradient: "from-violet-500/20 to-purple-400/20",
    comingSoon: true,
  },
  {
    title: "Trading Bots Marketplace",
    description:
      "Coming soon: Discover and deploy battle-tested trading strategies from verified developers. Get notified when our marketplace launches.",
    Icon: Package,
    gradient: "from-blue-500/20 to-indigo-400/20",
    comingSoon: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FeaturesLanding() {
  return (
    <section className="overflow-hidden bg-background py-20 sm:py-32">
      <div className="container relative">
        {/* Background decoration */}
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-12 w-[200%] origin-bottom-left skew-x-[-30deg] bg-secondary/80 shadow-xl shadow-primary/5 ring-1 ring-primary/10 sm:mr-20 md:mr-0 lg:right-full lg:-mr-36 lg:origin-center" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none"
        >
          <div className="max-w-2xl">
            <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Everything you need to enhance your trading experience and make
              data-driven decisions with confidence.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none xl:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="relative overflow-hidden rounded-2xl border bg-background p-8"
            >
              {/* Feature card background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-10 ${feature.gradient}`}
              />

              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.Icon className="size-6 text-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="mt-6 font-urban text-xl font-semibold">
                    {feature.title}
                  </h3>
                  {feature.comingSoon && (
                    <Badge variant="secondary" className="mt-6">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner borders */}
              <div className="absolute right-2 top-2 size-[calc(100%-16px)] rounded-xl border border-primary/10" />
              <div className="absolute right-0 top-0 size-[calc(100%-8px)] rounded-xl border border-primary/10" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
