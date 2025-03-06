import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"

interface WelcomeEmailProps {
  email: string
}

export default function WelcomeEmail({ email }: WelcomeEmailProps) {
  return {
    subject: "Welcome to AI Trading Agent Waitlist",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AI Trading Agent Waitlist</title>
        </head>
        <body style="margin: 48px auto; background-color: white; font-family: system-ui, -apple-system, sans-serif;">
          <div style="padding: 32px; max-width: 36rem; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px;">
              Welcome to AI Trading Agent! 🚀
            </h1>
            <p style="color: #374151; margin-bottom: 16px; line-height: 1.5;">
              Thank you for joining our waitlist. We're thrilled to have you on board as we prepare to revolutionize trading with artificial intelligence.
            </p>
            <p style="color: #374151; margin-bottom: 16px; line-height: 1.5;">
              You'll be among the first to know when we launch and get exclusive early access to our platform.
            </p>
            <p style="color: #374151; line-height: 1.5;">
              Stay tuned for updates and exciting news about our AI Trading Agent.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
              If you didn't sign up for AI Trading Agent, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to AI Trading Agent! 🚀

Thank you for joining our waitlist. We're thrilled to have you on board as we prepare to revolutionize trading with artificial intelligence.

You'll be among the first to know when we launch and get exclusive early access to our platform.

Stay tuned for updates and exciting news about our AI Trading Agent.

If you didn't sign up for AI Trading Agent, you can safely ignore this email.
    `.trim(),
  }
}
