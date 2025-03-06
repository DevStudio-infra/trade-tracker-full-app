import { Router } from "express";
import OrderExecutionService from "../services/orderExecution";
import { z } from "zod";
import { authenticateUser } from "../middleware/auth";

const router = Router();
const orderExecutionService = OrderExecutionService.getInstance();

// Schema for trade request validation
const tradeRequestSchema = z
  .object({
    pair: z.string().min(1), // Ensure non-empty string
    direction: z.enum(["BUY", "SELL"]),
    size: z.number().positive(),
    orderType: z.enum(["MARKET", "LIMIT"]),
    limitPrice: z.number().optional(),
    stopLoss: z.number().optional(),
    takeProfit: z.number().optional(),
    useGuaranteedStop: z.boolean().optional(),
  })
  .strict(); // Ensure no extra properties

// Schema for position modification validation
const modifyPositionSchema = z
  .object({
    stopLoss: z.number().optional(),
    takeProfit: z.number().optional(),
    trailingStop: z.boolean().optional(),
  })
  .strict();

/**
 * Place a new trade
 * POST /api/trading/trade
 */
router.post("/trade", authenticateUser, async (req, res) => {
  try {
    const validatedData = tradeRequestSchema.parse(req.body);

    // Since we've validated the data, we can safely construct the TradeRequest
    const tradeRequest = {
      userId: req.user.id,
      pair: validatedData.pair,
      direction: validatedData.direction,
      size: validatedData.size,
      orderType: validatedData.orderType,
      limitPrice: validatedData.limitPrice,
      stopLoss: validatedData.stopLoss,
      takeProfit: validatedData.takeProfit,
      useGuaranteedStop: validatedData.useGuaranteedStop,
    };

    const result = await orderExecutionService.placeTrade(tradeRequest);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Trade execution error:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  }
});

/**
 * Modify an existing position
 * PUT /api/trading/positions/:dealId
 */
router.put("/positions/:dealId", authenticateUser, async (req, res) => {
  try {
    const { dealId } = req.params;
    const validatedData = modifyPositionSchema.parse(req.body);

    const result = await orderExecutionService.modifyPosition(req.user.id, dealId, validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      console.error("Position modification error:", error);
      res.status(500).json({ error: "Failed to modify position" });
    }
  }
});

/**
 * Close a position
 * DELETE /api/trading/positions/:dealId
 */
router.delete("/positions/:dealId", authenticateUser, async (req, res) => {
  try {
    const { dealId } = req.params;
    const result = await orderExecutionService.closePosition(req.user.id, dealId);
    res.json(result);
  } catch (error) {
    console.error("Position closure error:", error);
    res.status(500).json({ error: "Failed to close position" });
  }
});

/**
 * Get all open positions
 * GET /api/trading/positions
 */
router.get("/positions", authenticateUser, async (req, res) => {
  try {
    const positions = await orderExecutionService.getOpenPositions(req.user.id);
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

/**
 * Get account information
 * GET /api/trading/account
 */
router.get("/account", authenticateUser, async (req, res) => {
  try {
    const accountInfo = await orderExecutionService.getAccountInfo(req.user.id);
    res.json(accountInfo);
  } catch (error) {
    console.error("Error fetching account info:", error);
    res.status(500).json({ error: "Failed to fetch account information" });
  }
});

export default router;
