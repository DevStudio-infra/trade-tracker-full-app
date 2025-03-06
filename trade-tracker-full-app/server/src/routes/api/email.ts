import { Router, Request, Response } from "express";
import { EmailService } from "../../services/email";
import { verifyAuth, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();
const emailService = EmailService.getInstance();

// Send email endpoint
router.post("/send", verifyAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    const { to, subject, html } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await emailService.sendEmail({
      to,
      subject,
      html,
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Track email opens
router.get("/track/:trackingId", async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    await emailService.markEmailOpened(trackingId);

    // Return a 1x1 transparent GIF
    const transparentPixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": transparentPixel.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(transparentPixel);
  } catch (error) {
    console.error("Error tracking email:", error);
    res.status(500).send("Error tracking email");
  }
});

// Get email stats
router.get("/stats", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.auth!;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const stats = await emailService.getEmailStats(userId, startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching email stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
