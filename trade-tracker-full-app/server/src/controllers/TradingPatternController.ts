import { Request, Response } from "express";
import { tradingPatternService } from "../services/TradingPatternService";
import { AuthUser } from "../types/auth";

export class TradingPatternController {
  async findSimilarPatterns(req: Request, res: Response) {
    try {
      const { query, limit } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required and must be a string" });
      }

      const patterns = await tradingPatternService.findSimilarPatterns(query, limit ? parseInt(limit as string) : undefined);

      return res.json(patterns);
    } catch (error) {
      console.error("Error finding similar patterns:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createPattern(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { name, description, rules, metadata } = req.body;

      if (!name || !description || !rules) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const pattern = await tradingPatternService.createPattern({
        name,
        description,
        rules,
        metadata,
      });

      return res.status(201).json(pattern);
    } catch (error) {
      console.error("Error creating pattern:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updatePattern(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { name, description, rules, metadata } = req.body;

      const pattern = await tradingPatternService.updatePattern(id, {
        name,
        description,
        rules,
        metadata,
      });

      return res.json(pattern);
    } catch (error) {
      if (error instanceof Error && error.message === "Pattern not found") {
        return res.status(404).json({ error: "Pattern not found" });
      }
      console.error("Error updating pattern:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async deletePattern(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;

      await tradingPatternService.deletePattern(id);

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting pattern:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const tradingPatternController = new TradingPatternController();
