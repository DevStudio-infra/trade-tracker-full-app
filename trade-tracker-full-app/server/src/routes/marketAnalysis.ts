import express from "express";
import { marketAnalysisController } from "../controllers/marketAnalysisController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Market analysis routes
router.post("/news/analyze", marketAnalysisController.analyzeNewsForAsset);

export default router;
