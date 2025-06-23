import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/context";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Custom error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

// Logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
const apiRouter = express.Router();

// Root endpoint
apiRouter.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Kitchen Management API is running" });
});

// Health check endpoint
apiRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    res.json({ status: "ok", services: { api: "up", database: "up" } });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", services: { api: "up", database: "down" } });
  }
});

// Mount API router
app.use("/api", apiRouter);

// Mount tRPC router
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Error handler middleware
app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`Error: ${message}`);

  res.status(statusCode).json({
    status: "error",
    message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`tRPC API available at http://localhost:${port}/trpc`);
});
