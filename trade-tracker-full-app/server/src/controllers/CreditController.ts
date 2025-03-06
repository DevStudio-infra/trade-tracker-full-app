import { Request, Response } from "express";
import { creditService } from "../services/CreditService";
import { UserRole } from "@prisma/client";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export class CreditController {
  async getBalance(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const balance = await creditService.getBalance(user.id);
      return res.json(balance);
    } catch (error) {
      console.error("[CREDITS_BALANCE]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getTransactionHistory(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const transactions = await creditService.getTransactionHistory(user.id);
      return res.json({ transactions });
    } catch (error) {
      console.error("[CREDITS_HISTORY]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async useCredits(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { amount = 1, operation = "USAGE" } = req.body;

      if (typeof amount !== "number" || amount < 1) {
        return res.status(400).json({ error: "Invalid credit amount" });
      }

      const result = await creditService.useCredits(user.id, amount, operation);
      return res.json(result);
    } catch (error: unknown) {
      console.error("[CREDITS_USE]", error);
      if (error instanceof Error && error.message === "Insufficient credits") {
        return res.status(402).json({ error: "Insufficient credits" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async refreshCredits(req: Request, res: Response) {
    try {
      // This endpoint should be protected by an API key for cron jobs
      const authHeader = req.headers.authorization;
      const cronApiKey = process.env.CRON_JOB_API_KEY;

      if (authHeader !== `Bearer ${cronApiKey}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await creditService.refreshCredits();
      return res.json({ success: true });
    } catch (error) {
      console.error("[CREDITS_REFRESH]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const creditController = new CreditController();
