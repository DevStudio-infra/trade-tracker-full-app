import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserByEmail(identifier);

    if (!user || !user.name) {
      return;
    }

    const userVerified = user?.emailVerified ? true : false;

    try {
      const emailContent = MagicLinkEmail({
        firstName: user?.name as string,
        actionUrl: url,
        mailType: userVerified ? "login" : "register",
        siteName: siteConfig.name,
      });

      const { data, error } = await resend.emails.send({
        from: provider.from,
        to: identifier,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        // Set this to prevent Gmail from threading emails.
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        console.error("[EMAIL_ERROR]", error);
        throw new Error(error?.message);
      }
    } catch (error) {
      console.error("[EMAIL_SEND_ERROR]", error);
      throw new Error("Failed to send verification email.");
    }
  };

export async function sendWelcomeEmail(email: string) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found");
    return;
  }

  try {
    const emailContent = WelcomeEmail({ email });
    await resend.emails.send({
      from: `${siteConfig.name} <${env.EMAIL_FROM}>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
