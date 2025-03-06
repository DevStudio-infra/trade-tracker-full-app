import * as React from "react";
import { Section, Text, Button, Link } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface SubscriptionEmailProps {
  name: string;
  plan: string;
  dashboardUrl: string;
  trackingId?: string;
  features: string[];
}

export const SubscriptionEmail: React.FC<SubscriptionEmailProps> = ({ name, plan, dashboardUrl, trackingId, features }) => {
  const trackingPixel = trackingId ? `https://analytics.trade-tracker.net/pixel/${trackingId}.gif` : null;

  return (
    <BaseLayout previewText={`Your ${plan} Subscription is Active`}>
      <Section style={section}>
        <Text style={heading}>Thank you for subscribing, {name}! 🎉</Text>

        <Text style={text}>Your {plan} subscription is now active. You have access to all premium features and advanced trading capabilities.</Text>

        <Text style={subheading}>Your {plan} Plan Includes:</Text>

        <Section style={list}>
          {features.map((feature, index) => (
            <Text key={index} style={listItem}>
              ✓ {feature}
            </Text>
          ))}
        </Section>

        <Button href={dashboardUrl} style={button} pX={20} pY={12}>
          Go to Dashboard
        </Button>

        <Text style={text}>Need help getting the most out of your subscription? Our support team is here to help!</Text>

        <Text style={signature}>
          Happy Trading!
          <br />
          The Trade Tracker Team
        </Text>

        {trackingPixel && <img src={trackingPixel} width="1" height="1" style={{ display: "none" }} alt="" />}
      </Section>
    </BaseLayout>
  );
};

// Styles
const section = {
  padding: "0 24px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const subheading = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#2d3748",
  margin: "32px 0 16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#2d3748",
  margin: "24px 0",
};

const list = {
  margin: "24px 0",
};

const listItem = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#2d3748",
  margin: "12px 0",
};

const button = {
  display: "inline-block",
  backgroundColor: "#556cd6",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  borderRadius: "5px",
  margin: "24px 0",
};

const signature = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#2d3748",
  margin: "32px 0",
  fontStyle: "italic",
};
