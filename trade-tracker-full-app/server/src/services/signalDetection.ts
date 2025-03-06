import { gemini } from "./gemini";
import { AIService } from "./ai";
import { z } from "zod";

// Signal types and interfaces
export enum SignalType {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
  RISK_ADJUSTMENT = "RISK_ADJUSTMENT",
}

export enum SignalStrength {
  STRONG = "STRONG",
  MODERATE = "MODERATE",
  WEAK = "WEAK",
}

export interface MarketCondition {
  trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
  volatility: "HIGH" | "MEDIUM" | "LOW";
  volume: "HIGH" | "MEDIUM" | "LOW";
  keyLevels: number[];
}

export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  movingAverages?: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  atr?: number;
}

export interface MarketSentiment {
  overallSentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  sources: {
    technical: "BULLISH" | "BEARISH" | "NEUTRAL";
    news: "BULLISH" | "BEARISH" | "NEUTRAL";
    social: "BULLISH" | "BEARISH" | "NEUTRAL";
  };
}

export interface TradingSignal {
  id: string;
  type: SignalType;
  symbol: string;
  strength: SignalStrength;
  timestamp: Date;
  expiresAt: Date;
  confidence: number;
  technicalIndicators: TechnicalIndicators;
  marketConditions: MarketCondition;
  marketSentiment: MarketSentiment;
  suggestedEntry?: number;
  suggestedStopLoss?: number;
  suggestedTakeProfit?: number;
  reasoning: string;
  metadata: Record<string, any>;
}

// Validation schemas
const technicalIndicatorsSchema = z.object({
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
});

const marketConditionSchema = z.object({
  trend: z.enum(["BULLISH", "BEARISH", "SIDEWAYS"]),
  volatility: z.enum(["HIGH", "MEDIUM", "LOW"]),
  volume: z.enum(["HIGH", "MEDIUM", "LOW"]),
  keyLevels: z.array(z.number()),
});

const marketSentimentSchema = z.object({
  overallSentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  confidence: z.number().min(0).max(1),
  sources: z.object({
    technical: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    news: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    social: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  }),
});

export class SignalDetectionService {
  private static instance: SignalDetectionService;
  private aiService: AIService;
  private activeSignals: Map<string, TradingSignal>;

  private constructor() {
    this.aiService = AIService.getInstance();
    this.activeSignals = new Map();
  }

  public static getInstance(): SignalDetectionService {
    if (!SignalDetectionService.instance) {
      SignalDetectionService.instance = new SignalDetectionService();
    }
    return SignalDetectionService.instance;
  }

  public async analyzeTechnicalIndicators(data: TechnicalIndicators): Promise<{
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `
      Analyze these technical indicators and provide a trading sentiment:
      ${JSON.stringify(data, null, 2)}

      Respond with a JSON object containing:
      {
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "confidence": number between 0 and 1,
        "reasoning": "detailed explanation"
      }
    `;

    const response = await this.aiService.generateJSONResponse({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.3,
      maxTokens: 1000,
    });

    return response;
  }

  public async analyzeMarketConditions(conditions: MarketCondition): Promise<{
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `
      Analyze these market conditions and provide a trading sentiment:
      ${JSON.stringify(conditions, null, 2)}

      Respond with a JSON object containing:
      {
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "confidence": number between 0 and 1,
        "reasoning": "detailed explanation"
      }
    `;

    const response = await this.aiService.generateJSONResponse({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.3,
      maxTokens: 1000,
    });

    return response;
  }

  public async generateSignal(symbol: string, technicalData: TechnicalIndicators, marketConditions: MarketCondition, marketSentiment: MarketSentiment): Promise<TradingSignal> {
    // Validate inputs
    try {
      technicalIndicatorsSchema.parse(technicalData);
      marketConditionSchema.parse(marketConditions);
      marketSentimentSchema.parse(marketSentiment);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Invalid input data: ${error.message}`);
      }
      throw new Error("Invalid input data: Unknown error occurred");
    }

    // Analyze technical indicators
    const technicalAnalysis = await this.analyzeTechnicalIndicators(technicalData);
    const marketAnalysis = await this.analyzeMarketConditions(marketConditions);

    // Generate the final signal using AI
    const prompt = `
      Based on the following analyses, generate a trading signal:

      Technical Analysis: ${JSON.stringify(technicalAnalysis, null, 2)}
      Market Analysis: ${JSON.stringify(marketAnalysis, null, 2)}
      Market Sentiment: ${JSON.stringify(marketSentiment, null, 2)}

      Respond with a JSON object containing:
      {
        "type": "ENTRY" | "EXIT" | "RISK_ADJUSTMENT",
        "strength": "STRONG" | "MODERATE" | "WEAK",
        "confidence": number between 0 and 1,
        "suggestedEntry": number or null,
        "suggestedStopLoss": number or null,
        "suggestedTakeProfit": number or null,
        "reasoning": "detailed explanation"
      }
    `;

    const signalDetails = await this.aiService.generateJSONResponse({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.4,
      maxTokens: 1000,
    });

    const signal: TradingSignal = {
      id: `${symbol}-${Date.now()}`,
      type: signalDetails.type,
      symbol,
      strength: signalDetails.strength,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiration
      confidence: signalDetails.confidence,
      technicalIndicators: technicalData,
      marketConditions,
      marketSentiment,
      suggestedEntry: signalDetails.suggestedEntry,
      suggestedStopLoss: signalDetails.suggestedStopLoss,
      suggestedTakeProfit: signalDetails.suggestedTakeProfit,
      reasoning: signalDetails.reasoning,
      metadata: {
        technicalAnalysis,
        marketAnalysis,
      },
    };

    // Store the signal
    this.activeSignals.set(signal.id, signal);

    return signal;
  }

  public async validateSignal(signal: TradingSignal): Promise<boolean> {
    // Check if signal is expired
    if (signal.expiresAt < new Date()) {
      return false;
    }

    // Perform cross-validation using another AI agent
    const prompt = `
      Validate this trading signal:
      ${JSON.stringify(signal, null, 2)}

      Respond with a JSON object containing:
      {
        "isValid": boolean,
        "confidence": number between 0 and 1,
        "reasoning": "detailed explanation"
      }
    `;

    const validation = await this.aiService.generateJSONResponse({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.3,
      maxTokens: 1000,
    });

    return validation.isValid && validation.confidence > 0.7;
  }

  public getActiveSignals(symbol?: string): TradingSignal[] {
    const now = new Date();
    const signals = Array.from(this.activeSignals.values()).filter((signal) => signal.expiresAt > now);

    if (symbol) {
      return signals.filter((signal) => signal.symbol === symbol);
    }

    return signals;
  }

  public removeExpiredSignals(): void {
    const now = new Date();
    for (const [id, signal] of this.activeSignals) {
      if (signal.expiresAt <= now) {
        this.activeSignals.delete(id);
      }
    }
  }
}

export const signalDetection = SignalDetectionService.getInstance();
