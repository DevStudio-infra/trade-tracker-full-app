import express from "express";
import { signalController } from "../controllers/signalController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Generate a new trading signal
router.post("/generate", signalController.generateSignal);

// Validate an existing signal
router.post("/validate", signalController.validateSignal);

// Get active signals
router.get("/active", signalController.getActiveSignals);

// Clean up expired signals
router.post("/cleanup", signalController.cleanupExpiredSignals);

export default router;
