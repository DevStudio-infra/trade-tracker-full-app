import { creditConfig } from "@/config/credits";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "../shared/header-section";

const pricingFaqData = [
  {
    id: "item-1",
    question: "What are credits and how do they work?",
    answer: `Credits are your currency for AI trading analysis. Each time you request an analysis of your trading chart, it consumes one credit. Free users receive ${creditConfig.FREE_TIER_CREDITS} credits monthly, while Pro users get ${creditConfig.PAID_TIER_CREDITS} credits. Each credit allows you to analyze one chart and receive detailed AI-powered insights about patterns, trends, and potential trading opportunities. Pro users also enjoy a ${creditConfig.PRO_DISCOUNT * 100}% discount on any additional credit purchases.`,
  },
  {
    id: "item-2",
    question: "What's included in the Free plan?",
    answer: `The Free plan includes ${creditConfig.FREE_TIER_CREDITS} monthly credits, basic pattern recognition, real-time market analysis, and standard support with 48-hour response time. You'll get access to our basic AI model for trading insights, making it perfect for beginners or those wanting to test our platform's capabilities.`,
  },
  {
    id: "item-3",
    question: "What additional features do I get with Pro?",
    answer: `Pro users get ${creditConfig.PAID_TIER_CREDITS} monthly credits plus a ${creditConfig.PRO_DISCOUNT * 100}% discount on additional credit purchases, advanced pattern recognition with our sophisticated AI models, both real-time and historical analysis capabilities, priority 24-hour support, custom chart annotations, and the ability to export detailed reports. You'll also receive advanced trading insights and faster analysis response times.`,
  },
  {
    id: "item-4",
    question: "How does the AI analysis work?",
    answer:
      "Our AI analyzes your trading charts using advanced pattern recognition algorithms. It identifies key patterns, trends, and potential trading opportunities. Pro users get access to our advanced AI models that provide more sophisticated analysis, including historical data correlation and detailed market insights.",
  },
  {
    id: "item-5",
    question: "Can I purchase additional credits?",
    answer: `Yes, you can purchase additional credits at any time. The base price is ${creditConfig.BASE_PRICE}€ per credit, and Pro subscribers enjoy a ${creditConfig.PRO_DISCOUNT * 100}% discount on all credit purchases. Credits can be purchased in various amounts, starting from ${creditConfig.MIN_PURCHASE_AMOUNT}€.`,
  },
  {
    id: "item-6",
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: `Yes, you can upgrade to Pro or downgrade to Free at any time. When upgrading, you'll get immediate access to all Pro features, your new credit allocation of ${creditConfig.PAID_TIER_CREDITS} credits, and the ${creditConfig.PRO_DISCOUNT * 100}% discount on credit purchases. When downgrading, you'll keep Pro features until the end of your current billing period.`,
  },
  {
    id: "item-7",
    question: "Is there a discount for annual billing?",
    answer:
      "Yes! When you choose annual billing for the Pro plan, you get a 20% discount compared to monthly billing. This brings the effective monthly cost down while giving you all Pro features, making it our most cost-effective option for serious traders.",
  },
  {
    id: "item-8",
    question: "Do unused credits roll over?",
    answer:
      "No, credits reset at the beginning of each billing cycle. This helps us maintain optimal system performance and ensure fair usage for all users. We recommend using your credits throughout the month for regular trading analysis.",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-4xl py-2">
      <HeaderSection
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Have questions about our pricing or features? Find quick answers below. If you need more help, don't hesitate to contact our support team."
      />

      <Accordion type="single" collapsible className="my-12 w-full">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground sm:text-[15px]">
              {faqItem.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
