import { redis } from "../lib/redis";

async function testRedisConnection() {
  try {
    // Test basic set/get operations
    const testPair = "EURUSD";
    const testTimeframe = "1h";
    const testCandles = [
      { time: "2024-02-28", open: 1.085, high: 1.0855, low: 1.0845, close: 1.0852, volume: 1000 },
      { time: "2024-02-28", open: 1.0852, high: 1.0858, low: 1.0848, close: 1.0855, volume: 1200 },
    ];

    // Set candle data
    await redis.setCandleData(testPair, testTimeframe, testCandles);
    console.log("Successfully set test candle data");

    // Get candle data
    const retrievedCandles = await redis.getCandleData(testPair, testTimeframe);
    console.log("Retrieved candles:", retrievedCandles);

    // Verify data
    if (JSON.stringify(retrievedCandles) === JSON.stringify(testCandles)) {
      console.log("✅ Redis test passed: Data integrity verified");
    } else {
      console.log("❌ Redis test failed: Data mismatch");
    }

    // Clean up
    await redis.disconnect();
    console.log("Redis connection closed");
  } catch (error) {
    console.error("Redis test failed:", error);
    process.exit(1);
  }
}

// Run the test
testRedisConnection();
