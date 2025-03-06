import { embeddingService } from "../lib/embeddings/gemini-embeddings.js";

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
  // ... rest of the patterns ...
];

async function main() {
  console.log("🌱 Starting trading knowledge base seeding...");

  try {
    await embeddingService.batchProcess(tradingPatterns);
    console.log("✅ Successfully seeded trading knowledge base");
  } catch (error) {
    console.error("❌ Error seeding trading knowledge base:", error);
    process.exit(1);
  }
}

main();
