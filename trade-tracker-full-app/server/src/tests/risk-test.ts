import axios from "axios";

const API_URL = "http://localhost:3001/api"; // Adjust port if different
const TEST_TOKEN = "test-token"; // This should match your auth middleware's test token

async function testRiskManagement() {
  const headers = {
    Authorization: `Bearer ${TEST_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    console.log("🧪 Testing Risk Management API...\n");

    // Test 1: Calculate Position Size with Fixed Pips Stop Loss
    console.log("Test 1: Calculate Position Size (Fixed Pips)");
    const positionSizeResponse = await axios.post(
      `${API_URL}/risk/position-size`,
      {
        pair: "EURUSD",
        entryPrice: 1.085,
        riskPercentage: 1, // 1% risk
        stopLoss: {
          type: "FIXED_PIPS",
          value: 10, // 10 pips stop loss
        },
        takeProfit: {
          type: "RR_RATIO",
          value: 2, // 1:2 risk/reward ratio
        },
        maxPositions: 5,
        maxDailyLoss: 500,
      },
      { headers }
    );

    console.log("Position Size Calculation:", positionSizeResponse.data);
    console.log("✅ Position Size Test Complete\n");

    // Test 2: Calculate Position Size with Technical Stop Loss
    console.log("Test 2: Calculate Position Size (Technical Stop Loss)");
    const technicalStopResponse = await axios.post(
      `${API_URL}/risk/position-size`,
      {
        pair: "EURUSD",
        entryPrice: 1.085,
        riskPercentage: 1,
        stopLoss: {
          type: "TECHNICAL",
        },
        maxPositions: 5,
        maxDailyLoss: 500,
      },
      { headers }
    );

    console.log("Technical Stop Loss Calculation:", technicalStopResponse.data);
    console.log("✅ Technical Stop Loss Test Complete\n");

    // Test 3: Validate Trade
    console.log("Test 3: Validate Trade");
    const validateTradeResponse = await axios.post(
      `${API_URL}/risk/validate-trade`,
      {
        pair: "EURUSD",
        size: 0.1, // 0.1 lot
        riskPercentage: 1,
        stopLoss: {
          type: "FIXED_PIPS",
          value: 10,
        },
        maxPositions: 5,
        maxDailyLoss: 500,
      },
      { headers }
    );

    console.log("Trade Validation:", validateTradeResponse.data);
    console.log("✅ Trade Validation Test Complete\n");

    // Test 4: Get Risk Metrics
    console.log("Test 4: Get Risk Metrics");
    const metricsResponse = await axios.get(`${API_URL}/risk/metrics`, { headers });

    console.log("Risk Metrics:", metricsResponse.data);
    console.log("✅ Risk Metrics Test Complete\n");
  } catch (error: any) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
  }
}

// Run the tests
console.log("Starting Risk Management Tests...\n");
testRiskManagement().then(() => {
  console.log("All tests completed!");
});
