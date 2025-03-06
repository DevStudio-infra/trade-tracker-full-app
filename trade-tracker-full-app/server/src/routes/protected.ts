import express from "express";
import { verifyAuth } from "../middleware/auth";

const router = express.Router();

// Use NextAuth middleware for protected routes
router.use(verifyAuth);

// Add your protected routes here
router.get("/test", (req, res) => {
  res.json({ message: "Protected route working", user: req.auth });
});

export default router;
