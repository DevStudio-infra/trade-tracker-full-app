import express from "express";
import { newsletterController } from "../controllers/NewsletterController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Subscribe to newsletter (public endpoint)
router.post("/subscribe", newsletterController.subscribe.bind(newsletterController));

// Unsubscribe from newsletter (public endpoint)
router.post("/unsubscribe", newsletterController.unsubscribe.bind(newsletterController));

// List all subscribers (admin only)
router.get("/", authenticateUser, newsletterController.listSubscribers.bind(newsletterController));

export default router;
