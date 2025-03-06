import CapitalService, { OrderRequest, OrderConfirmation, Position } from "./capital";

export interface TradeRequest {
  userId: string;
  pair: string;
  direction: "BUY" | "SELL";
  size: number;
  orderType: "MARKET" | "LIMIT";
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  useGuaranteedStop?: boolean;
}

class OrderExecutionService {
  private static instance: OrderExecutionService;
  private userServices: Map<string, CapitalService> = new Map();

  private constructor() {}

  public static getInstance(): OrderExecutionService {
    if (!OrderExecutionService.instance) {
      OrderExecutionService.instance = new OrderExecutionService();
    }
    return OrderExecutionService.instance;
  }

  /**
   * Initializes a user's trading service with their API key
   */
  public initializeUserService(userId: string, apiKey: string, isDemo: boolean = true): void {
    const service = CapitalService.createUserInstance(apiKey, isDemo);
    this.userServices.set(userId, service);
  }

  /**
   * Places a trade for a user
   */
  public async placeTrade(request: TradeRequest): Promise<OrderConfirmation> {
    const service = this.getUserService(request.userId);

    // First verify account has sufficient funds
    const accountInfo = await service.getAccountInfo();
    if (accountInfo.available <= 0) {
      return {
        dealReference: "",
        status: "REJECTED",
        reason: "Insufficient funds",
      };
    }

    // Transform trade request to order request
    const orderRequest: OrderRequest = {
      epic: request.pair,
      direction: request.direction,
      size: request.size,
      orderType: request.orderType,
      limitLevel: request.limitPrice,
      stopLevel: request.stopLoss,
      profitLevel: request.takeProfit,
      guaranteedStop: request.useGuaranteedStop,
    };

    // Place the order
    const confirmation = await service.placeOrder(orderRequest);

    // If order is accepted, verify it was executed
    if (confirmation.status === "ACCEPTED" && confirmation.dealReference) {
      return await this.verifyOrderExecution(request.userId, confirmation.dealReference);
    }

    return confirmation;
  }

  /**
   * Modifies an existing position
   */
  public async modifyPosition(
    userId: string,
    dealId: string,
    modifications: {
      stopLoss?: number;
      takeProfit?: number;
      trailingStop?: boolean;
    }
  ): Promise<OrderConfirmation> {
    const service = this.getUserService(userId);
    return await service.modifyPosition(dealId, {
      stopLevel: modifications.stopLoss,
      profitLevel: modifications.takeProfit,
      trailingStop: modifications.trailingStop,
    });
  }

  /**
   * Closes a position
   */
  public async closePosition(userId: string, dealId: string): Promise<OrderConfirmation> {
    const service = this.getUserService(userId);
    return await service.closePosition(dealId);
  }

  /**
   * Gets all open positions for a user
   */
  public async getOpenPositions(userId: string): Promise<Position[]> {
    const service = this.getUserService(userId);
    return await service.getOpenPositions();
  }

  /**
   * Gets account information for a user
   */
  public async getAccountInfo(userId: string): Promise<{
    balance: number;
    deposit: number;
    profitLoss: number;
    available: number;
  }> {
    const service = this.getUserService(userId);
    return await service.getAccountInfo();
  }

  /**
   * Verifies that an order was executed successfully
   */
  private async verifyOrderExecution(userId: string, dealReference: string): Promise<OrderConfirmation> {
    const service = this.getUserService(userId);

    // Wait for a short time to allow the order to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check order status
    return await service.getOrderConfirmation(dealReference);
  }

  private getUserService(userId: string): CapitalService {
    const service = this.userServices.get(userId);
    if (!service) {
      throw new Error("User trading service not initialized");
    }
    return service;
  }
}

export default OrderExecutionService;
