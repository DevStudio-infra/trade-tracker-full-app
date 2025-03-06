import * as React from "react";
import { Section, Text, Button, Link } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
  trackingId?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name, dashboardUrl, trackingId }) => {
  const trackingPixel = trackingId ? `https://analytics.trade-tracker.net/pixel/${trackingId}.gif` : null;

  return (
    <BaseLayout previewText={`Welcome to Trade Tracker, ${name}!`}>
      <Section style={section}>
        <Text style={heading}>Welcome to Trade Tracker, {name}! 🚀</Text>

        <Text style={text}>We're thrilled to have you on board. Trade Tracker is your AI-powered companion for smarter trading decisions.</Text>

        <Text style={text}>Here's what you can do next:</Text>

        <Section style={list}>
          <Text style={listItem}>✅ Set up your trading preferences and risk parameters</Text>
          <Text style={listItem}>🔗 Connect your trading accounts securely</Text>
          <Text style={listItem}>📊 Explore our AI-powered trading strategies</Text>
          <Text style={listItem}>🔔 Configure your alert preferences</Text>
        </Section>

        <Button href={dashboardUrl} style={button} pX={20} pY={12}>
          Get Started
        </Button>

        <Text style={text}>Need help getting started? Just reply to this email - our support team is here to help!</Text>

        <Text style={signature}>
          Best regards,
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
