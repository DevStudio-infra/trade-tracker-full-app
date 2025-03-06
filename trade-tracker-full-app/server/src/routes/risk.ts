import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../middleware/auth";
import RiskManagementService, { StopLossType } from "../services/riskManagement";

const router = Router();
const riskManagementService = RiskManagementService.getInstance();

// Schema for stop loss configuration
const stopLossSchema = z.object({
  type: z.enum([StopLossType.FIXED_PIPS, StopLossType.TECHNICAL, StopLossType.ATR_BASED]),
  value: z.number().optional(), // Required for FIXED_PIPS and ATR_BASED
});

// Schema for take profit configuration
const takeProfitSchema = z.object({
  type: z.enum(["FIXED_PIPS", "RR_RATIO"]),
  value: z.number().positive(), // Pips or R:R ratio
});

// Schema for position size calculation request
const positionSizeSchema = z.object({
  pair: z.string(),
  entryPrice: z.number().positive(),
  riskPercentage: z.number().min(0.1).max(5), // 0.1% to 5% risk per trade
  stopLoss: stopLossSchema,
  takeProfit: takeProfitSchema.optional(),
  maxPositions: z.number().int().positive(),
  maxDailyLoss: z.number().positive(),
  pipValue: z.number().optional(),
});

// Schema for trade validation request
const validateTradeSchema = z.object({
  pair: z.string(),
  size: z.number().positive(),
  riskPercentage: z.number().min(0.1).max(5),
  stopLoss: stopLossSchema,
  takeProfit: takeProfitSchema.optional(),
  maxPositions: z.number().int().positive(),
  maxDailyLoss: z.number().positive(),
});

/**
 * Calculate position size
 * POST /api/risk/position-size
 */
router.post("/position-size", authenticateUser, async (req, res) => {
  try {
    const validatedData = positionSizeSchema.parse(req.body);

    const calculation = await riskManagementService.calculatePositionSize(req.user.id, validatedData.pair, validatedData.entryPrice, {
      accountBalance: 0, // Will be fetched from account
      ...validatedData,
    });

    res.json(calculation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Position size calculation error:", error);
      res.status(500).json({ error: "Failed to calculate position size" });
    }
  }
});

/**
 * Validate trade parameters
 * POST /api/risk/validate-trade
 */
router.post("/validate-trade", authenticateUser, async (req, res) => {
  try {
    const validatedData = validateTradeSchema.parse(req.body);

    const validation = await riskManagementService.validateTrade(req.user.id, validatedData.pair, validatedData.size, {
      accountBalance: 0, // Will be fetched from account
      ...validatedData,
    });

    res.json(validation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Trade validation error:", error);
      res.status(500).json({ error: "Failed to validate trade" });
    }
  }
});

/**
 * Get risk metrics
 * GET /api/risk/metrics
 */
router.get("/metrics", authenticateUser, async (req, res) => {
  try {
    const metrics = await riskManagementService.calculateRiskMetrics(req.user.id);
    res.json(metrics);
  } catch (error) {
    console.error("Risk metrics calculation error:", error);
    res.status(500).json({ error: "Failed to calculate risk metrics" });
  }
});

export default router;
