import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TEST_TOKEN = "test-token";
const BASE_URL = "http://localhost:5000/api/knowledge-base";

async function testKnowledgeBase() {
  try {
    console.log("Testing Knowledge Base Integration...\n");

    // Test 1: Add a new trading strategy
    console.log("Test 1: Adding new trading strategy...");
    const createResponse = await axios.post(
      `${BASE_URL}/strategies`,
      {
        name: "MACD Divergence",
        description: "A momentum strategy using MACD divergence patterns",
        rules: `1. Identify bullish divergence (price making lower lows, MACD making higher lows)
2. Wait for MACD histogram to turn positive
3. Enter long position when price breaks above recent high
4. Set stop loss below recent low
5. Take profit at 2:1 risk-reward ratio`,
        metadata: {
          timeframes: ["15m", "1h", "4h"],
          indicators: ["MACD", "Price Action"],
          riskLevel: "medium",
          type: "momentum",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("Created Strategy:", JSON.stringify(createResponse.data, null, 2), "\n");

    // Test 2: Search for strategies
    console.log("Test 2: Searching for momentum strategies...");
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        query: "momentum trading strategy with MACD",
        limit: 5,
      },
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
    });

    console.log("Search Results:", JSON.stringify(searchResponse.data, null, 2), "\n");

    // Test 3: Update a strategy
    console.log("Test 3: Updating strategy...");
    const strategyId = createResponse.data.id;
    const updateResponse = await axios.put(
      `${BASE_URL}/strategies/${strategyId}`,
      {
        description: "An advanced momentum strategy using MACD divergence patterns with volume confirmation",
        rules: `1. Identify bullish divergence (price making lower lows, MACD making higher lows)
2. Confirm with increasing volume on potential reversal
3. Wait for MACD histogram to turn positive
4. Enter long position when price breaks above recent high with volume surge
5. Set stop loss below recent low
6. Take profit at 2:1 risk-reward ratio`,
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("Updated Strategy:", JSON.stringify(updateResponse.data, null, 2), "\n");

    // Test 4: Delete a strategy
    console.log("Test 4: Deleting strategy...");
    await axios.delete(`${BASE_URL}/strategies/${strategyId}`, {
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
      },
    });

    console.log("Strategy deleted successfully\n");

    console.log("✅ All knowledge base tests completed successfully!");
  } catch (error) {
    console.error("❌ Error during knowledge base testing:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testKnowledgeBase();
