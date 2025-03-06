import { Metadata } from "next";

import { NewsletterSubscribers } from "@/components/dashboard/newsletter-subscribers";

export const metadata: Metadata = {
  title: "Newsletter Subscribers",
  description: "Manage your newsletter subscribers.",
};

export default function NewsletterPage() {
  return <NewsletterSubscribers />;
}
