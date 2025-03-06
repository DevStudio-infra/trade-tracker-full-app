import express from "express";
import { creditsController } from "../controllers/creditsController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// All routes except webhook require authentication
router.use("/webhook", express.raw({ type: "application/json" }));
router.post("/webhook", creditsController.handleStripeWebhook);

router.use(authenticateUser);

// Credit management routes
router.post("/purchase", creditsController.purchaseCredits);
router.post("/check", creditsController.checkCredits);
router.get("/analytics", creditsController.getAnalytics);

export default router;
