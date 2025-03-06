import { Request, Response } from "express";
import { sessionService } from "../services/SessionService";

export class SessionController {
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sessionId = req.params.id;
      const session = await sessionService.findById(sessionId, userId);

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.json(session);
    } catch (error) {
      console.error("[SESSION_GET_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sessionId = req.params.id;
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: "Missing session name" });
        return;
      }

      const session = await sessionService.updateSession(sessionId, userId, name);
      res.json(session);
    } catch (error) {
      console.error("[SESSION_PATCH_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sessionId = req.params.id;
      await sessionService.deleteSession(sessionId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("[SESSION_DELETE_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const sessions = await sessionService.listSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("[SESSIONS_GET_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: "Missing session name" });
        return;
      }

      const session = await sessionService.createSession(userId, name);
      res.json(session);
    } catch (error) {
      console.error("[SESSIONS_POST_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { sessionId, type, prompt, image, result } = req.body;

      if (!sessionId || !type || !prompt || !image || !result) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Verify session exists and belongs to user
      const session = await sessionService.findById(sessionId, userId);
      if (!session) {
        res.status(400).json({ error: "Invalid session" });
        return;
      }

      const analysis = await sessionService.createAnalysis(sessionId, type, prompt, image, result);

      res.json(analysis);
    } catch (error) {
      console.error("[ANALYSIS_CREATE_ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const sessionController = new SessionController();
