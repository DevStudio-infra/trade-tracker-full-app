import express from "express";
import { sessionController } from "../controllers/SessionController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Session management routes
router.get("/", sessionController.listSessions);
router.post("/", sessionController.createSession);
router.get("/:id", sessionController.getSession);
router.patch("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

// Analysis routes
router.post("/analyze", sessionController.createAnalysis);

export default router;
