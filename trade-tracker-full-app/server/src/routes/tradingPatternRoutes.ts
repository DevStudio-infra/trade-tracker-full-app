import express from "express";
import { tradingPatternController } from "../controllers/TradingPatternController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Search for similar patterns
router.get("/search", tradingPatternController.findSimilarPatterns.bind(tradingPatternController));

// Create a new pattern (admin only)
router.post("/", tradingPatternController.createPattern.bind(tradingPatternController));

// Update a pattern (admin only)
router.put("/:id", tradingPatternController.updatePattern.bind(tradingPatternController));

// Delete a pattern (admin only)
router.delete("/:id", tradingPatternController.deletePattern.bind(tradingPatternController));

export default router;
