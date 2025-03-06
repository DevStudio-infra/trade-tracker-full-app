import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAuth, AuthenticatedRequest } from "../middleware/auth";
import { randomBytes } from "crypto";

const router = Router();
const prisma = new PrismaClient();

// Get all API keys for the current user
router.get("/", verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        lastUsed: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    res.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// Create a new API key
router.post("/", verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const key = `tt_${randomBytes(32).toString("hex")}`;
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        key,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    res.json({
      id: apiKey.id,
      name: apiKey.name,
      key,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// Delete an API key
router.delete("/:id", verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    res.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export default router;
