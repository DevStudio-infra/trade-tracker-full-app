import express from "express";
import { knowledgeBaseController } from "../controllers/KnowledgeBaseController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Knowledge base operations (admin only)
router.post("/query", knowledgeBaseController.executeQuery.bind(knowledgeBaseController));
router.put("/:id", knowledgeBaseController.updateItem.bind(knowledgeBaseController));

// RAG feedback and metrics (authenticated users)
router.post("/feedback", knowledgeBaseController.createFeedback.bind(knowledgeBaseController));
router.post("/metrics", knowledgeBaseController.trackMetrics.bind(knowledgeBaseController));

export default router;
