import express from "express";
import { creditController } from "../controllers/CreditController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Get user's credit balance
router.get("/balance", authenticateUser, creditController.getBalance.bind(creditController));

// Get user's credit transaction history
router.get("/history", authenticateUser, creditController.getTransactionHistory.bind(creditController));

// Use credits
router.post("/use", authenticateUser, creditController.useCredits.bind(creditController));

// Refresh credits (protected by API key)
router.post("/refresh", creditController.refreshCredits.bind(creditController));

export default router;
