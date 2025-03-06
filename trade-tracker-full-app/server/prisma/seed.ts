import { PrismaClient } from "@prisma/client";
import { gemini } from "../src/services/gemini";
import "dotenv/config";

const prisma = new PrismaClient();

// Sample trading strategies for development
const tradingStrategies = [
  {
    name: "EMA Crossover",
    description: "A trend-following strategy using exponential moving averages",
    rules: `1. Wait for the 9 EMA to cross above the 21 EMA
2. Confirm uptrend with 50 EMA pointing upward
3. Enter long position when price pulls back to 9 EMA
4. Set stop loss below recent swing low
5. Take profit at 2:1 risk-reward ratio`,
    metadata: {
      timeframes: ["1h", "4h"],
      indicators: ["EMA9", "EMA21", "EMA50"],
      riskLevel: "medium",
      type: "trend-following",
    },
  },
  {
    name: "RSI Divergence",
    description: "A reversal strategy using RSI divergence patterns",
    rules: `1. Identify lower lows in price action
2. Look for higher lows in RSI (bullish divergence)
3. Wait for RSI to cross above 30
4. Enter long position with tight stop loss
5. Target previous swing high`,
    metadata: {
      timeframes: ["15m", "1h"],
      indicators: ["RSI"],
      riskLevel: "high",
      type: "reversal",
    },
  },
  {
    name: "Support and Resistance Breakout",
    description: "A breakout strategy trading key level breaks",
    rules: `1. Identify strong support/resistance levels
2. Wait for price to consolidate near level
3. Enter on breakout with volume confirmation
4. Set stop loss below/above the level
5. Target the next key level`,
    metadata: {
      timeframes: ["4h", "1d"],
      indicators: ["Volume", "Price Action"],
      riskLevel: "medium",
      type: "breakout",
    },
  },
];

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await prisma.tradingStrategy.deleteMany();
    console.log("Cleared existing trading strategies");

    // Insert trading strategies with Gemini embeddings
    for (const strategy of tradingStrategies) {
      const embedding = await gemini.generateStrategyEmbedding(strategy);
      await prisma.tradingStrategy.create({
        data: {
          ...strategy,
          embedding,
        },
      });
      console.log(`✅ Added strategy: ${strategy.name}`);
    }
    console.log(`✅ Added ${tradingStrategies.length} trading strategies`);

    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seeding
seed();
