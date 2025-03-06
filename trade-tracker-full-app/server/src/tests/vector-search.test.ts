import { supabase, insertStrategy, similaritySearch } from "../lib/supabase";

async function testVectorSearch() {
  try {
    // Test data
    const testStrategy = {
      name: "EMA Crossover",
      description: "A trend-following strategy using exponential moving averages",
      rules: "Buy when fast EMA crosses above slow EMA, sell when it crosses below",
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()), // Mock embedding
      metadata: {
        timeframes: ["1h", "4h"],
        indicators: ["EMA"],
        riskLevel: "medium",
      },
    };

    console.log("Inserting test strategy...");
    await insertStrategy(testStrategy.name, testStrategy.description, testStrategy.rules, testStrategy.embedding, testStrategy.metadata);

    console.log("Testing similarity search...");
    const results = await similaritySearch(testStrategy.embedding, 5);
    console.log("Search results:", results);

    // Clean up
    if (results?.[0]?.id) {
      const { error } = await supabase.from("trading_strategies").delete().eq("id", results[0].id);

      if (error) throw error;
      console.log("Test strategy cleaned up");
    }

    console.log("✅ Vector search test completed successfully");
  } catch (error) {
    console.error("❌ Vector search test failed:", error);
    process.exit(1);
  }
}

// Run the test
testVectorSearch();
