import * as React from "react";
import { Section, Text, Button, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface TradingAlertEmailProps {
  name: string;
  alertType: "signal" | "price" | "volume" | "custom";
  symbol: string;
  message: string;
  currentPrice?: number;
  targetPrice?: number;
  volume?: number;
  timestamp: string;
  dashboardUrl: string;
  trackingId?: string;
}

export const TradingAlertEmail: React.FC<TradingAlertEmailProps> = ({
  name,
  alertType,
  symbol,
  message,
  currentPrice,
  targetPrice,
  volume,
  timestamp,
  dashboardUrl,
  trackingId,
}) => {
  const trackingPixel = trackingId ? `https://analytics.trade-tracker.net/pixel/${trackingId}.gif` : null;

  const getAlertTypeEmoji = (type: string) => {
    switch (type) {
      case "signal":
        return "🎯";
      case "price":
        return "💰";
      case "volume":
        return "📊";
      default:
        return "🔔";
    }
  };

  return (
    <BaseLayout previewText={`Trading Alert: ${symbol} - ${message}`}>
      <Section style={section}>
        <Text style={heading}>
          {getAlertTypeEmoji(alertType)} Trading Alert for {symbol}
        </Text>

        <Text style={text}>{message}</Text>

        <Section style={detailsSection}>
          {currentPrice && (
            <Text style={detail}>
              Current Price: <span style={value}>${currentPrice.toFixed(2)}</span>
            </Text>
          )}
          {targetPrice && (
            <Text style={detail}>
              Target Price: <span style={value}>${targetPrice.toFixed(2)}</span>
            </Text>
          )}
          {volume && (
            <Text style={detail}>
              Volume: <span style={value}>{volume.toLocaleString()}</span>
            </Text>
          )}
          <Text style={detail}>
            Time: <span style={value}>{timestamp}</span>
          </Text>
        </Section>

        <Hr style={divider} />

        <Button href={dashboardUrl} style={button} pX={20} pY={12}>
          View Details
        </Button>

        <Text style={footer}>
          You received this alert because you have enabled {alertType} alerts for {symbol}. You can manage your alert settings in your dashboard.
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

const detailsSection = {
  backgroundColor: "#f7fafc",
  padding: "20px",
  borderRadius: "8px",
  margin: "24px 0",
};

const detail = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a5568",
  margin: "8px 0",
};

const value = {
  fontWeight: "bold",
  color: "#2d3748",
};

const divider = {
  borderTop: "1px solid #e2e8f0",
  margin: "24px 0",
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

const footer = {
  fontSize: "14px",
  color: "#718096",
  fontStyle: "italic",
  margin: "24px 0",
};
