import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Trade Tracker",
  description:
    "Your AI co-pilot for trading! We turn complex charts into actionable insights so you never miss a trade opportunity.",
  url: site_url,
  ogImage: `${site_url}/_static/og-trade-tracker.jpg`,
  links: {
    twitter: "https://twitter.com/tradetracker",
    github: "https://github.com/DevStudio-infra/trade-app",
  },
  mailSupport: "support@trade-tracker.net",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "#" },
      { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Product",
    items: [
      { title: "Features", href: "#" },
      { title: "Pricing", href: "/pricing" },
      { title: "Documentation", href: "/docs" },
      { title: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Trading Guide", href: "#" },
      { title: "API Reference", href: "#" },
      { title: "Support", href: "#" },
      { title: "Contact", href: "#" },
    ],
  },
];
