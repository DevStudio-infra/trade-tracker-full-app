import * as React from "react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

import { Icons } from "../shared/icons";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:max-w-md">
          <NewsletterForm />
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground md:gap-6">
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/features" className="hover:text-foreground">
            Features
          </Link>
          <span className="flex cursor-not-allowed items-center opacity-60">
            Blog
            <Badge
              variant="secondary"
              className="ml-2 rounded-md px-1.5 py-0.5"
            >
              Soon
            </Badge>
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://twitter.com/TheTradeTracker"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Icons.twitter className="size-5" />
            <span className="sr-only">@TheTradeTracker on X (Twitter)</span>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
}
