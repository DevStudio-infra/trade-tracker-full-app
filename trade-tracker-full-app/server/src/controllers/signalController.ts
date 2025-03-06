import { Request, Response } from "express";
import { signalDetection } from "../services/signalDetection";
import { z } from "zod";

// Request validation schemas
const generateSignalSchema = z.object({
  symbol: z.string(),
  technicalData: z.object({
    rsi: z.number().min(0).max(100).optional(),
    macd: z
      .object({
        macdLine: z.number(),
        signalLine: z.number(),
        histogram: z.number(),
      })
      .optional(),
    movingAverages: z
      .object({
        ma20: z.number(),
        ma50: z.number(),
        ma200: z.number(),
      })
      .optional(),
    atr: z.number().positive().optional(),
  }),
  marketConditions: z.object({
    trend: z.enum(["BULLISH", "BEARISH", "SIDEWAYS"]),
    volatility: z.enum(["HIGH", "MEDIUM", "LOW"]),
    volume: z.enum(["HIGH", "MEDIUM", "LOW"]),
    keyLevels: z.array(z.number()),
  }),
  marketSentiment: z.object({
    overallSentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    confidence: z.number().min(0).max(1),
    sources: z.object({
      technical: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
      news: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
      social: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    }),
  }),
});

export const signalController = {
  async generateSignal(req: Request, res: Response) {
    try {
      const validatedData = generateSignalSchema.parse(req.body);

      const signal = await signalDetection.generateSignal(validatedData.symbol, validatedData.technicalData, validatedData.marketConditions, validatedData.marketSentiment);

      res.json({
        success: true,
        data: signal,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async validateSignal(req: Request, res: Response) {
    try {
      const signal = req.body;
      const isValid = await signalDetection.validateSignal(signal);

      res.json({
        success: true,
        data: { isValid },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async getActiveSignals(req: Request, res: Response) {
    try {
      const { symbol } = req.query;
      const signals = signalDetection.getActiveSignals(symbol as string | undefined);

      res.json({
        success: true,
        data: signals,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },

  async cleanupExpiredSignals(req: Request, res: Response) {
    try {
      signalDetection.removeExpiredSignals();
      res.json({
        success: true,
        message: "Expired signals removed successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },
};
