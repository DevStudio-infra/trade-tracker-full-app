import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const embeddingModel = "embedding-001";

const tradingPatterns = [
  {
    content: `Bullish Engulfing Pattern:
    A powerful reversal pattern that forms after a downtrend, signaling a potential trend change to bullish.

    Key characteristics:
    1. Formation requirements:
       - Previous trend must be downward
       - First candle is bearish (red/black)
       - Second candle is bullish (green/white)
       - Second candle completely engulfs previous candle
       - Second candle opens below first candle's close
       - Second candle closes above first candle's open

    2. Volume considerations:
       - Volume should increase significantly on engulfing candle
       - Higher volume adds more credibility to reversal

    Entry Rules:
    - Primary entry: Above high of engulfing candle
    - Conservative entry: Wait for following candle confirmation
    - Volume must be above 20-period average
    - Confirm with support levels or other technical indicators

    Exit Rules:
    - Profit targets:
      1. Previous swing high
      2. 1.5-2x risk distance
      3. Trailing stop after 1R profit
    - Stop loss: Below low of engulfing candle

    Risk Management:
    - Maximum risk: 1% of account per trade
    - Risk/Reward minimum: 1:2
    - Reduce position size if volatility is high
    - Consider market context and overall trend`,
    category: "PATTERN",
    tags: ["bullish", "reversal", "engulfing", "candlestick"],
    metadata: {
      success_rate: 68,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "Critical",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "RSI divergence",
        "Support levels",
        "Moving averages",
        "Volume increase",
      ],
      failure_points: [
        "Lack of volume confirmation",
        "Against major trend",
        "At major resistance",
        "No prior downtrend",
      ],
      target_calculation:
        "Measure from entry to stop loss, project 2x for target",
      stop_loss_rules: [
        "Place below engulfing pattern low",
        "Include recent swing low if close",
        "Account for average volatility",
      ],
    },
  },
  {
    content: `Morning Star Pattern:
    A three-candlestick bullish reversal pattern that signals the end of a downtrend and the beginning of an upward price movement.

    Key characteristics:
    1. Formation requirements:
       - First candle: Large bearish candle
       - Second candle: Small body (doji or spinning top)
       - Third candle: Large bullish candle
       - Second candle gaps down (traditional) or opens within first candle
       - Third candle closes deep into first candle's body

    2. Volume profile:
       - First candle: High volume showing capitulation
       - Second candle: Usually lower volume
       - Third candle: Strong volume confirming reversal

    Entry Rules:
    - Primary entry: Above high of third candle
    - Aggressive entry: During third candle formation
    - Volume must confirm on third candle
    - Price should close above midpoint of first candle

    Exit Rules:
    - Profit targets:
      1. Previous resistance level
      2. 2-3x risk distance
      3. Fibonacci extension levels
    - Stop loss: Below low of pattern

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2.5
    - Scale in on confirmation
    - Use time stop if no follow-through within 3 bars`,
    category: "PATTERN",
    tags: ["bullish", "reversal", "morning-star", "three-candle"],
    metadata: {
      success_rate: 73,
      timeframes: ["Daily", "Weekly", "4H"],
      volume_importance: "High",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Volume surge on third candle",
        "Support zone confluence",
        "Momentum indicators",
        "Market structure",
      ],
      failure_points: [
        "Low volume on third candle",
        "No prior downtrend",
        "Too much gap between candles",
        "Third candle weak close",
      ],
      target_calculation: "Measure pattern height, project 2-3x from entry",
      stop_loss_rules: [
        "Below pattern low",
        "Below second candle if tight pattern",
        "Include volatility buffer",
      ],
    },
  },
  {
    content: `Hammer & Inverted Hammer Patterns:
    Single-candlestick bullish reversal patterns that appear in downtrends, signaling potential buying pressure and trend reversal.

    Key characteristics:
    Hammer Pattern:
    1. Formation requirements:
       - Long lower shadow (2-3x body length)
       - Small real body at the top
       - Little to no upper shadow
       - Color of body less important

    Inverted Hammer:
    1. Formation requirements:
       - Long upper shadow (2-3x body length)
       - Small real body at the bottom
       - Little to no lower shadow
       - Color of body less important

    Volume considerations:
    - Volume should be above average
    - Higher volume increases reliability
    - Follow-through day should show strong volume

    Entry Rules:
    - Conservative: Wait for next candle confirmation
    - Aggressive: Enter on pattern close
    - Volume must be 1.5x average
    - Confirm with support levels

    Exit Rules:
    - Profit targets:
      1. Next resistance level
      2. 2x risk distance
      3. Previous swing high
    - Stop loss: Below hammer's low

    Risk Management:
    - Risk maximum 1% of account
    - Higher risk/reward for confirmed patterns
    - Reduce size if volatility is high
    - Use wider stops in volatile markets`,
    category: "PATTERN",
    tags: ["bullish", "reversal", "hammer", "single-candle"],
    metadata: {
      success_rate: 67,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Next day confirmation",
        "Support level",
        "Volume spike",
        "Momentum divergence",
      ],
      failure_points: [
        "Low volume",
        "No prior downtrend",
        "At major resistance",
        "Shadow too short",
      ],
      target_calculation: "Measure from entry to stop, project 2x minimum",
      stop_loss_rules: [
        "Below hammer low",
        "Include volatility buffer",
        "Consider recent swing low",
      ],
    },
  },
  {
    content: `Piercing Line Pattern:
    A two-candlestick bullish reversal pattern that forms in a downtrend, showing strong buying pressure.

    Key characteristics:
    1. Formation requirements:
       - First candle: Strong bearish candle
       - Second candle: Strong bullish candle
       - Second candle opens below first candle's low
       - Second candle closes above midpoint of first candle
       - Gap down between candles (traditional)

    2. Volume considerations:
       - Volume should increase on second candle
       - First candle volume should be significant
       - Higher volume on second candle increases reliability

    Entry Rules:
    - Primary entry: Above high of second candle
    - Conservative entry: Wait for third candle confirmation
    - Volume should be above 10-period average
    - Price action should show rejection of lower levels

    Exit Rules:
    - Profit targets:
      1. Previous resistance level
      2. 2x risk distance
      3. First resistance zone
    - Stop loss: Below second candle's low

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Consider market volatility for position sizing
    - Use time-based exits if no follow-through`,
    category: "PATTERN",
    tags: ["bullish", "reversal", "piercing-line", "two-candle"],
    metadata: {
      success_rate: 65,
      timeframes: ["Daily", "4H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Support level confluence",
        "Volume increase",
        "RSI oversold",
        "Candlestick size",
      ],
      failure_points: [
        "Weak second candle",
        "Low volume",
        "Major resistance above",
        "No prior downtrend",
      ],
      target_calculation: "Measure pattern height, project 1.5-2x from entry",
      stop_loss_rules: [
        "Below second candle low",
        "Include volatility buffer",
        "Consider recent swing low",
      ],
    },
  },
  {
    content: `Three White Soldiers Pattern:
    A powerful bullish reversal pattern consisting of three consecutive bullish candles, each closing higher than the previous.

    Key characteristics:
    1. Formation requirements:
       - Three consecutive bullish candles
       - Each candle opens within previous candle's body
       - Each candle closes near its high
       - Each candle should be of similar size
       - Little to no upper shadows

    2. Volume profile:
       - Volume should increase with each candle
       - Third candle should show highest volume
       - Above-average volume throughout pattern

    Entry Rules:
    - Primary entry: Above high of third candle
    - Aggressive entry: During third candle formation
    - Volume confirmation required
    - Check for overhead resistance

    Exit Rules:
    - Profit targets:
      1. Next major resistance level
      2. 2-3x risk distance
      3. Previous swing high
    - Stop loss: Below lowest candle

    Risk Management:
    - Maximum risk: 1% of account
    - Risk/Reward minimum: 1:2.5
    - Scale in on strength
    - Use trailing stops after 1R profit`,
    category: "PATTERN",
    tags: ["bullish", "reversal", "three-white-soldiers", "momentum"],
    metadata: {
      success_rate: 76,
      timeframes: ["Daily", "Weekly"],
      volume_importance: "Critical",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Increasing volume",
        "Prior downtrend",
        "Momentum indicators",
        "Market structure",
      ],
      failure_points: [
        "Long upper shadows",
        "Decreasing volume",
        "At major resistance",
        "Excessive gap between candles",
      ],
      target_calculation: "Measure pattern height, project 2-3x from entry",
      stop_loss_rules: [
        "Below pattern low",
        "Below first soldier if tight pattern",
        "Account for volatility",
      ],
    },
  },
  {
    content: `Bearish Engulfing Pattern:
    A powerful reversal pattern that forms after an uptrend, signaling a potential trend change to bearish.

    Key characteristics:
    1. Formation requirements:
       - Previous trend must be upward
       - First candle is bullish (green/white)
       - Second candle is bearish (red/black)
       - Second candle completely engulfs previous candle
       - Second candle opens above first candle's close
       - Second candle closes below first candle's open

    2. Volume considerations:
       - Volume should spike on engulfing candle
       - Higher volume increases pattern reliability
       - Look for above-average volume

    Entry Rules:
    - Primary entry: Below low of engulfing candle
    - Conservative entry: Wait for following candle confirmation
    - Volume must be above 20-period average
    - Check for support levels below

    Exit Rules:
    - Profit targets:
      1. Previous swing low
      2. 1.5-2x risk distance
      3. Trailing stop after 1R profit
    - Stop loss: Above high of engulfing candle

    Risk Management:
    - Maximum risk: 1% of account per trade
    - Risk/Reward minimum: 1:2
    - Reduce position size in low volatility
    - Consider overall market context`,
    category: "PATTERN",
    tags: ["bearish", "reversal", "engulfing", "candlestick"],
    metadata: {
      success_rate: 70,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "Critical",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Volume spike",
        "Resistance level",
        "Momentum divergence",
        "Market structure",
      ],
      failure_points: [
        "Low volume",
        "Against major trend",
        "At major support",
        "No prior uptrend",
      ],
      target_calculation:
        "Measure from entry to stop loss, project 2x for target",
      stop_loss_rules: [
        "Above engulfing pattern high",
        "Include recent swing high",
        "Add volatility buffer",
      ],
    },
  },
  {
    content: `Evening Star Pattern:
    A three-candlestick bearish reversal pattern that signals the end of an uptrend and the beginning of a downward price movement.

    Key characteristics:
    1. Formation requirements:
       - First candle: Large bullish candle
       - Second candle: Small body (doji or spinning top)
       - Third candle: Large bearish candle
       - Second candle gaps up (traditional) or opens within first candle
       - Third candle closes deep into first candle's body

    2. Volume profile:
       - First candle: Strong buying volume
       - Second candle: Usually lower volume
       - Third candle: High volume showing selling pressure

    Entry Rules:
    - Primary entry: Below low of third candle
    - Aggressive entry: During third candle formation
    - Volume must confirm on third candle
    - Price should close below midpoint of first candle

    Exit Rules:
    - Profit targets:
      1. Previous support level
      2. 2-3x risk distance
      3. Fibonacci extension levels
    - Stop loss: Above pattern high

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2.5
    - Scale in on confirmation
    - Use time stop if no follow-through`,
    category: "PATTERN",
    tags: ["bearish", "reversal", "evening-star", "three-candle"],
    metadata: {
      success_rate: 72,
      timeframes: ["Daily", "Weekly", "4H"],
      volume_importance: "High",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Volume surge on third candle",
        "Resistance zone confluence",
        "Overbought conditions",
        "Momentum divergence",
      ],
      failure_points: [
        "Low volume on third candle",
        "No prior uptrend",
        "Too much gap between candles",
        "Third candle weak close",
      ],
      target_calculation: "Measure pattern height, project 2-3x from entry",
      stop_loss_rules: [
        "Above pattern high",
        "Above second candle if tight pattern",
        "Include volatility buffer",
      ],
    },
  },
  {
    content: `Shooting Star & Hanging Man Patterns:
    Single-candlestick bearish reversal patterns that appear in uptrends, signaling potential selling pressure and trend reversal.

    Key characteristics:
    Shooting Star:
    1. Formation requirements:
       - Long upper shadow (2-3x body length)
       - Small real body at the bottom
       - Little to no lower shadow
       - Color of body less important
       - Must appear in uptrend

    Hanging Man:
    1. Formation requirements:
       - Long lower shadow (2-3x body length)
       - Small real body at the top
       - Little to no upper shadow
       - Color of body less important
       - Must appear in uptrend

    Volume considerations:
    - Volume should be above average
    - Higher volume increases reliability
    - Follow-through day should show strong volume

    Entry Rules:
    - Conservative: Wait for next candle confirmation
    - Aggressive: Enter on pattern close
    - Volume must be 1.5x average
    - Confirm with resistance levels

    Exit Rules:
    - Profit targets:
      1. Next support level
      2. 2x risk distance
      3. Previous swing low
    - Stop loss: Above pattern high

    Risk Management:
    - Risk maximum 1% of account
    - Higher risk/reward for confirmed patterns
    - Reduce size if volatility is high
    - Use wider stops in volatile markets`,
    category: "PATTERN",
    tags: [
      "bearish",
      "reversal",
      "shooting-star",
      "hanging-man",
      "single-candle",
    ],
    metadata: {
      success_rate: 65,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Next day confirmation",
        "Resistance level",
        "Volume spike",
        "Momentum divergence",
      ],
      failure_points: [
        "Low volume",
        "No prior uptrend",
        "At major support",
        "Shadow too short",
      ],
      target_calculation: "Measure from entry to stop, project 2x minimum",
      stop_loss_rules: [
        "Above pattern high",
        "Include volatility buffer",
        "Consider recent swing high",
      ],
    },
  },
  {
    content: `Dark Cloud Cover Pattern:
    A two-candlestick bearish reversal pattern that forms in an uptrend, showing strong selling pressure.

    Key characteristics:
    1. Formation requirements:
       - First candle: Strong bullish candle
       - Second candle: Strong bearish candle
       - Second candle opens above first candle's high
       - Second candle closes below midpoint of first candle
       - Gap up between candles (traditional)

    2. Volume considerations:
       - Volume should increase on second candle
       - First candle volume should be significant
       - Higher volume on second candle increases reliability

    Entry Rules:
    - Primary entry: Below low of second candle
    - Conservative entry: Wait for third candle confirmation
    - Volume should be above 10-period average
    - Price action should show rejection of higher levels

    Exit Rules:
    - Profit targets:
      1. Previous support level
      2. 2x risk distance
      3. First support zone
    - Stop loss: Above second candle's high

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Consider market volatility for position sizing
    - Use time-based exits if no follow-through`,
    category: "PATTERN",
    tags: ["bearish", "reversal", "dark-cloud-cover", "two-candle"],
    metadata: {
      success_rate: 67,
      timeframes: ["Daily", "4H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Resistance level confluence",
        "Volume increase",
        "RSI overbought",
        "Candlestick size",
      ],
      failure_points: [
        "Weak second candle",
        "Low volume",
        "Major support below",
        "No prior uptrend",
      ],
      target_calculation: "Measure pattern height, project 1.5-2x from entry",
      stop_loss_rules: [
        "Above second candle high",
        "Include volatility buffer",
        "Consider recent swing high",
      ],
    },
  },
  {
    content: `Three Black Crows Pattern:
    A powerful bearish reversal pattern consisting of three consecutive bearish candles, each closing lower than the previous.

    Key characteristics:
    1. Formation requirements:
       - Three consecutive bearish candles
       - Each candle opens within previous candle's body
       - Each candle closes near its low
       - Each candle should be of similar size
       - Little to no lower shadows

    2. Volume profile:
       - Volume should increase with each candle
       - Third candle should show highest volume
       - Above-average volume throughout pattern

    Entry Rules:
    - Primary entry: Below low of third candle
    - Aggressive entry: During third candle formation
    - Volume confirmation required
    - Check for support levels below

    Exit Rules:
    - Profit targets:
      1. Next major support level
      2. 2-3x risk distance
      3. Previous swing low
    - Stop loss: Above highest candle

    Risk Management:
    - Maximum risk: 1% of account
    - Risk/Reward minimum: 1:2.5
    - Scale in on weakness
    - Use trailing stops after 1R profit`,
    category: "PATTERN",
    tags: ["bearish", "reversal", "three-black-crows", "momentum"],
    metadata: {
      success_rate: 74,
      timeframes: ["Daily", "Weekly"],
      volume_importance: "Critical",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Increasing volume",
        "Prior uptrend",
        "Momentum indicators",
        "Market structure",
      ],
      failure_points: [
        "Long lower shadows",
        "Decreasing volume",
        "At major support",
        "Excessive gap between candles",
      ],
      target_calculation: "Measure pattern height, project 2-3x from entry",
      stop_loss_rules: [
        "Above pattern high",
        "Above first crow if tight pattern",
        "Account for volatility",
      ],
    },
  },
  {
    content: `Bull Flag Pattern:
    A bullish continuation pattern that forms during an uptrend, representing a brief consolidation before continuation.

    Key characteristics:
    1. Formation requirements:
       - Strong upward move (flagpole)
       - Parallel or slightly converging channel
       - Channel sloping downward
       - 3-5 price swings in channel
       - Duration typically 1-4 weeks

    2. Volume profile:
       - High volume on flagpole
       - Decreasing volume in channel
       - Volume surge on breakout

    Entry Rules:
    - Primary entry: Break above upper channel line
    - Aggressive entry: Near channel support
    - Volume must increase on breakout
    - Momentum indicators should remain bullish

    Exit Rules:
    - Profit targets:
      1. Measured move (flagpole height)
      2. Previous resistance levels
      3. Fibonacci extensions
    - Stop loss: Below channel support

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops in mature trends
    - Scale-in on confirmation`,
    category: "PATTERN",
    tags: ["bullish", "continuation", "flag", "channel"],
    metadata: {
      success_rate: 69,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Volume increase on breakout",
        "Momentum indicators",
        "Channel break",
        "Prior trend strength",
      ],
      failure_points: [
        "Channel too steep",
        "Low volume breakout",
        "Extended flagpole",
        "Too many swings in flag",
      ],
      target_calculation: "Project flagpole height from breakout point",
      stop_loss_rules: [
        "Below flag low",
        "Below last swing low",
        "Account for volatility",
      ],
    },
  },
  {
    content: `Bear Flag Pattern:
    A bearish continuation pattern that forms during a downtrend, representing a brief consolidation before continuation.

    Key characteristics:
    1. Formation requirements:
       - Strong downward move (flagpole)
       - Parallel or slightly converging channel
       - Channel sloping upward
       - 3-5 price swings in channel
       - Duration typically 1-4 weeks

    2. Volume profile:
       - High volume on flagpole
       - Decreasing volume in channel
       - Volume surge on breakdown

    Entry Rules:
    - Primary entry: Break below lower channel line
    - Aggressive entry: Near channel resistance
    - Volume must increase on breakdown
    - Momentum indicators should remain bearish

    Exit Rules:
    - Profit targets:
      1. Measured move (flagpole height)
      2. Previous support levels
      3. Fibonacci extensions
    - Stop loss: Above channel resistance

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops in mature trends
    - Scale-in on confirmation`,
    category: "PATTERN",
    tags: ["bearish", "continuation", "flag", "channel"],
    metadata: {
      success_rate: 67,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.5,
      confirmation_indicators: [
        "Volume increase on breakdown",
        "Momentum indicators",
        "Channel break",
        "Prior trend strength",
      ],
      failure_points: [
        "Channel too steep",
        "Low volume breakdown",
        "Extended flagpole",
        "Too many swings in flag",
      ],
      target_calculation: "Project flagpole height from breakdown point",
      stop_loss_rules: [
        "Above flag high",
        "Above last swing high",
        "Account for volatility",
      ],
    },
  },
  {
    content: `Symmetrical Triangle Pattern:
    A continuation pattern characterized by converging trendlines showing equal slopes, indicating a period of consolidation before trend continuation.

    Key characteristics:
    1. Formation requirements:
       - At least two lower highs and two higher lows
       - Trendlines converge at approximately equal angles
       - Price action forms a triangle shape
       - Volume typically decreases as pattern forms
       - Breakout occurs 50-75% into triangle formation

    2. Volume profile:
       - Decreasing volume during formation
       - Sharp volume increase on breakout
       - Volume confirms breakout direction
       - Higher volume on upward breakouts

    Entry Rules:
    - Primary entry: Break of trendline with volume
    - Conservative entry: Wait for retest of broken trendline
    - Volume must be 1.5x average on breakout
    - Enter in direction of prior trend

    Exit Rules:
    - Profit targets:
      1. Measured move (widest part of triangle)
      2. Previous support/resistance levels
      3. Fibonacci extensions from breakout
    - Stop loss: Opposite side of triangle

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops near apex
    - Scale-in on confirmation

    Pattern Validity:
    - Minimum 4 touches of trendlines
    - Duration: 3 weeks to 3 months
    - Clear prior trend
    - Apex forms within 3-6 weeks`,
    category: "PATTERN",
    tags: ["continuation", "symmetrical-triangle", "consolidation"],
    metadata: {
      success_rate: 72,
      timeframes: ["Daily", "Weekly", "4H"],
      volume_importance: "Critical",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Volume surge on breakout",
        "Prior trend strength",
        "Momentum indicators",
        "Time in pattern",
      ],
      failure_points: [
        "Early apex breakout",
        "Low volume breakout",
        "Too many trendline touches",
        "Pattern too symmetrical",
      ],
      target_calculation: "Height of widest part projected from breakout",
      stop_loss_rules: [
        "Behind opposite trendline",
        "Account for volatility",
        "Consider recent swing points",
      ],
      pattern_statistics: {
        min_duration: "15 trading days",
        max_duration: "60 trading days",
        optimal_breakout: "50-75% to apex",
        min_trendline_touches: 4,
      },
    },
  },
  {
    content: `Ascending Triangle Pattern:
    A bullish continuation pattern characterized by a horizontal resistance line and an ascending support line, indicating accumulation before an upward breakout.

    Key characteristics:
    1. Formation requirements:
       - Horizontal upper resistance line
       - Rising lower support line
       - At least two touches of each line
       - Price action becomes increasingly compressed
       - Usually forms in an uptrend

    2. Volume profile:
       - Generally decreasing during formation
       - Tends to be higher on upward moves
       - Sharp increase on breakout
       - Should confirm breakout direction

    Entry Rules:
    - Primary entry: Break above resistance line
    - Aggressive entry: Near rising support line
    - Volume should be 1.5x average on breakout
    - Momentum indicators should remain bullish

    Exit Rules:
    - Profit targets:
      1. Measured move (height of pattern)
      2. Fibonacci extensions
      3. Previous resistance levels
    - Stop loss: Below last swing low or support line

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops near resistance
    - Scale-in on confirmation

    Pattern Validity:
    - Minimum 2-3 weeks formation
    - Clear horizontal resistance
    - Rising support line 30-45 degrees
    - Volume decreasing by at least 40%
    - Prior uptrend of at least 10 bars`,
    category: "PATTERN",
    tags: ["bullish", "continuation", "ascending-triangle", "accumulation"],
    metadata: {
      success_rate: 75,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Volume surge on breakout",
        "Momentum divergence",
        "Support line angle",
        "Time in pattern",
      ],
      failure_points: [
        "Support line too steep",
        "Low volume breakout",
        "Resistance line not horizontal",
        "Formation too short",
      ],
      target_calculation: "Project pattern height from breakout point",
      stop_loss_rules: [
        "Below last swing low",
        "Below support line",
        "Include volatility buffer",
      ],
      pattern_statistics: {
        min_duration: "10 trading days",
        optimal_duration: "15-25 trading days",
        support_angle: "30-45 degrees",
        min_touches: 4,
      },
    },
  },
  {
    content: `Descending Triangle Pattern:
    A bearish continuation pattern characterized by a horizontal support line and a descending resistance line, indicating distribution before a downward breakout.

    Key characteristics:
    1. Formation requirements:
       - Horizontal lower support line
       - Falling upper resistance line
       - At least two touches of each line
       - Price action becomes increasingly compressed
       - Usually forms in a downtrend

    2. Volume profile:
       - Generally decreasing during formation
       - Tends to be higher on downward moves
       - Sharp increase on breakdown
       - Should confirm breakdown direction

    Entry Rules:
    - Primary entry: Break below support line
    - Aggressive entry: Near falling resistance line
    - Volume should be 1.5x average on breakdown
    - Momentum indicators should remain bearish

    Exit Rules:
    - Profit targets:
      1. Measured move (height of pattern)
      2. Fibonacci extensions
      3. Previous support levels
    - Stop loss: Above last swing high or resistance line

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops near support
    - Scale-in on confirmation

    Pattern Validity:
    - Minimum 2-3 weeks formation
    - Clear horizontal support
    - Falling resistance line 30-45 degrees
    - Volume decreasing by at least 40%
    - Prior downtrend of at least 10 bars`,
    category: "PATTERN",
    tags: ["bearish", "continuation", "descending-triangle", "distribution"],
    metadata: {
      success_rate: 73,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Volume surge on breakdown",
        "Momentum divergence",
        "Resistance line angle",
        "Time in pattern",
      ],
      failure_points: [
        "Resistance line too steep",
        "Low volume breakdown",
        "Support line not horizontal",
        "Formation too short",
      ],
      target_calculation: "Project pattern height from breakdown point",
      stop_loss_rules: [
        "Above last swing high",
        "Above resistance line",
        "Include volatility buffer",
      ],
      pattern_statistics: {
        min_duration: "10 trading days",
        optimal_duration: "15-25 trading days",
        resistance_angle: "30-45 degrees",
        min_touches: 4,
      },
    },
  },
  {
    content: `Rectangle Pattern:
    A continuation pattern characterized by horizontal support and resistance lines, indicating a temporary pause in the trend with price moving sideways.

    Key characteristics:
    1. Formation requirements:
       - Horizontal support and resistance lines
       - At least two touches of each line
       - Price bounces between parallel lines
       - Equal distance between support/resistance
       - Usually forms in existing trend

    2. Volume profile:
       - Decreasing during formation
       - Higher at support and resistance tests
       - Sharp increase on breakout
       - Volume confirms breakout direction

    Entry Rules:
    - Primary entry: Break of support/resistance
    - Aggressive entry: Counter-trend at support/resistance
    - Volume must be 1.5x average on breakout
    - Enter in direction of prior trend

    Exit Rules:
    - Profit targets:
      1. Measured move (height of pattern)
      2. Fibonacci extensions
      3. Previous support/resistance levels
    - Stop loss: Behind opposite boundary

    Risk Management:
    - Risk per trade: 0.5-1% of account
    - Minimum risk/reward: 1:2
    - Tighter stops near boundaries
    - Scale-in on confirmation

    Pattern Validity:
    - Minimum 3 weeks formation
    - At least 4 boundary touches
    - Clear price channel
    - Volume decreasing by 30%+
    - Maximum 3 months duration`,
    category: "PATTERN",
    tags: ["continuation", "rectangle", "consolidation", "range"],
    metadata: {
      success_rate: 68,
      timeframes: ["Daily", "4H", "1H"],
      volume_importance: "High",
      risk_ratio: 2.0,
      confirmation_indicators: [
        "Volume surge on breakout",
        "Prior trend strength",
        "Clean boundary touches",
        "Time in pattern",
      ],
      failure_points: [
        "Sloping boundaries",
        "Low volume breakout",
        "Too many touches",
        "Pattern too long",
      ],
      target_calculation: "Project pattern height from breakout point",
      stop_loss_rules: [
        "Behind opposite boundary",
        "Include volatility buffer",
        "Consider recent swing points",
      ],
      pattern_statistics: {
        min_duration: "15 trading days",
        max_duration: "60 trading days",
        min_touches: 4,
        optimal_width_height_ratio: "2:1 to 4:1",
      },
    },
  },
];

async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: embeddingModel });
  const result = await model.embedContent(text);
  const embedding = await result.embedding;
  return embedding.values;
}

async function main() {
  console.log("🌱 Starting trading patterns seeding...");

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

      console.log(`✅ Seeded pattern: ${pattern.tags.join(", ")}`);
    }

    console.log("✅ Successfully seeded trading patterns");
  } catch (error) {
    console.error("❌ Error seeding trading patterns:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
