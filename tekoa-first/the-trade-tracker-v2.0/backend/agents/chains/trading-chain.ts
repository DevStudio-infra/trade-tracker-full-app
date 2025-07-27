/**
 * Trading Chain - LangChain.js Implementation
 * Purpose: Main LLM-powered trading decision chain
 * Orchestrates all agents to make intelligent trading decisions
 */

import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentResult } from "../types/agent.types";
import { HumanMessage } from "@langchain/core/messages";
import { langchainConfig } from "../../config/langchain.config";
import { RobustJSONParser } from "../../services/ai/json-parser";
import { multiTimeframeAnalysisService } from "../../services/multi-timeframe-analysis.service";
import { TradeVerificationLoggerService } from "../../services/trade-verification-logger.service";
import { loggerService } from "../../services/logger.service";

/**
 * Google Gemini API Rate Limiter
 * Handles rate limiting for Google Gemini API to prevent 429 errors
 */
class GeminiRateLimiter {
  private static instance: GeminiRateLimiter;
  private queue: Array<{ execute: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();

  // Conservative rate limits for Google Gemini API
  private readonly MIN_INTERVAL = 2000; // 2 seconds between requests
  private readonly MAX_REQUESTS_PER_MINUTE = 25; // 25 requests per minute (well below 60 limit)
  private readonly BURST_DELAY = 30000; // 30 second delay after rate limit hit

  static getInstance(): GeminiRateLimiter {
    if (!GeminiRateLimiter.instance) {
      GeminiRateLimiter.instance = new GeminiRateLimiter();
    }
    return GeminiRateLimiter.instance;
  }

  async addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: requestFn,
        resolve,
        reject,
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Add timeout wrapper to prevent hanging API calls
   */
  async addToQueueWithTimeout<T>(requestFn: () => Promise<T>, timeoutMs: number = 30000): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const requestPromise = this.addToQueue(requestFn);

    return Promise.race([requestPromise, timeoutPromise]);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();

      // Reset window if needed
      if (now - this.windowStart >= 60000) {
        this.requestCount = 0;
        this.windowStart = now;
      }

      // Check if we need to wait
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_INTERVAL) {
        await this.delay(this.MIN_INTERVAL - timeSinceLastRequest);
      }

      // Check rate limit
      if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
        const waitTime = 60000 - (now - this.windowStart);
        if (waitTime > 0) {
          loggerService.warn(`Google Gemini rate limit reached, waiting ${waitTime}ms`);
          await this.delay(waitTime);
          this.requestCount = 0;
          this.windowStart = Date.now();
        }
      }

      const item = this.queue.shift()!;

      try {
        loggerService.debug(`🤖 Processing Gemini API request (${this.requestCount + 1}/${this.MAX_REQUESTS_PER_MINUTE})`);
        const result = await item.execute();
        this.lastRequestTime = Date.now();
        this.requestCount++;
        item.resolve(result);

        // Add small delay after each request
        await this.delay(500);
      } catch (error: any) {
        loggerService.error(`❌ Gemini API request failed:`, error.message);

        // Handle rate limit errors and quota exceeded
        if (
          error.status === 429 ||
          error.message?.includes("429") ||
          error.message?.includes("Too Many Requests") ||
          error.message?.includes("quota") ||
          error.message?.includes("Quota")
        ) {
          loggerService.warn(`🛑 Gemini API limit/quota hit! Adding ${this.BURST_DELAY}ms delay and resetting counters`);
          loggerService.warn(`Error details: ${error.message}`);
          await this.delay(this.BURST_DELAY);

          // Reset counters to be more conservative
          this.requestCount = 0;
          this.windowStart = Date.now();
          this.lastRequestTime = Date.now();
        }

        item.reject(error);
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export interface TradingDecision {
  decision: "EXECUTE_TRADE" | "HOLD" | "REJECT";
  confidence: number;
  reasoning: string;
  tradeParams?: {
    symbol: string;
    direction: "BUY" | "SELL";
    quantity: number;
    orderType: "MARKET" | "LIMIT";
    stopLoss?: number;
    takeProfit?: number;
  };
  riskAssessment: any;
  technicalAnalysis: any;
  positionSizing: any;
  executionStrategy: any;
  chartAnalysis?: string;
  riskFactors?: string[];
  multiTimeframeAnalysis?: any; // NEW: Multi-timeframe confluence data
}

export class TradingChain {
  private chain!: LLMChain;
  private llm: ChatGoogleGenerativeAI | undefined;
  private initialized: boolean = false;
  private decisionHistory: Array<{ timestamp: Date; decision: string; confidence: number; symbol: string }> = [];
  private readonly MAX_HISTORY = 10; // Keep last 10 decisions
  private tradeLogger: TradeVerificationLoggerService;

  constructor() {
    // Initialize without auto-setup to avoid circular dependencies
    this.tradeLogger = TradeVerificationLoggerService.getInstance();
  }

  async initialize(): Promise<void> {
    try {
      console.log("🤖 Initializing Trading Chain...");
      console.log("🔍 Environment Check:");
      console.log("- GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY);
      console.log("- GOOGLE_API_KEY length:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0);

      // Check if we have an API key - if not, use fallback mode
      if (!process.env.GOOGLE_API_KEY) {
        console.warn("⚠️  GOOGLE_API_KEY not found - TradingChain will use fallback decisions only");
        this.initialized = true; // Mark as initialized but without LLM
        return;
      }

      // Initialize LLM if we have an API key
      if (!this.llm) {
        console.log("🔍 Creating LLM instance...");
        this.llm = new ChatGoogleGenerativeAI({
          model: "gemini-1.5-flash", // Switch to Gemini 1.5 Flash due to quota issues with 2.0
          temperature: 0.1, // Low temperature for consistent decisions
          maxOutputTokens: 2000,
          apiKey: process.env.GOOGLE_API_KEY,
        });
        console.log("✅ LLM instance created successfully");
      }

      // Create the prompt template - Enhanced with bid/ask spread awareness
      const prompt = PromptTemplate.fromTemplate(`
You are an expert trading analyst with deep knowledge of technical analysis, risk management, and market microstructure.

CHART ANALYSIS CONTEXT:
- Symbol: {symbol}
- Timeframe: {timeframe} - IMPORTANT: Timeframe indicates chart granularity, NOT strategy type
- Current Price: {currentPrice}
- Market Conditions: {marketConditions}
- Strategy: You are analyzing this chart based on the provided trading strategy

ACCOUNT INFORMATION:
- Account Balance: {accountBalance}
- Available Balance: {availableBalance}

AGENT ANALYSIS RESULTS:
Risk Assessment: {riskAssessment}
Technical Analysis: {technicalAnalysis}
Position Sizing: {positionSizing}
Portfolio Status: {portfolioStatus}

🎯 CRITICAL STRATEGY AWARENESS:
Different strategies can use ANY timeframe - don't assume strategy type from timeframe alone:
- M1 charts can be used for: scalping, momentum, breakout, news trading, arbitrage
- H1 charts can be used for: swing trading, trend following, range trading, position trading
- Strategy rules and risk tolerance define the approach, NOT the timeframe
- Consider the FULL strategy context provided, not just the chart timeframe

💰 BID/ASK SPREAD & EXECUTION COST ANALYSIS:
When making trading decisions, ALWAYS consider:
- Current bid/ask spread as a percentage of price
- Spread impact on breakeven point (entry + spread = minimum profitable exit)
- For tight spreads (<0.05%): More favorable for frequent trading
- For wide spreads (>0.2%): Requires larger price moves to profit
- Slippage risk increases with spread width and volatility
- Market orders pay the spread immediately; limit orders may get filled at better prices

SPREAD-AWARE DECISION CRITERIA:
- Tight Spreads: Can be more aggressive with entries, scalping strategies viable
- Wide Spreads: Require higher confidence, longer holding periods, larger target moves
- If spread > 0.3% of current price, consider reducing position size or using limit orders
- Factor spread cost into stop-loss placement (stop should be spread + technical level)

STRATEGY-TIMEFRAME COMBINATIONS (Examples):
- Scalping on M1: Quick entries/exits, tight spreads essential, high-frequency
- Trend Following on M1: Intraday trend capture, medium holding time
- Breakout Trading on H1: Position for larger moves, can handle wider spreads
- Swing Trading on M1: Use fine-grained entry timing for multi-day holds

TRADING PHILOSOPHY - CONFIDENCE-BASED DECISION MAKING:
- HIGH CONFIDENCE (80-100%): Take decisive action when signals are clear and strong
- MEDIUM CONFIDENCE (60-79%): Be moderately aggressive with proper risk management
- LOW CONFIDENCE (40-59%): Hold or take very small positions
- VERY LOW CONFIDENCE (<40%): Reject the trade

ENHANCED DECISION GUIDELINES:
1. **EXECUTE_TRADE**: When you see clear, strong signals with good risk/reward (confidence 60%+)
   - Clear trend direction with momentum
   - Strong technical indicator alignment
   - Good support/resistance levels for stops
   - Risk/reward ratio accounts for spread costs (minimum 1:2 after spread)
   - Spread is reasonable for the strategy type

2. **HOLD**: When signals are mixed or spread conditions are unfavorable (confidence 40-60%)
   - Consolidation patterns
   - Conflicting indicators
   - Uncertain market direction
   - Spread too wide for strategy requirements

3. **REJECT**: When signals are clearly negative, spreads too costly, or setup poor (confidence <40%)
   - Strong opposing trends
   - Poor risk/reward ratios after spread costs
   - Excessive spread for expected move size
   - High volatility without clear direction

STOP LOSS & TAKE PROFIT STRATEGY (Spread-Aware):
- Place stops beyond nearest support/resistance PLUS spread buffer
- For M1 timeframe: typical stop distance 0.3-0.8% + spread width
- Take profit should account for spread costs: minimum (spread x 2) + technical target
- In wide spread environments, use wider stops and targets proportionally
- Consider partial profit-taking to reduce spread impact

BID/ASK SPREAD DECISION MATRIX:
- Spread < 0.05%: Green light for all strategies, tight stops viable
- Spread 0.05-0.15%: Caution for scalping, good for other strategies
- Spread 0.15-0.3%: Avoid scalping, use wider targets, consider limit orders
- Spread > 0.3%: High caution, only high-confidence setups, wide targets

Return your analysis in the following JSON format (ensure valid JSON):
{{
  "decision": "EXECUTE_TRADE" | "HOLD" | "REJECT",
  "confidence": 0-100,
  "reasoning": "your detailed analysis including spread considerations",
  "tradeParams": {{
    "symbol": "{symbol}",
    "direction": "BUY" | "SELL" | null,
    "quantity": number | 0,
    "orderType": "MARKET" | "LIMIT" | null,
    "stopLoss": number | null,
    "takeProfit": number | null
  }},
  "spreadAnalysis": {{
    "spreadPercentage": number,
    "spreadImpact": "LOW" | "MEDIUM" | "HIGH",
    "adjustedTargets": boolean,
    "executionRecommendation": "MARKET" | "LIMIT" | "CONDITIONAL"
  }},
  "strategyAlignment": {{
    "timeframeAppropriate": boolean,
    "strategyType": "inferred strategy type",
    "holdingPeriodExpected": "SHORT" | "MEDIUM" | "LONG",
    "spreadTolerance": "TIGHT" | "MODERATE" | "WIDE"
  }},
  "chartAnalysis": "technical analysis summary",
  "riskFactors": ["array of risk factors including spread risks"],
  "executionStrategy": {{ "priority": "High/Medium/Low", "timeframe": "...", "notes": "execution timing and method" }}
}}

CRITICAL:
- Use the EXACT symbol {symbol} in tradeParams.symbol field
- ALWAYS analyze spread impact before recommending trades
- Consider strategy context beyond just timeframe
- Factor execution costs into all risk/reward calculations
- Be more conservative with wide spreads, more aggressive with tight spreads

      `);

      this.chain = prompt.pipe(this.llm).pipe(this.parser);
      this.initialized = true;

      loggerService.info("✅ Enhanced Trading Chain initialized successfully with spread awareness");
    } catch (error) {
      loggerService.error("❌ Failed to initialize Trading Chain:", error);
      throw error;
    }
  }

  /**
   * Make a trading decision based on all agent inputs and optional chart image
   */
  async makeTradingDecision(
    marketData: {
      symbol: string;
      currentPrice: number;
      marketConditions: string;
      spread?: number; // Add spread data
      bid?: number; // Add bid data
      ask?: number; // Add ask data
    },
    agentResults: {
      riskAssessment: any;
      technicalAnalysis: any;
      positionSizing: any;
      portfolioStatus: any;
      higherTimeframeAnalysis?: any;
    },
    accountData: {
      balance: number;
      availableBalance: number;
    },
    chartImageBase64?: string
  ): Promise<AgentResult> {
    let multiTimeframeAnalysis = null; // Declare at function scope

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log(`🤖 Making trading decision for ${marketData.symbol}`);
      console.log(`📊 Chart image provided: ${chartImageBase64 ? "YES" : "NO"}`);

      // SIMPLIFIED: Multi-timeframe analysis now handled by simplified service in bot evaluation
      // The higher timeframe context is passed via marketData.marketConditions
      try {
        console.log(`🔍 Using simplified higher timeframe analysis from bot evaluation service...`);
        // Check if higher timeframe context is included in market conditions
        if (marketData.marketConditions.includes("HIGHER TIMEFRAME CONTEXT")) {
          console.log(`✅ Higher timeframe context detected in market conditions`);
        } else {
          console.log(`⚠️ No higher timeframe context found in market conditions`);
        }
      } catch (error) {
        console.warn(`⚠️ Higher timeframe context check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      // Enhanced market conditions with spread information
      let enhancedMarketConditions = marketData.marketConditions;

      if (marketData.spread || (marketData.bid && marketData.ask)) {
        const spread = marketData.spread || marketData.ask - marketData.bid;
        const spreadPercentage = (spread / marketData.currentPrice) * 100;

        enhancedMarketConditions += `\n\nSPREAD ANALYSIS:`;
        enhancedMarketConditions += `\n- Current Bid: ${marketData.bid || "N/A"}`;
        enhancedMarketConditions += `\n- Current Ask: ${marketData.ask || "N/A"}`;
        enhancedMarketConditions += `\n- Spread: ${spread.toFixed(5)} (${spreadPercentage.toFixed(3)}%)`;
        enhancedMarketConditions += `\n- Spread Impact: ${spreadPercentage < 0.05 ? "LOW" : spreadPercentage < 0.15 ? "MEDIUM" : "HIGH"}`;
        enhancedMarketConditions += `\n- Execution Cost: Entry must move ${spreadPercentage.toFixed(3)}% to breakeven`;
      }

      // Include higher timeframe analysis in market conditions
      if (agentResults.higherTimeframeAnalysis) {
        enhancedMarketConditions += `\n\nHIGHER TIMEFRAME CONTEXT:\n${JSON.stringify(agentResults.higherTimeframeAnalysis, null, 2)}`;
      }

      // Prepare the input for the chain
      const input = {
        symbol: marketData.symbol,
        currentPrice: marketData.currentPrice,
        marketConditions: enhancedMarketConditions,
        accountBalance: accountData.balance,
        availableBalance: accountData.availableBalance,
        riskAssessment: JSON.stringify(agentResults.riskAssessment, null, 2),
        technicalAnalysis: JSON.stringify(agentResults.technicalAnalysis, null, 2),
        positionSizing: JSON.stringify(agentResults.positionSizing, null, 2),
        portfolioStatus: JSON.stringify(agentResults.portfolioStatus, null, 2),
      };

      loggerService.info(`🧠 Making enhanced trading decision for ${marketData.symbol} with spread awareness`);

      const result = await this.chain.invoke(input);

      // Extract text from response
      const responseText = result.content || result.text || result;
      console.log("🔍 Raw LLM Response:", responseText);

      // Parse the LLM response
      let decision: TradingDecision;
      try {
        console.log("🔍 Raw LLM Response:", responseText);

        // Use the enhanced robust JSON parser
        decision = RobustJSONParser.parseWithFallback(responseText, {
          symbol: marketData.symbol,
          currentPrice: marketData.currentPrice,
        });

        console.log("✅ Successfully parsed LLM decision:", decision.decision, `(${decision.confidence}% confidence)`);

        // Log chart analysis if available
        if (decision.chartAnalysis) {
          console.log("📊 Chart Analysis:", decision.chartAnalysis);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse LLM response:", parseError);
        console.error("❌ Raw response was:", responseText);
        // Fallback decision if LLM doesn't return valid JSON
        decision = this.createFallbackDecision(agentResults, marketData, multiTimeframeAnalysis);
        console.warn("⚠️  Using fallback decision due to JSON parse failure");
      }

      // Validate decision
      const validation = this.validateDecision(decision, agentResults, accountData);
      if (!validation.valid) {
        decision.decision = "REJECT";
        decision.reasoning = `Decision validation failed: ${validation.reason}`;
      }

      // Track this decision in history for pattern analysis
      this.addDecisionToHistory(decision.decision, decision.confidence, marketData.symbol);

      console.log(`🤖 Trading decision: ${decision.decision} (${decision.confidence}% confidence)`);

      // LOG LLM DECISION FOR VERIFICATION
      this.tradeLogger.logLLMDecision({
        botId: "trading-chain", // This will be replaced with actual botId when called from bot service
        symbol: marketData.symbol,
        action:
          decision.decision === "EXECUTE_TRADE"
            ? ((decision.tradeParams?.direction || "BUY") as "BUY" | "SELL" | "CLOSE" | "HOLD")
            : (decision.decision as "BUY" | "SELL" | "CLOSE" | "HOLD"),
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        marketData: marketData,
        technicalIndicators: agentResults.technicalAnalysis,
        llmResponse: responseText,
      });

      return {
        success: true,
        data: decision,
        metadata: {
          executionTime: Date.now() - Date.now(),
          source: chartImageBase64 ? "TradingChain-Multimodal" : "TradingChain-TextOnly",
        },
      };
    } catch (error) {
      console.error("❌ Error making trading decision:", error);

      return {
        success: false,
        error: `Trading decision failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: this.createFallbackDecision(agentResults, marketData, multiTimeframeAnalysis),
        metadata: {
          executionTime: Date.now() - Date.now(),
          source: "TradingChain",
        },
      };
    }
  }

  /**
   * Quick decision without full LLM analysis
   */
  async makeQuickDecision(
    technicalSignal: any,
    riskScore: number,
    confidence: number
  ): Promise<{
    decision: "EXECUTE_TRADE" | "HOLD" | "REJECT";
    reasoning: string;
  }> {
    try {
      // Simple rule-based decision
      if (riskScore > 7) {
        return {
          decision: "REJECT",
          reasoning: `Risk score too high: ${riskScore}/10`,
        };
      }

      if (confidence < 40) {
        return {
          decision: "HOLD",
          reasoning: `Confidence too low: ${confidence}%`,
        };
      }

      if (technicalSignal?.signal === "BUY" || technicalSignal?.signal === "SELL") {
        return {
          decision: "EXECUTE_TRADE",
          reasoning: `Technical signal: ${technicalSignal.signal} with ${confidence}% confidence`,
        };
      }

      return {
        decision: "HOLD",
        reasoning: "No clear trading signal",
      };
    } catch (error) {
      return {
        decision: "REJECT",
        reasoning: `Quick decision error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Private helper methods
   */
  private createFallbackDecision(agentResults: any, marketData: any, multiTimeframeAnalysis?: any): TradingDecision {
    console.log("🎯 Creating balanced fallback decision based on agent analysis");

    // Extract key metrics from agent results
    const riskScore = agentResults.riskAssessment?.score || 5;
    const technicalSignal = agentResults.technicalAnalysis?.signal || "NEUTRAL";
    const positionSize = agentResults.positionSizing?.recommendedSize || 0.001;

    // Calculate confidence based on signal strength and risk
    let confidence = 50; // Base confidence
    let decision: "EXECUTE_TRADE" | "HOLD" | "REJECT" = "HOLD";
    let direction: "BUY" | "SELL" = "BUY";

    // Analyze recent decision history to avoid getting stuck in HOLD
    const recentHolds = this.decisionHistory
      .filter((d) => d.timestamp.getTime() > Date.now() - 10 * 60 * 1000) // Last 10 minutes
      .filter((d) => d.decision === "HOLD").length;

    console.log(`📊 Recent HOLD decisions in last 10 minutes: ${recentHolds}`);

    // ENHANCED: Use multi-timeframe analysis for more sophisticated decisions
    let multiTimeframeBoost = 0;
    let multiTimeframeDirection = null;

    if (multiTimeframeAnalysis && multiTimeframeAnalysis.confluence && multiTimeframeAnalysis.recommendation) {
      const { confluence, recommendation } = multiTimeframeAnalysis;
      console.log(`🔍 Multi-timeframe confluence: ${confluence.overallTrend || "NEUTRAL"} (${confluence.confidence || 0}%)`);
      console.log(`🎯 Multi-timeframe recommendation: ${recommendation.action || "HOLD"} (${recommendation.confidence || 0}%)`);

      // Use multi-timeframe analysis to boost or reduce confidence
      if ((confluence.confidence || 0) > 70) {
        if (confluence.overallTrend === "BULLISH") {
          multiTimeframeBoost = 15;
          multiTimeframeDirection = "BUY";
        } else if (confluence.overallTrend === "BEARISH") {
          multiTimeframeBoost = 15;
          multiTimeframeDirection = "SELL";
        }
      }

      // If multi-timeframe strongly suggests a direction, override technical signal
      if ((recommendation.confidence || 0) > 75) {
        if (recommendation.action === "BUY") {
          multiTimeframeDirection = "BUY";
          multiTimeframeBoost += 10;
        } else if (recommendation.action === "SELL") {
          multiTimeframeDirection = "SELL";
          multiTimeframeBoost += 10;
        }
      }
    } else {
      console.log(`⚠️ Multi-timeframe analysis unavailable or incomplete`);
    }

    // CONFIDENCE-BASED DECISION LOGIC (Enhanced with multi-timeframe)
    if (technicalSignal === "STRONG_BUY" || technicalSignal === "BUY" || multiTimeframeDirection === "BUY") {
      confidence = technicalSignal === "STRONG_BUY" ? 75 : 65;
      confidence += multiTimeframeBoost; // Boost from multi-timeframe analysis
      direction = "BUY";

      // If we've been holding too long and have a buy signal, be more aggressive
      if (recentHolds >= 5 && confidence >= 60) {
        decision = "EXECUTE_TRADE";
        confidence += 10; // Boost confidence to break out of hold pattern
        console.log(`🚀 Breaking HOLD pattern: ${recentHolds} recent holds, executing BUY with boosted confidence`);
      } else if (confidence >= 70) {
        decision = "EXECUTE_TRADE";
      } else {
        decision = "HOLD";
      }
    } else if (technicalSignal === "STRONG_SELL" || technicalSignal === "SELL" || multiTimeframeDirection === "SELL") {
      confidence = technicalSignal === "STRONG_SELL" ? 75 : 65;
      confidence += multiTimeframeBoost; // Boost from multi-timeframe analysis
      direction = "SELL";

      // If we've been holding too long and have a sell signal, be more aggressive
      if (recentHolds >= 5 && confidence >= 60) {
        decision = "EXECUTE_TRADE";
        confidence += 10;
        console.log(`🚀 Breaking HOLD pattern: ${recentHolds} recent holds, executing SELL with boosted confidence`);
      } else if (confidence >= 70) {
        decision = "EXECUTE_TRADE";
      } else {
        decision = "HOLD";
      }
    } else {
      // NEUTRAL signal - but check if we should break out of hold pattern
      if (recentHolds >= 8) {
        // Been holding too long, take a small calculated risk
        decision = "EXECUTE_TRADE";
        // Use multi-timeframe direction if available, otherwise random
        direction =
          multiTimeframeDirection && (multiTimeframeDirection === "BUY" || multiTimeframeDirection === "SELL") ? multiTimeframeDirection : Math.random() > 0.5 ? "BUY" : "SELL";
        confidence = 55 + multiTimeframeBoost; // Low but acceptable confidence
        console.log(`⚡ Emergency breakout: ${recentHolds} consecutive holds, taking calculated risk (${direction})`);
      } else {
        decision = "HOLD";
        confidence = 45 + multiTimeframeBoost;
      }
    }

    // Risk adjustment
    if (riskScore > 7) {
      confidence -= 15;
      if (decision === "EXECUTE_TRADE" && confidence < 55) {
        decision = "HOLD";
        console.log("🛡️ High risk detected, reverting to HOLD");
      }
    } else if (riskScore < 3) {
      confidence += 10; // Low risk, boost confidence
    }

    // Calculate stop loss and take profit based on current price and direction
    const currentPrice = marketData.currentPrice;
    let stopLossPercent = 0.005; // 0.5% for M1 timeframe
    let takeProfitPercent = 0.015; // 1.5% for M1 timeframe

    // ENHANCED: Use multi-timeframe analysis for better stop loss and take profit
    if (multiTimeframeAnalysis && multiTimeframeAnalysis.recommendation) {
      const { optimalEntry, stopLoss, takeProfit } = multiTimeframeAnalysis.recommendation;

      // Use multi-timeframe stop loss and take profit if available
      if (stopLoss && takeProfit) {
        const calculatedSL = direction === "BUY" ? Math.max(stopLoss, currentPrice * (1 - stopLossPercent)) : Math.min(stopLoss, currentPrice * (1 + stopLossPercent));

        const calculatedTP = direction === "BUY" ? Math.min(takeProfit, currentPrice * (1 + takeProfitPercent)) : Math.max(takeProfit, currentPrice * (1 - takeProfitPercent));

        console.log(`📊 Using multi-timeframe levels: SL=${calculatedSL.toFixed(2)}, TP=${calculatedTP.toFixed(2)}`);
      }
    }

    const stopLoss = direction === "BUY" ? currentPrice * (1 - stopLossPercent) : currentPrice * (1 + stopLossPercent);
    const takeProfit = direction === "BUY" ? currentPrice * (1 + takeProfitPercent) : currentPrice * (1 - takeProfitPercent);

    const fallbackDecision: TradingDecision = {
      decision,
      confidence: Math.min(Math.max(confidence, 0), 100), // Clamp between 0-100
      reasoning: `Enhanced fallback decision: Technical signal: ${technicalSignal}, risk score: ${riskScore}, recent holds: ${recentHolds}${
        multiTimeframeAnalysis && multiTimeframeAnalysis.confluence
          ? `, multi-timeframe: ${multiTimeframeAnalysis.confluence.overallTrend || "NEUTRAL"} (${multiTimeframeAnalysis.confluence.confidence || 0}%)`
          : ""
      }. ${decision === "EXECUTE_TRADE" ? `Taking ${direction} position with ${confidence}% confidence.` : "Waiting for clearer signals."}`,
      tradeParams:
        decision === "EXECUTE_TRADE"
          ? {
              symbol: marketData.symbol,
              direction,
              quantity: positionSize,
              orderType: "MARKET" as const,
              stopLoss,
              takeProfit,
            }
          : undefined,
      riskAssessment: agentResults.riskAssessment,
      technicalAnalysis: agentResults.technicalAnalysis,
      positionSizing: agentResults.positionSizing,
      executionStrategy: {
        priority: confidence > 70 ? "HIGH" : confidence > 50 ? "MEDIUM" : "LOW",
        timeframe: "M1",
        conditions: [
          `Technical signal: ${technicalSignal}`,
          `Risk score: ${riskScore}`,
          multiTimeframeAnalysis && multiTimeframeAnalysis.confluence
            ? `Multi-timeframe: ${multiTimeframeAnalysis.confluence.overallTrend || "NEUTRAL"}`
            : "No multi-timeframe data",
        ],
      },
      chartAnalysis: `Enhanced fallback analysis: ${technicalSignal} signal with ${riskScore}/10 risk score${
        multiTimeframeAnalysis && multiTimeframeAnalysis.confluence ? `, multi-timeframe confluence: ${multiTimeframeAnalysis.confluence.overallTrend || "NEUTRAL"}` : ""
      }`,
      riskFactors: [
        `Risk score: ${riskScore}/10`,
        `Technical signal strength: ${technicalSignal}`,
        recentHolds > 5 ? "Pattern: Recent excessive holding" : "Pattern: Normal decision flow",
        multiTimeframeAnalysis && multiTimeframeAnalysis.confluence
          ? `Multi-timeframe confidence: ${multiTimeframeAnalysis.confluence.confidence || 0}%`
          : "No multi-timeframe analysis",
      ],
      multiTimeframeAnalysis,
    };

    // ⚡⚡⚡ SPECIAL TRADE EXECUTION LOGGING - HIGHLY VISIBLE ⚡⚡⚡
    if (decision === "EXECUTE_TRADE") {
      console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
      console.log("🚨                                                                      🚨");
      console.log("🚨  🎯 TRADE EXECUTION ALERT! BOT IS ABOUT TO PLACE AN ORDER! 🎯       🚨");
      console.log("🚨                                                                      🚨");
      console.log(`🚨  💰 Symbol: ${marketData.symbol}                                               🚨`);
      console.log(`🚨  📈 Direction: ${direction}                                              🚨`);
      console.log(`🚨  📊 Quantity: ${positionSize}                                             🚨`);
      console.log(`🚨  💵 Current Price: ${marketData.currentPrice}                                   🚨`);
      console.log(`🚨  🎯 Stop Loss: ${stopLoss.toFixed(4)}                                       🚨`);
      console.log(`🚨  🏆 Take Profit: ${takeProfit.toFixed(4)}                                   🚨`);
      console.log(`🚨  ✅ Confidence: ${confidence}%                                          🚨`);
      console.log(`🚨  ⚠️  Risk Score: ${riskScore}/10                                       🚨`);
      console.log("🚨                                                                      🚨");
      console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
    }

    // Record this decision in history
    this.addDecisionToHistory(decision, confidence, marketData.symbol);

    console.log(`🎯 Enhanced fallback decision: ${decision} (${confidence}% confidence) - ${fallbackDecision.reasoning}`);
    return fallbackDecision;
  }

  private validateDecision(decision: TradingDecision, agentResults: any, accountData: any): { valid: boolean; reason: string } {
    // Validate decision consistency
    if (decision.decision === "EXECUTE_TRADE") {
      // Check if trade parameters are provided
      if (!decision.tradeParams) {
        return { valid: false, reason: "Missing trade parameters" };
      }

      // IMPROVED RISK VALIDATION - Confidence-based approach
      const riskScore = agentResults.riskAssessment?.riskScore || 10;
      const confidence = decision.confidence || 0;

      // RELAXED risk thresholds - Allow more trades to execute
      // Lower thresholds to prevent trade rejection
      let maxRiskScore = 10; // Default: allow maximum risk
      if (confidence >= 90) {
        maxRiskScore = 10; // Very high confidence allows max risk
      } else if (confidence >= 80) {
        maxRiskScore = 10; // High confidence allows max risk
      } else if (confidence >= 70) {
        maxRiskScore = 10; // Medium-high confidence allows max risk
      } else if (confidence >= 60) {
        maxRiskScore = 10; // Medium confidence allows max risk
      } else if (confidence >= 50) {
        maxRiskScore = 10; // Low-medium confidence allows max risk
      } else {
        maxRiskScore = 9; // Only very low confidence has restriction
      }

      console.log(`🎯 Risk validation: Score=${riskScore}, Confidence=${confidence}%, Max allowed risk=${maxRiskScore}`);

      if (riskScore > maxRiskScore) {
        return { valid: false, reason: `Risk score ${riskScore} exceeds confidence-adjusted threshold ${maxRiskScore} (confidence: ${confidence}%)` };
      }

      // LOWERED confidence threshold to allow more trades (from 30 to 20)
      if (decision.confidence < 20) {
        return { valid: false, reason: `Confidence too low: ${decision.confidence}%` };
      }

      // Check position sizing - Universal position size validation and adjustment
      const quantity = decision.tradeParams.quantity || 0;
      const currentPrice = accountData.currentPrice || 100000;

      // UNIVERSAL FIX: Apply intelligent position size capping based on asset price
      let adjustedQuantity = quantity;

      // Capital.com specific broker limits based on asset price ranges
      if (currentPrice > 50000) {
        // BTC on Capital.com: CRITICAL - absolute maximum is 0.50 BTC
        adjustedQuantity = Math.min(quantity, 0.5);
      } else if (currentPrice > 10000) {
        // Very high-value assets: max 2.0 units
        adjustedQuantity = Math.min(quantity, 2.0);
      } else if (currentPrice > 1000) {
        // High-value assets (ETH-like): max 5.0 units
        adjustedQuantity = Math.min(quantity, 5.0);
      } else if (currentPrice > 100) {
        // Medium-value assets: max 50 units
        adjustedQuantity = Math.min(quantity, 50.0);
      } else if (currentPrice > 1) {
        // Low-value assets: max 100 units
        adjustedQuantity = Math.min(quantity, 100.0);
      } else {
        // Very low-value assets: max 1000 units
        adjustedQuantity = Math.min(quantity, 1000.0);
      }

      if (adjustedQuantity !== quantity) {
        console.log(`🔧 Universal position size cap applied: ${quantity} → ${adjustedQuantity} (price: ${currentPrice})`);
      }

      const positionValue = adjustedQuantity * currentPrice;
      const maxPositionValue = accountData.availableBalance * 0.1; // 10% limit for all assets

      console.log(`📊 Universal Position validation: ${adjustedQuantity} units × ${currentPrice} = ${positionValue} (max: ${maxPositionValue})`);

      if (positionValue > maxPositionValue) {
        // Auto-adjust position size based on account balance (universal for all assets)
        const finalAdjustedQuantity = Math.floor((maxPositionValue / currentPrice) * 1000) / 1000; // Round to 3 decimals
        console.log(`⚠️ Position size auto-adjusted for account balance: ${adjustedQuantity} → ${finalAdjustedQuantity} units (value: ${finalAdjustedQuantity * currentPrice})`);

        // Update the decision with the final adjusted size
        decision.tradeParams.quantity = finalAdjustedQuantity;
      } else {
        // Update with the broker-limit-capped size
        decision.tradeParams.quantity = adjustedQuantity;
      }
    }

    return { valid: true, reason: "Decision is valid" };
  }

  /**
   * Get chain statistics
   */
  async getChainStats(): Promise<{
    totalDecisions: number;
    executeRate: number;
    averageConfidence: number;
    lastDecision?: Date;
  }> {
    // Simplified stats - in production, would track actual decisions
    return {
      totalDecisions: 0,
      executeRate: 0,
      averageConfidence: 0,
      lastDecision: undefined,
    };
  }

  /**
   * Add a decision to the history for pattern tracking
   */
  private addDecisionToHistory(decision: string, confidence: number, symbol: string): void {
    this.decisionHistory.push({
      timestamp: new Date(),
      decision,
      confidence,
      symbol,
    });

    // Keep only the most recent decisions
    if (this.decisionHistory.length > this.MAX_HISTORY) {
      this.decisionHistory = this.decisionHistory.slice(-this.MAX_HISTORY);
    }
  }
}

// Export factory function instead of singleton instance
export const createTradingChain = () => new TradingChain();
