import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = "embedding-001";

const tradingPatterns = [
  {
    content: `Double Bottom Pattern:
    A double bottom is a bullish reversal pattern that forms after a downtrend.
    It consists of two lows at approximately the same price level, creating a "W" shape.
    Key characteristics include:
    1. Similar price levels at both bottoms
    2. Volume typically higher on second bottom
    3. Confirmation when price breaks above the middle peak`,
    category: "PATTERN",
    tags: ["reversal", "bullish", "double-bottom", "w-pattern"],
    metadata: {
      success_rate: 72,
      timeframes: ["Daily", "4H"],
      volume_importance: "high",
      risk_ratio: 1.5,
    },
  },
  {
    content: `FOMO Trading Psychology:
    Fear Of Missing Out (FOMO) is a common psychological trap in trading.
    Traders often enter positions hastily when seeing rapid price movements.
    Key characteristics:
    1. Emotional rather than analytical decision making
    2. Entering at market peaks
    3. Ignoring technical analysis and risk management
    4. Usually results in buying high or selling low`,
    category: "PSYCHOLOGY",
    tags: ["psychology", "fomo", "emotional-trading", "risk-management"],
    metadata: {
      common_triggers: ["rapid price movement", "viral news", "market hype"],
      risk_level: "high",
      mitigation_strategies: [
        "Wait for pullbacks",
        "Stick to trading plan",
        "Set entry alerts",
      ],
    },
  },
  {
    content: `Head and Shoulders Pattern:
    A bearish reversal pattern consisting of three peaks, with the middle peak (head) higher than the two outer peaks (shoulders).
    Key characteristics:
    1. Left shoulder: Initial peak and decline
    2. Head: Higher peak showing final buyer exhaustion
    3. Right shoulder: Failed rally confirming weakness
    4. Neckline: Support line connecting the lows
    5. Volume typically decreases with each peak`,
    category: "PATTERN",
    tags: ["reversal", "bearish", "head-and-shoulders", "top-pattern"],
    metadata: {
      success_rate: 68,
      timeframes: ["Daily", "Weekly"],
      volume_importance: "critical",
      risk_ratio: 2.1,
      target_calculation: "Distance from head to neckline projected downward",
    },
  },
  {
    content: `Risk Management - Position Sizing:
    Proper position sizing is crucial for long-term trading success.
    Core principles:
    1. Never risk more than 1-2% of total capital per trade
    2. Account for market volatility in position size
    3. Reduce size in choppy markets
    4. Scale position size with win rate
    5. Consider correlation with existing positions`,
    category: "RISK_MANAGEMENT",
    tags: ["position-sizing", "risk-management", "capital-preservation"],
    metadata: {
      max_risk_percentage: 2,
      position_adjustments: [
        "Higher volatility = smaller position",
        "Strong trend = potential scale-in",
        "Multiple correlated pairs = reduce size",
      ],
      success_metrics: {
        account_growth: "Consistent small gains",
        drawdown_reduction: "40-60%",
      },
    },
  },
  {
    content: `Market Condition Analysis:
    Identifying the current market condition is essential for strategy selection.
    Key conditions:
    1. Trending Market: Strong directional movement with clear higher highs/lows
    2. Ranging Market: Price moving between clear support/resistance levels
    3. Choppy Market: No clear direction with frequent reversals
    4. Breakout Market: Period of high volatility after consolidation
    Each condition requires different trading approaches and risk management.`,
    category: "MARKET_CONDITION",
    tags: ["market-analysis", "trading-conditions", "strategy-selection"],
    metadata: {
      condition_characteristics: {
        trending: {
          indicators: ["ADX > 25", "Clear price channels"],
          best_strategies: ["Trend following", "Pullback trades"],
        },
        ranging: {
          indicators: ["ADX < 20", "Clear S/R levels"],
          best_strategies: ["Range trading", "Support/Resistance bounces"],
        },
        choppy: {
          indicators: ["ADX < 15", "Frequent direction changes"],
          best_strategies: ["Reduced position size", "Avoid trading"],
        },
      },
    },
  },
  {
    content: `Loss Recovery Psychology:
    Managing psychological state after significant losses is crucial for trading success.
    Key principles:
    1. Accept losses as part of trading
    2. Avoid revenge trading
    3. Review but don't dwell on losses
    4. Maintain strict risk management
    5. Return to trading gradually
    Common mistakes to avoid:
    - Doubling down to recover losses
    - Trading larger sizes to "make it back"
    - Abandoning trading plan`,
    category: "PSYCHOLOGY",
    tags: [
      "psychology",
      "loss-recovery",
      "risk-management",
      "emotional-control",
    ],
    metadata: {
      recovery_steps: [
        "Take a short break",
        "Review trading journal",
        "Identify lesson learned",
        "Start with smaller sizes",
        "Focus on process over outcome",
      ],
      warning_signs: [
        "Emotional trading",
        "Deviation from plan",
        "Increased position sizes",
      ],
      success_metrics: "Return to consistent execution",
    },
  },
];

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: embeddingModel });
  const result = await model.embedContent(text);
  const embedding = await result.embedding;
  return embedding.values;
}

async function main() {
  console.log("🌱 Starting trading knowledge base seeding...");

  try {
    for (const pattern of tradingPatterns) {
      const embedding = await generateEmbedding(pattern.content);

      await prisma.$executeRaw`
        INSERT INTO trading_knowledge_embeddings (
          id, content, embedding, category, tags, metadata, "createdAt", "updatedAt"
        )
        VALUES (
          uuid_generate_v4(),
          ${pattern.content},
          ${JSON.stringify(embedding)}::vector,
          ${pattern.category},
          ${pattern.tags},
          ${JSON.stringify(pattern.metadata)}::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT (content) DO UPDATE SET
          embedding = ${JSON.stringify(embedding)}::vector,
          category = ${pattern.category},
          tags = ${pattern.tags},
          metadata = ${JSON.stringify(pattern.metadata)}::jsonb,
          "updatedAt" = NOW()
      `;

      console.log(`✅ Seeded pattern: ${pattern.category}`);
    }

    console.log("✅ Successfully seeded trading knowledge base");
  } catch (error) {
    console.error("❌ Error seeding trading knowledge base:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
