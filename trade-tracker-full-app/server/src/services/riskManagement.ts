import OrderExecutionService from "./orderExecution";
import { Position } from "./capital";

export enum StopLossType {
  FIXED_PIPS = "FIXED_PIPS",
  TECHNICAL = "TECHNICAL",
  ATR_BASED = "ATR_BASED",
}

export interface StopLossConfig {
  type: StopLossType;
  value?: number; // For FIXED_PIPS: number of pips, For ATR_BASED: multiplier
}

export interface TakeProfitConfig {
  type: "FIXED_PIPS" | "RR_RATIO"; // Risk-Reward ratio or fixed pips
  value: number; // For FIXED_PIPS: number of pips, For RR_RATIO: multiplier of risk
}

interface RiskParameters {
  accountBalance: number;
  riskPercentage: number;
  stopLoss: StopLossConfig;
  takeProfit?: TakeProfitConfig;
  maxPositions: number;
  maxDailyLoss: number;
  pipValue?: number;
}

interface PositionSizeCalculation {
  size: number;
  maxSize: number;
  riskAmount: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
}

interface RiskMetrics {
  totalExposure: number;
  dailyPnL: number;
  openPositionsCount: number;
  valueAtRisk: number;
  maxDrawdown: number;
}

class RiskManagementService {
  private static instance: RiskManagementService;
  private orderExecutionService: OrderExecutionService;

  private constructor() {
    this.orderExecutionService = OrderExecutionService.getInstance();
  }

  public static getInstance(): RiskManagementService {
    if (!RiskManagementService.instance) {
      RiskManagementService.instance = new RiskManagementService();
    }
    return RiskManagementService.instance;
  }

  /**
   * Calculate position size based on risk parameters
   */
  public async calculatePositionSize(userId: string, pair: string, entryPrice: number, params: RiskParameters): Promise<PositionSizeCalculation> {
    const accountInfo = await this.orderExecutionService.getAccountInfo(userId);
    const balance = accountInfo.balance;
    const riskAmount = (balance * params.riskPercentage) / 100;
    const pipValue = params.pipValue || this.calculatePipValue(pair, entryPrice);

    // Calculate stop loss pips based on configuration
    const stopLossPips = await this.calculateStopLossPips(pair, entryPrice, params.stopLoss);

    // Calculate position size based on risk and stop loss
    const size = riskAmount / (stopLossPips * pipValue);
    const maxSize = (balance * 0.02) / entryPrice;

    // Calculate actual stop loss price
    const stopLossPrice = entryPrice - stopLossPips * pipValue;

    // Calculate take profit based on configuration
    const takeProfitPrice = params.takeProfit ? await this.calculateTakeProfit(entryPrice, stopLossPrice, params.takeProfit, pipValue) : undefined;

    return {
      size: Math.min(size, maxSize),
      maxSize,
      riskAmount,
      stopLossPrice,
      takeProfitPrice,
    };
  }

  /**
   * Calculate stop loss pips based on configuration
   */
  private async calculateStopLossPips(pair: string, entryPrice: number, stopLossConfig: StopLossConfig): Promise<number> {
    switch (stopLossConfig.type) {
      case StopLossType.FIXED_PIPS:
        return stopLossConfig.value || 10; // Default to 10 pips if no value provided

      case StopLossType.TECHNICAL:
        // TODO: Implement technical analysis based stop loss
        // This would use AI/ML to determine optimal stop loss
        return this.calculateTechnicalStopLoss(pair, entryPrice);

      case StopLossType.ATR_BASED:
        return await this.calculateAtrBasedStopLoss(pair, stopLossConfig.value || 2);

      default:
        return 10; // Default fallback
    }
  }

  /**
   * Calculate take profit price based on configuration
   */
  private async calculateTakeProfit(entryPrice: number, stopLossPrice: number, takeProfitConfig: TakeProfitConfig, pipValue: number): Promise<number> {
    if (takeProfitConfig.type === "RR_RATIO") {
      // Calculate based on risk-reward ratio
      const riskInPrice = Math.abs(entryPrice - stopLossPrice);
      return entryPrice + riskInPrice * takeProfitConfig.value;
    } else {
      // Fixed pips
      return entryPrice + takeProfitConfig.value * pipValue;
    }
  }

  /**
   * Calculate stop loss based on technical analysis
   */
  private calculateTechnicalStopLoss(pair: string, entryPrice: number): number {
    // TODO: Implement AI-based technical analysis for stop loss
    // This would analyze:
    // 1. Support/Resistance levels
    // 2. Recent swing lows/highs
    // 3. Volatility patterns
    return 15; // Temporary default
  }

  /**
   * Calculate ATR-based stop loss
   */
  private async calculateAtrBasedStopLoss(pair: string, multiplier: number): Promise<number> {
    // TODO: Implement ATR calculation
    // This would:
    // 1. Fetch recent price data
    // 2. Calculate ATR
    // 3. Return ATR * multiplier
    return 20; // Temporary default
  }

  /**
   * Calculate risk metrics for a user's portfolio
   */
  public async calculateRiskMetrics(userId: string): Promise<RiskMetrics> {
    const positions = await this.orderExecutionService.getOpenPositions(userId);
    const accountInfo = await this.orderExecutionService.getAccountInfo(userId);

    const totalExposure = positions.reduce((sum: number, pos: Position) => sum + Math.abs(pos.size), 0);
    const dailyPnL = positions.reduce((sum: number, pos: Position) => sum + pos.profit, 0);

    return {
      totalExposure,
      dailyPnL,
      openPositionsCount: positions.length,
      valueAtRisk: this.calculateValueAtRisk(positions, accountInfo.balance),
      maxDrawdown: this.calculateMaxDrawdown(positions),
    };
  }

  /**
   * Validate if a trade meets risk management criteria
   */
  public async validateTrade(userId: string, pair: string, size: number, params: RiskParameters): Promise<{ isValid: boolean; reason?: string }> {
    const metrics = await this.calculateRiskMetrics(userId);
    const accountInfo = await this.orderExecutionService.getAccountInfo(userId);

    // Check maximum positions limit
    if (metrics.openPositionsCount >= params.maxPositions) {
      return { isValid: false, reason: "Maximum number of positions reached" };
    }

    // Check daily loss limit
    if (metrics.dailyPnL <= -params.maxDailyLoss) {
      return { isValid: false, reason: "Daily loss limit reached" };
    }

    // Check position size against account balance
    const positionValue = size * accountInfo.balance;
    if (positionValue > accountInfo.available * 0.2) {
      // Max 20% of available balance per position
      return { isValid: false, reason: "Position size too large for account balance" };
    }

    // Check total exposure
    if (metrics.totalExposure + size > accountInfo.balance * 0.5) {
      // Max 50% total exposure
      return { isValid: false, reason: "Total exposure would exceed maximum limit" };
    }

    return { isValid: true };
  }

  /**
   * Calculate Value at Risk (VaR) using historical method
   */
  private calculateValueAtRisk(positions: Position[], balance: number): number {
    // Simplified VaR calculation (95% confidence level)
    const totalExposure = positions.reduce((sum, pos) => sum + Math.abs(pos.size), 0);
    return totalExposure * 0.0165; // 1.65 standard deviations for 95% confidence
  }

  /**
   * Calculate Maximum Drawdown from position history
   */
  private calculateMaxDrawdown(positions: Position[]): number {
    const profits = positions.map((p) => p.profit);
    let peak = 0;
    let maxDrawdown = 0;

    for (const profit of profits) {
      if (profit > peak) {
        peak = profit;
      }
      const drawdown = peak - profit;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate pip value for a given pair and price
   */
  private calculatePipValue(pair: string, price: number): number {
    // Simplified pip value calculation
    // In reality, this would need to account for:
    // 1. Currency pair specifics
    // 2. Account currency
    // 3. Current exchange rates
    return 0.0001 * price;
  }
}

export default RiskManagementService;
