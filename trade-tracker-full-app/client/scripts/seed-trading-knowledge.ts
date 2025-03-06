import {
  embeddingService,
  KnowledgeCategory,
} from "../lib/embeddings/gemini-embeddings.js";

const tradingPatterns = [
  {
    content: `Double Bottom Pattern:
    A double bottom is a bullish reversal pattern that forms after a downtrend.
    It consists of two lows at approximately the same price level, creating a "W" shape.
    Key characteristics include:
    1. Similar price levels at both bottoms
    2. Volume typically higher on second bottom
    3. Confirmation when price breaks above the middle peak`,
    category: "PATTERN" as KnowledgeCategory,
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
    category: "PSYCHOLOGY" as KnowledgeCategory,
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
    category: "PATTERN" as KnowledgeCategory,
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
    category: "RISK_MANAGEMENT" as KnowledgeCategory,
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
    category: "MARKET_CONDITION" as KnowledgeCategory,
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
    category: "PSYCHOLOGY" as KnowledgeCategory,
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
  {
    content: `Harmonic Patterns - Gartley Pattern:
    The Gartley pattern is an advanced harmonic pattern that follows specific Fibonacci ratios.
    Structure:
    1. XA leg: Initial price move
    2. AB leg: Retracement of 61.8% of XA
    3. BC leg: 38.2-88.6% retracement of AB
    4. CD leg: 127.2-161.8% extension of BC
    Key validation points:
    - All legs must meet Fibonacci ratio requirements
    - Pattern completion at D point should be 78.6% retracement of XA
    - Volume should confirm direction at D point
    Risk management:
    - Stop loss: Beyond point X
    - Take profit: Multiple targets using Fibonacci extensions`,
    category: "PATTERN" as KnowledgeCategory,
    tags: ["harmonic", "gartley", "fibonacci", "advanced-pattern"],
    metadata: {
      success_rate: 65,
      timeframes: ["4H", "Daily", "Weekly"],
      complexity_level: "Advanced",
      risk_ratio: 2.5,
      fibonacci_levels: {
        XA_retracement: 0.786,
        AB_retracement: 0.618,
        BC_retracement: [0.382, 0.886],
        CD_extension: [1.272, 1.618],
      },
    },
  },
  {
    content: `Wyckoff Market Cycle:
    A comprehensive method of market analysis developed by Richard Wyckoff.
    Four phases of the cycle:
    1. Accumulation Phase:
       - Institution quietly buying
       - Price moves sideways in a range
       - Volume increases on up moves
       - Key signs: Spring, Test, Sign of Strength
    2. Markup Phase:
       - Price breaks out of range
       - Higher highs and higher lows
       - Strong volume on advances
       - Pullbacks on lower volume
    3. Distribution Phase:
       - Institution selling to retail
       - Price moves sideways at highs
       - Volume increases on down moves
       - Key signs: UTAD, LPSY, SOW
    4. Markdown Phase:
       - Price breaks down
       - Lower lows and lower highs
       - Strong volume on declines
    Key Principles:
    - Effort vs Result
    - Supply and Demand
    - Cause and Effect`,
    category: "ANALYSIS" as KnowledgeCategory,
    tags: ["wyckoff", "market-cycle", "institutional", "volume-analysis"],
    metadata: {
      complexity_level: "Advanced",
      timeframes: ["Daily", "Weekly"],
      key_indicators: ["Volume", "Price Spread", "Time"],
      success_factors: [
        "Volume confirmation",
        "Price structure adherence",
        "Multiple timeframe alignment",
      ],
    },
  },
  {
    content: `Advanced Risk Management - Portfolio Heat:
    Portfolio heat management is crucial for professional trading.
    Key concepts:
    1. Total Portfolio Heat:
       - Sum of all position risks
       - Should not exceed 6% of total capital
       - Includes unrealized P&L
    2. Correlation Risk:
       - Similar positions increase effective heat
       - Adjust position sizes for correlated pairs
       - Use correlation matrix for analysis
    3. Sector Exposure:
       - Maximum 15% exposure per sector
       - Adjust for sector volatility
       - Consider macro conditions
    4. Dynamic Position Sizing:
       - Base size on portfolio heat
       - Reduce size as heat increases
       - Increase size in strong trends
    Implementation:
    1. Calculate current heat
    2. Check correlations
    3. Assess sector exposure
    4. Determine position size
    5. Monitor and adjust`,
    category: "RISK_MANAGEMENT" as KnowledgeCategory,
    tags: [
      "portfolio-management",
      "risk-control",
      "position-sizing",
      "correlation",
    ],
    metadata: {
      max_portfolio_heat: 6,
      max_sector_exposure: 15,
      position_adjustments: {
        high_heat: "Reduce size by 50%",
        low_heat: "Increase size by 25%",
        correlation_threshold: 0.7,
      },
      monitoring_frequency: "Real-time",
    },
  },
  {
    content: `Market Microstructure Analysis:
    Understanding order flow and market microstructure for advanced trading.
    Key components:
    1. Order Flow Analysis:
       - Bid/Ask spread dynamics
       - Order book depth
       - Large order impact
       - Hidden liquidity
    2. Volume Profile:
       - Value area identification
       - Volume Point of Control (VPOC)
       - Low volume nodes
       - High volume nodes
    3. Delta Analysis:
       - Buying vs selling pressure
       - Delta divergence
       - Cumulative delta
       - Delta patterns
    4. Liquidity Analysis:
       - Institutional order blocks
       - Stop runs
       - Liquidity voids
       - Smart money moves
    Application:
    - Entry timing optimization
    - Stop placement
    - Target selection
    - Risk assessment`,
    category: "ANALYSIS" as KnowledgeCategory,
    tags: ["microstructure", "order-flow", "volume-profile", "liquidity"],
    metadata: {
      tools_required: [
        "DOM ladder",
        "Volume profile",
        "Footprint charts",
        "Heat maps",
      ],
      timeframes: ["1min", "5min", "15min"],
      success_factors: [
        "Quick pattern recognition",
        "Real-time analysis",
        "Multiple data points confirmation",
      ],
    },
  },
  {
    content: `Advanced Market Internals:
    Using market internals for comprehensive market analysis.
    Key indicators:
    1. Advance-Decline Line:
       - Market breadth indicator
       - Divergence analysis
       - Sector comparison
    2. TICK Index:
       - Short-term momentum
       - Extreme readings
       - Opening range analysis
    3. TRIN (Arms Index):
       - Volume-weighted breadth
       - Oversold/Overbought levels
       - Trend confirmation
    4. VIX Analysis:
       - Fear gauge
       - Term structure
       - Put-call ratio correlation
    5. Market Profile:
       - Time-price opportunity
       - Balance areas
       - Initiative vs Responsive action
    Integration:
    - Combine multiple internals
    - Look for confirmations
    - Track divergences
    - Monitor sector rotation`,
    category: "MARKET_CONDITION" as KnowledgeCategory,
    tags: ["market-internals", "breadth", "volatility", "market-profile"],
    metadata: {
      update_frequency: "Real-time",
      key_levels: {
        TICK: {
          extreme_high: 1000,
          extreme_low: -1000,
        },
        TRIN: {
          oversold: 2.0,
          overbought: 0.5,
        },
        VIX: {
          high_fear: 30,
          low_fear: 15,
        },
      },
      correlation_factors: [
        "SPX trend",
        "Sector performance",
        "Volume patterns",
      ],
    },
  },
  {
    content: `Advanced Trading Psychology - Flow State:
    Achieving and maintaining flow state in trading for optimal performance.
    Key aspects:
    1. Mental Preparation:
       - Pre-market routine
       - Mindfulness practices
       - Environment optimization
       - Physical preparation
    2. Flow State Triggers:
       - Clear goals
       - Immediate feedback
       - Challenge-skill balance
       - Deep concentration
    3. Performance Optimization:
       - Peak performance windows
       - Energy management
       - Focus enhancement
       - Decision clarity
    4. Recovery Practices:
       - Post-session review
       - Mental reset techniques
       - Stress management
       - Performance journaling
    Implementation:
    1. Establish morning routine
    2. Set session objectives
    3. Monitor mental state
    4. Regular breaks
    5. End-day review`,
    category: "PSYCHOLOGY" as KnowledgeCategory,
    tags: [
      "flow-state",
      "peak-performance",
      "mental-preparation",
      "trading-psychology",
    ],
    metadata: {
      preparation_time: "30-60 minutes",
      optimal_trading_windows: ["2-3 hours max"],
      break_frequency: "45-60 minutes",
      success_metrics: {
        focus_duration: "90%+ of trading time",
        decision_quality: "80%+ adherence to plan",
        recovery_time: "< 5 minutes after setback",
      },
    },
  },
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
