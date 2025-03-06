import express from "express";
import { userService } from "../services/UserService";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Schema for name update validation
const updateNameSchema = z.object({
  name: z.string().min(1).max(100),
});

// Schema for role update validation
const updateRoleSchema = z.object({
  role: z.enum([UserRole.ADMIN, UserRole.USER]),
});

// Update user name endpoint
router.patch("/:userId/name", validateRequest({ body: updateNameSchema }), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    // Verify user exists
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user name
    const updatedUser = await userService.updateName(userId, name);

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user name:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update user role endpoint
router.patch("/:userId/role", validateRequest({ body: updateRoleSchema }), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Verify user exists
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user role
    const updatedUser = await userService.updateRole(userId, role);

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
