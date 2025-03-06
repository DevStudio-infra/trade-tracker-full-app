import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import KnowledgeBaseService from "../services/knowledgeBase";
import { z } from "zod";

const router = Router();
const knowledgeBaseService = KnowledgeBaseService.getInstance();

// Schema for search query validation
const searchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional(),
});

/**
 * Search trading strategies
 * GET /api/knowledge-base/search
 */
router.get("/search", authenticateUser, async (req, res) => {
  try {
    const { query, limit } = searchQuerySchema.parse(req.query);
    const strategies = await knowledgeBaseService.searchStrategies(query, limit);
    res.json(strategies);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid search parameters", details: error.errors });
    } else {
      console.error("Strategy search error:", error);
      res.status(500).json({ error: "Failed to search strategies" });
    }
  }
});

/**
 * Add a new trading strategy
 * POST /api/knowledge-base/strategies
 */
router.post("/strategies", authenticateUser, async (req, res) => {
  try {
    const strategy = await knowledgeBaseService.addStrategy(req.body);
    res.status(201).json(strategy);
  } catch (error) {
    console.error("Strategy creation error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create strategy" });
  }
});

/**
 * Update a trading strategy
 * PUT /api/knowledge-base/strategies/:id
 */
router.put("/strategies/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const strategy = await knowledgeBaseService.updateStrategy(id, req.body);
    res.json(strategy);
  } catch (error) {
    console.error("Strategy update error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update strategy" });
  }
});

/**
 * Delete a trading strategy
 * DELETE /api/knowledge-base/strategies/:id
 */
router.delete("/strategies/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    await knowledgeBaseService.deleteStrategy(id);
    res.status(204).send();
  } catch (error) {
    console.error("Strategy deletion error:", error);
    res.status(500).json({ error: "Failed to delete strategy" });
  }
});

export default router;
