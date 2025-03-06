import * as React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Link, Hr } from "@react-email/components";

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ previewText, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Trade Tracker</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>© {new Date().getFullYear()} Trade Tracker. All rights reserved.</Text>
            <Text style={footerLinks}>
              <Link href="#" style={link}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href="#" style={link}>
                Terms of Service
              </Link>
              {" • "}
              <Link href="#" style={link}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "32px",
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
};

const content = {
  padding: "0 32px",
};

const footer = {
  padding: "0 32px",
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  textAlign: "center" as const,
};

const footerLinks = {
  fontSize: "12px",
  color: "#8898aa",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const link = {
  color: "#556cd6",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};
