"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { UserSubscriptionPlan } from "@/types";

import { SubscriptionPlan } from "@/types/index";
import { pricingData } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ModalContext } from "@/components/modals/providers";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import { BillingFormButton } from "../forms/billing-form-button";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
  const isYearlyDefault =
    !subscriptionPlan?.stripeCustomerId || subscriptionPlan.interval === "year"
      ? true
      : false;
  const [isYearly, setIsYearly] = useState<boolean>(!!isYearlyDefault);
  const { setShowSignInModal } = useContext(ModalContext);

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  const PricingCard = ({ offer }: { offer: SubscriptionPlan }) => {
    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border shadow-sm transition-all duration-200 hover:border-blue-200/50 hover:shadow-md",
          offer.title.toLocaleLowerCase() === "pro"
            ? "-m-0.5 border-2 border-blue-400 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20"
            : "hover:bg-blue-50/50 dark:hover:bg-blue-950/10",
        )}
        key={offer.title}
      >
        <div
          className={cn(
            "min-h-[150px] items-start space-y-4 p-6",
            offer.title.toLocaleLowerCase() === "pro"
              ? "bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-900/30"
              : "bg-muted/50",
          )}
        >
          <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {offer.title}
          </p>

          <div className="flex flex-row">
            <div className="flex items-end">
              <div className="flex text-left text-3xl font-semibold leading-6">
                {isYearly && offer.prices.monthly > 0 ? (
                  <>
                    <span className="mr-2 text-muted-foreground/80 line-through">
                      ${offer.prices.monthly}
                    </span>
                    <span>${offer.prices.yearly / 12}</span>
                  </>
                ) : (
                  `$${offer.prices.monthly}`
                )}
              </div>
              <div className="-mb-1 ml-2 text-left text-sm font-medium text-muted-foreground">
                <div>/month</div>
              </div>
            </div>
          </div>
          {offer.prices.monthly > 0 ? (
            <div className="text-left text-sm text-muted-foreground">
              {isYearly
                ? `$${offer.prices.yearly} will be charged when annual`
                : "when charged monthly"}
            </div>
          ) : null}
        </div>

        <div className="flex h-full flex-col justify-between gap-16 p-6">
          <ul className="space-y-2 text-left text-sm font-medium leading-normal">
            {offer.benefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 shrink-0 text-blue-500" />
                <p>{feature}</p>
              </li>
            ))}

            {offer.limitations.length > 0 &&
              offer.limitations.map((feature) => (
                <li
                  className="flex items-start text-muted-foreground"
                  key={feature}
                >
                  <Icons.close className="mr-3 size-5 shrink-0" />
                  <p>{feature}</p>
                </li>
              ))}
          </ul>

          {userId && subscriptionPlan ? (
            offer.title === "Starter" ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    rounded: "full",
                  }),
                  "w-full",
                )}
              >
                Go to dashboard
              </Link>
            ) : (
              <BillingFormButton
                year={isYearly}
                offer={offer}
                subscriptionPlan={subscriptionPlan}
              />
            )
          ) : (
            <Button
              variant={
                offer.title.toLocaleLowerCase() === "pro"
                  ? "default"
                  : "outline"
              }
              rounded="full"
              onClick={() => setShowSignInModal(true)}
              className={cn(
                offer.title.toLocaleLowerCase() === "pro"
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50",
              )}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center">
        <HeaderSection label="Pricing" title="Start at full speed !" />

        <div className="mb-4 mt-10 flex items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue={isYearly ? "yearly" : "monthly"}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 overflow-hidden rounded-full border bg-background p-1 *:h-7 *:text-muted-foreground hover:border-blue-200/50"
          >
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 hover:bg-blue-50 data-[state=on]:!bg-blue-500 data-[state=on]:!text-primary-foreground dark:hover:bg-blue-950/50"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 hover:bg-blue-50 data-[state=on]:!bg-blue-500 data-[state=on]:!text-primary-foreground dark:hover:bg-blue-950/50"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
          {pricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-3 text-balance text-center text-base text-muted-foreground">
          <Link
            href="/contact"
            className="font-medium text-primary hover:underline"
          >
            Contact our support team
          </Link>{" "}
          for any questions about our plans.
          <br />
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
