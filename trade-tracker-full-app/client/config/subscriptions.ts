import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Free",
    description: "Perfect for trying out Trade Tracker.",
    benefits: [
      "6 AI credits per month",
      "Basic trading analysis",
      "1 active session",
      "7-day analysis history",
      "Email support",
    ],
    limitations: [
      "No pattern recognition",
      "Limited market data",
      "Basic AI features",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Pro",
    description: "Ideal for active traders.",
    benefits: [
      "100 AI credits per month",
      "Advanced pattern recognition",
      "Unlimited active sessions",
      "30-day analysis history",
      "Priority support",
      "Real-time market data",
      "Advanced AI features",
      "Custom trading strategies",
      "Performance analytics",
    ],
    limitations: [],
    prices: {
      monthly: 14.99,
      yearly: 126,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    },
  },
];

export const plansColumns = ["free", "pro"] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Monthly Credits",
    free: "6",
    pro: "100",
    enterprise: "Unlimited",
    tooltip:
      "Credits are used for AI analysis requests. Each chart analysis consumes one credit",
  },
  {
    feature: "Active Sessions",
    free: "1",
    pro: "Unlimited",
    enterprise: "Unlimited",
    tooltip: "Number of concurrent trading analysis sessions you can maintain",
  },
  {
    feature: "Analysis History",
    free: "7 days",
    pro: "30 days",
    enterprise: "90 days",
    tooltip: "How long your analysis history is retained",
  },
  {
    feature: "Pattern Recognition",
    free: "Basic",
    pro: "Advanced",
    enterprise: "Custom Library",
    tooltip: "Sophistication level of pattern detection algorithms",
  },
  {
    feature: "Market Data",
    free: "Limited",
    pro: "Real-time",
    enterprise: "Real-time + Custom",
    tooltip: "Access to market data and custom data integrations",
  },
  {
    feature: "Support Level",
    free: "Email",
    pro: "Priority",
    enterprise: "24/7 Priority",
    tooltip: "Level of customer support and response time",
  },
  {
    feature: "AI Features",
    free: "Basic",
    pro: "Advanced",
    enterprise: "Enterprise-grade",
    tooltip: "Access to different levels of AI analysis capabilities",
  },
  {
    feature: "Trading Strategies",
    free: false,
    pro: "Custom",
    enterprise: "Custom + Team",
    tooltip: "Ability to create and share custom trading strategies",
  },
  {
    feature: "Analytics",
    free: "Basic",
    pro: "Performance",
    enterprise: "Advanced",
    tooltip: "Depth of trading performance analytics",
  },
  {
    feature: "Team Features",
    free: false,
    pro: false,
    enterprise: true,
    tooltip: "Collaboration features for trading teams",
  },
  {
    feature: "API Access",
    free: false,
    pro: false,
    enterprise: true,
    tooltip: "Access to our API for custom integrations",
  },
  {
    feature: "Custom Integrations",
    free: false,
    pro: false,
    enterprise: true,
    tooltip: "Ability to integrate with your existing tools and systems",
  },
];
