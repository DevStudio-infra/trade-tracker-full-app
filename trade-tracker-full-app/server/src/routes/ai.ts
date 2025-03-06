import express from "express";
import { AIService, AIRequest } from "../services/ai";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Initialize AI service
const aiService = AIService.getInstance();

// Route for streaming AI responses
router.post("/stream", authenticateUser, async (req, res) => {
  try {
    const request: AIRequest = req.body;
    const result = await aiService.generateStreamingResponse(request);

    // Set up streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream the response
    for await (const delta of result.textStream) {
      res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Error in AI stream route:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
  }
});

// Route for JSON AI responses
router.post("/json", authenticateUser, async (req, res) => {
  try {
    const request: AIRequest = req.body;
    const response = await aiService.generateJSONResponse(request);
    res.json(response);
  } catch (error) {
    console.error("Error in AI JSON route:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
  }
});

export default router;
