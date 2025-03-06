import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TEST_TOKEN = "test-token";
const BASE_URL = "http://localhost:5000/api/ai";

async function testAIIntegration() {
  try {
    console.log("Testing AI Integration...\n");

    // Test 1: JSON response with text only
    console.log("Test 1: Testing JSON response with text only...");
    const jsonResponse = await axios.post(
      `${BASE_URL}/json`,
      {
        prompt: "Generate a trading strategy with entry and exit rules. Return as JSON with fields: name, description, entryRules (array), exitRules (array)",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("JSON Response:", JSON.stringify(jsonResponse.data, null, 2), "\n");

    // Test 2: JSON response with image
    console.log("Test 2: Testing JSON response with image...");
    const jsonWithImageResponse = await axios.post(
      `${BASE_URL}/json`,
      {
        prompt: "Analyze this chart pattern and provide trading signals. Return as JSON with fields: pattern, trend, signals (array), riskLevel",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        imageUrl: "https://example.com/chart.jpg", // Replace with actual chart image URL
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("JSON Response with Image:", JSON.stringify(jsonWithImageResponse.data, null, 2), "\n");

    // Test 3: Streaming response with text only
    console.log("Test 3: Testing streaming response...");
    const streamResponse = await axios.post(
      `${BASE_URL}/stream`,
      {
        prompt: "Analyze the current market conditions for BTC/USD and suggest potential trading opportunities.",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
        responseType: "stream",
      }
    );

    streamResponse.data.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.startsWith("data: ")) {
        try {
          const data = JSON.parse(text.slice(6));
          process.stdout.write(data.text);
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    });

    streamResponse.data.on("end", () => {
      console.log("\n\nStreaming test completed.\n");
    });

    // Test 4: Streaming response with image
    console.log("Test 4: Testing streaming response with image...");
    const streamWithImageResponse = await axios.post(
      `${BASE_URL}/stream`,
      {
        prompt: "Analyze this chart and provide real-time market analysis and trading recommendations.",
        model: "gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 1000,
        imageUrl: "https://example.com/chart.jpg", // Replace with actual chart image URL
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
        responseType: "stream",
      }
    );

    streamWithImageResponse.data.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.startsWith("data: ")) {
        try {
          const data = JSON.parse(text.slice(6));
          process.stdout.write(data.text);
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    });

    streamWithImageResponse.data.on("end", () => {
      console.log("\n\nStreaming with image test completed.");
    });
  } catch (error) {
    console.error("Error during AI integration test:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testAIIntegration();
