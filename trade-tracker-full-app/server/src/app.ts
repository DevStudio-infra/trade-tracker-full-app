// server/src/app.ts

import cookieParser from "cookie-parser";
import express, { Express, Request, Response, NextFunction } from "express";
import flash from "express-flash";
import morgan from "morgan";
import { generalErrorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import routes from "./routes/index";
import cors from "cors";
import apiKeysRouter from "./routes/api-keys";
import subscriptionsRouter from "./routes/subscriptions";
import emailRouter from "./routes/api/email";
import tradingRouter from "./routes/trading";
import riskRouter from "./routes/risk";
import aiRouter from "./routes/ai";
import knowledgeBaseRouter from "./routes/knowledgeBase";
import signalsRouter from "./routes/signals";
import creditsRouter from "./routes/credits";
import marketAnalysisRouter from "./routes/marketAnalysis";
import userRouter from "./routes/userRoutes";
import sessionRouter from "./routes/sessionRoutes";
import creditRouter from "./routes/creditRoutes";
import newsletterRouter from "./routes/newsletterRoutes";
import tradingPatternRoutes from "./routes/tradingPatternRoutes";
import stripeWebhooks from "./routes/webhooks/stripeWebhooks";

const app: Express = express();

// Apply middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

// API Routes
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/email", emailRouter);
app.use("/api/trading", tradingRouter);
app.use("/api/risk", riskRouter);
app.use("/api/ai", aiRouter);
app.use("/api/knowledge-base", knowledgeBaseRouter);
app.use("/api/signals", signalsRouter);
app.use("/api/credits", creditsRouter);
app.use("/api/market-analysis", marketAnalysisRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/credits", creditRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/trading-patterns", tradingPatternRoutes);
app.use("/api/webhooks/stripe", stripeWebhooks);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(generalErrorHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

export default app;
