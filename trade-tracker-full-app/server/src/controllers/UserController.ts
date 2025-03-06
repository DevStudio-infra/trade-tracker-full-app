import { Request, Response } from "express";
import { userService } from "../services/UserService";
import { SubscriptionStatus, UserRole } from "@prisma/client";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export class UserController {
  async getUsersBySubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user?.id || user.role !== "ADMIN") {
        res.status(401).json({ error: "Not authenticated or not admin" });
        return;
      }

      const { status } = req.query;
      if (!status || !Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
        res.status(400).json({ error: "Invalid subscription status" });
        return;
      }

      const users = await userService.findUsersBySubscription(status as SubscriptionStatus);
      res.status(200).json(users);
    } catch (error) {
      console.error("[USER_LIST_BY_SUBSCRIPTION_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      await userService.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
      console.error("[USER_DELETE_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateWelcomeSeen(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await userService.updateWelcomeSeen(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[WELCOME_SEEN_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTermsAcceptance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { acceptTerms, acceptPrivacy, hasCompletedOnboarding } = req.body;

      if (typeof acceptTerms !== "boolean" || typeof acceptPrivacy !== "boolean") {
        res.status(400).json({ error: "Invalid request body" });
        return;
      }

      await userService.updateTermsAcceptance(userId, acceptTerms, acceptPrivacy, hasCompletedOnboarding);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[ACCEPT_TERMS_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updatePrivacyAcceptance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await userService.updatePrivacyAcceptance(userId);
      res.status(200).json({ message: "Privacy policy accepted successfully" });
    } catch (error) {
      console.error("[ACCEPT_PRIVACY_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const userController = new UserController();
