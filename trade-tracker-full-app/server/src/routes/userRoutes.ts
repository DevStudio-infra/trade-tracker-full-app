import express from "express";
import { userController } from "../controllers/UserController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// User management routes
router.delete("/", userController.deleteUser.bind(userController));
router.post("/welcome-seen", userController.updateWelcomeSeen.bind(userController));
router.post("/accept-terms", userController.updateTermsAcceptance.bind(userController));
router.post("/accept-privacy", userController.updatePrivacyAcceptance.bind(userController));
router.get("/by-subscription", userController.getUsersBySubscription.bind(userController));

export default router;
