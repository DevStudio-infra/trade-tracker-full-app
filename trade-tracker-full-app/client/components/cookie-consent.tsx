"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-3 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium sm:text-base">
              🍪 Cookie Settings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              We use cookies to improve your experience. Choose which cookies
              you accept.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={acceptNecessary}
              size="sm"
              className="flex-1 whitespace-nowrap text-xs sm:flex-none sm:text-sm"
            >
              Essential Only
            </Button>
            <Button
              onClick={acceptAll}
              size="sm"
              className="flex-1 whitespace-nowrap text-xs sm:flex-none sm:text-sm"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
