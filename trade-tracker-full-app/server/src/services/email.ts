import { Resend } from "resend";
import { WelcomeEmail } from "../templates/emails/WelcomeEmail";
import { SubscriptionEmail } from "../templates/emails/SubscriptionEmail";
import { TradingAlertEmail } from "../templates/emails/TradingAlertEmail";
import { renderAsync } from "@react-email/render";
import { db } from "../db";
import { v4 as uuidv4 } from "uuid";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

interface EmailTrackingData {
  emailId: string;
  trackingId: string;
  type: string;
  recipient: string;
  timestamp: Date;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;
  private defaultFrom: string;
  private trackingData: Map<string, EmailTrackingData>;

  private constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.EMAIL_FROM || "support@trade-tracker.net";
    this.trackingData = new Map();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private generateTrackingId(): string {
    return uuidv4();
  }

  private trackEmail(emailId: string, type: string, recipient: string): string {
    const trackingId = this.generateTrackingId();
    this.trackingData.set(trackingId, {
      emailId,
      trackingId,
      type,
      recipient,
      timestamp: new Date(),
    });
    return trackingId;
  }

  public async sendEmail(options: EmailOptions): Promise<{ id: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
      });

      if (error) {
        throw error;
      }

      return { id: data?.id || "" };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  private async createTrackingRecord(userId: string, emailType: string, metadata: any = {}) {
    const trackingId = uuidv4();
    await db.emailTracking.create({
      data: {
        userId,
        trackingId,
        emailType,
        metadata,
      },
    });
    return trackingId;
  }

  public async getEmailTracking(trackingId: string) {
    return await db.emailTracking.findUnique({
      where: { trackingId },
    });
  }

  public async markEmailOpened(trackingId: string) {
    await db.emailTracking.update({
      where: { trackingId },
      data: {
        opened: true,
        openedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  public async sendWelcomeEmail(to: string, userId: string, name: string, dashboardUrl: string) {
    const trackingId = await this.createTrackingRecord(userId, "welcome");
    const html = await renderAsync(WelcomeEmail({ name, dashboardUrl, trackingId }));

    await this.resend.emails.send({
      from: "Trade Tracker <noreply@trade-tracker.net>",
      to,
      subject: "Welcome to Trade Tracker!",
      html,
    });
  }

  public async sendSubscriptionEmail(to: string, userId: string, name: string, plan: string, dashboardUrl: string, features: string[]) {
    const trackingId = await this.createTrackingRecord(userId, "subscription", { plan });
    const html = await renderAsync(SubscriptionEmail({ name, plan, dashboardUrl, trackingId, features }));

    await this.resend.emails.send({
      from: "Trade Tracker <noreply@trade-tracker.net>",
      to,
      subject: `Your ${plan} Subscription is Active`,
      html,
    });
  }

  public async sendTradingAlertEmail(
    to: string,
    userId: string,
    name: string,
    alertType: "signal" | "price" | "volume" | "custom",
    symbol: string,
    message: string,
    dashboardUrl: string,
    options: {
      currentPrice?: number;
      targetPrice?: number;
      volume?: number;
    } = {}
  ) {
    const trackingId = await this.createTrackingRecord(userId, "trading_alert", {
      alertType,
      symbol,
      ...options,
    });

    const html = await renderAsync(
      TradingAlertEmail({
        name,
        alertType,
        symbol,
        message,
        dashboardUrl,
        trackingId,
        timestamp: new Date().toISOString(),
        ...options,
      })
    );

    await this.resend.emails.send({
      from: "Trade Tracker <noreply@trade-tracker.net>",
      to,
      subject: `Trading Alert: ${symbol} - ${message}`,
      html,
    });
  }

  public async getEmailStats(userId: string, startDate?: Date, endDate?: Date) {
    return await db.emailTracking.groupBy({
      by: ["emailType"],
      where: {
        userId,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        _all: true,
        opened: true,
      },
      _min: {
        sentAt: true,
      },
      _max: {
        sentAt: true,
      },
    });
  }
}

export const emailService = EmailService.getInstance();
