import { Icons } from "../components/shared/icons";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => {
  const subject =
    mailType === "login"
      ? `Sign in to your ${siteName} account`
      : `Welcome to ${siteName} - Activate your account`;

  const welcomeText =
    mailType === "login" ? "Welcome back!" : "Welcome to Trade Tracker!";

  const actionText =
    mailType === "login"
      ? "Use the button below to sign in to your account."
      : "Thanks for signing up! Please verify your email address to get started.";

  const buttonText =
    mailType === "login" ? "Sign in to your account" : "Verify your email";

  return {
    subject,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 24px 16px !important;
        }
        .button {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <div class="container" style="max-width: 600px; margin: 48px auto; padding: 32px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <!-- Logo and Header -->
      <div style="text-align: center; margin-bottom: 32px;">

        <h1 style="margin: 24px 0 8px; color: #111827; font-size: 24px; font-weight: 600;">
          ${welcomeText}
        </h1>
        <p style="margin: 0; color: #6B7280; font-size: 16px;">
          Your trading journey starts here
        </p>
      </div>

      <!-- Main Content -->
      <div style="margin-bottom: 32px; padding: 24px; background-color: #f8fafc; border-radius: 8px;">
        <p style="margin-bottom: 16px; color: #4B5563; font-size: 16px;">
          Hi ${firstName},
        </p>
        <p style="margin-bottom: 24px; color: #4B5563; font-size: 16px;">
          ${actionText}
        </p>
        <div style="text-align: center;">
          <a href="${actionUrl}"
             class="button"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: 500; font-size: 16px; transition: background-color 0.2s;">
            ${buttonText}
          </a>
        </div>
      </div>

      <!-- Security Notice -->
      <div style="margin-bottom: 32px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff;">
        <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">
          <strong style="color: #4B5563;">Security Notice:</strong>
        </p>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          • This link expires in 24 hours and can only be used once<br>
          • If you didn't request this email, please ignore it
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 32px;">
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
          Powered by ${siteName}
        </p>
        <p style="margin: 8px 0 0; color: #9CA3AF; font-size: 12px;">
          Smart trading analytics for better decisions
        </p>
      </div>
    </div>
  </body>
</html>`,
    text: `${welcomeText}

Hi ${firstName},

${actionText}

Click here to ${buttonText.toLowerCase()}: ${actionUrl}

Security Notice:
• This link expires in 24 hours and can only be used once
• If you didn't request this email, please ignore it

Powered by ${siteName}
Smart trading analytics for better decisions`,
  };
};
