import { Request, Response } from "express";
import { newsletterService } from "../services/NewsletterService";
import { UserRole } from "@prisma/client";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export class NewsletterController {
  async subscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if email already exists
      const existingSubscriber = await newsletterService.findSubscriber(email);
      if (existingSubscriber) {
        return res.status(400).json({ error: "Already subscribed" });
      }

      // Create new subscriber
      await newsletterService.createSubscriber(email);
      return res.status(201).json({ message: "Subscribed successfully" });
    } catch (error) {
      console.error("[NEWSLETTER_SUBSCRIBE]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async listSubscribers(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user?.id || user.role !== "ADMIN") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const subscribers = await newsletterService.listSubscribers();
      return res.json(subscribers);
    } catch (error) {
      console.error("[NEWSLETTER_LIST]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async unsubscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if subscriber exists
      const subscriber = await newsletterService.findSubscriber(email);
      if (!subscriber) {
        return res.status(404).json({ error: "Not subscribed" });
      }

      // Delete subscriber
      await newsletterService.deleteSubscriber(email);
      return res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("[NEWSLETTER_UNSUBSCRIBE]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const newsletterController = new NewsletterController();
