import { Request, Response } from "express";
import { knowledgeBaseService } from "../services/KnowledgeBaseService";
import { AuthUser } from "../types/auth";

export class KnowledgeBaseController {
  async executeQuery(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { query, params } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const result = await knowledgeBaseService.executeRawQuery(query, params);
      return res.json(result);
    } catch (error) {
      console.error("[KNOWLEDGE_BASE_QUERY_ERROR]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { title, content, metadata, tags } = req.body;

      const item = await knowledgeBaseService.updateKnowledgeItem(id, {
        title,
        content,
        metadata,
        tags,
      });

      return res.json(item);
    } catch (error) {
      console.error("[KNOWLEDGE_BASE_UPDATE_ERROR]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async createFeedback(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { itemId, query, response, isRelevant, feedback } = req.body;
      if (!itemId || !query || !response || typeof isRelevant !== "boolean") {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await knowledgeBaseService.createRagFeedback({
        itemId,
        userId: user.id,
        query,
        response,
        isRelevant,
        feedback,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("[RAG_FEEDBACK_ERROR]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async trackMetrics(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { itemId, action, metadata } = req.body;
      if (!itemId || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await knowledgeBaseService.trackUsageMetrics({
        itemId,
        userId: user.id,
        action,
        metadata,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("[KNOWLEDGE_BASE_METRICS_ERROR]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const knowledgeBaseController = new KnowledgeBaseController();
