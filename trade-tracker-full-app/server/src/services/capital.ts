import axios, { AxiosInstance } from "axios";
import WebSocket from "ws";
import { env } from "../env";

export interface OHLCVCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CapitalConfig {
  apiKey: string;
  demo?: boolean;
}

interface WebSocketMessage {
  destination: string;
  payload: any;
}

// Add new interfaces for trading
export interface OrderRequest {
  epic: string;
  direction: "BUY" | "SELL";
  size: number;
  orderType: "MARKET" | "LIMIT";
  limitLevel?: number;
  stopLevel?: number;
  profitLevel?: number;
  trailingStop?: boolean;
  guaranteedStop?: boolean;
}

export interface Position {
  dealId: string;
  epic: string;
  direction: "BUY" | "SELL";
  size: number;
  profit: number;
  openLevel: number;
  currentLevel: number;
  stopLevel?: number;
  profitLevel?: number;
  createdDate: string;
}

export interface OrderConfirmation {
  dealReference: string;
  status: "ACCEPTED" | "REJECTED";
  reason?: string;
  dealId?: string;
}

class CapitalService {
  private static instance: CapitalService;
  private readonly restClient: AxiosInstance;
  private readonly wsEndpoint: string;
  private readonly demo: boolean;
  private ws: WebSocket | null = null;
  private sessionToken: string | null = null;
  private activeSubscriptions: Set<string> = new Set();

  private constructor(config: CapitalConfig) {
    this.demo = config.demo || false;
    const baseURL = this.demo ? "https://demo-api-capital.backend-capital.com/api/v1" : "https://api-capital.backend-capital.com/api/v1";

    this.wsEndpoint = this.demo ? "wss://demo-api-streaming.backend-capital.com/connect" : "wss://api-streaming.backend-capital.com/connect";

    this.restClient = axios.create({
      baseURL,
      headers: {
        "X-CAP-API-KEY": config.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  public static getInstance(config?: CapitalConfig): CapitalService {
    if (!CapitalService.instance && config) {
      CapitalService.instance = new CapitalService(config);
    }
    return CapitalService.instance;
  }

  /**
   * Initializes WebSocket connection and session
   */
  public async connect(): Promise<void> {
    try {
      // First get a session token
      const session = await this.createSession();
      this.sessionToken = session.token;

      // Initialize WebSocket connection
      this.ws = new WebSocket(this.wsEndpoint);

      this.ws.on("open", () => {
        console.log("WebSocket connection established");
        this.authenticate();
      });

      this.ws.on("message", (data: WebSocket.Data) => {
        this.handleWebSocketMessage(data);
      });

      this.ws.on("close", () => {
        console.log("WebSocket connection closed");
        this.reconnect();
      });

      this.ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.reconnect();
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      throw new Error("Failed to establish connection");
    }
  }

  /**
   * Subscribes to real-time candle updates for a specific pair and timeframe
   */
  public async subscribeToCandles(pair: string, timeframe: number): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket connection not established");
    }

    const subscriptionKey = `${pair}:${timeframe}`;
    if (this.activeSubscriptions.has(subscriptionKey)) {
      return; // Already subscribed
    }

    const message: WebSocketMessage = {
      destination: "price.subscribe",
      payload: {
        epic: pair,
        resolution: this.convertTimeframeToResolution(timeframe),
      },
    };

    this.ws.send(JSON.stringify(message));
    this.activeSubscriptions.add(subscriptionKey);
  }

  /**
   * Unsubscribes from real-time candle updates
   */
  public async unsubscribeFromCandles(pair: string, timeframe: number): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const subscriptionKey = `${pair}:${timeframe}`;
    if (!this.activeSubscriptions.has(subscriptionKey)) {
      return; // Not subscribed
    }

    const message: WebSocketMessage = {
      destination: "price.unsubscribe",
      payload: {
        epic: pair,
        resolution: this.convertTimeframeToResolution(timeframe),
      },
    };

    this.ws.send(JSON.stringify(message));
    this.activeSubscriptions.delete(subscriptionKey);
  }

  /**
   * Fetches historical candle data for a specific pair and timeframe
   * @param pair - Trading pair (e.g., "EURUSD")
   * @param timeframe - Candle timeframe in minutes (e.g., 60 for 1H)
   * @param limit - Number of candles to fetch (max 200)
   */
  public async fetchHistoricalCandles(pair: string, timeframe: number, limit: number = 200): Promise<OHLCVCandle[]> {
    try {
      const response = await this.restClient.get("/prices", {
        params: {
          epic: pair,
          resolution: this.convertTimeframeToResolution(timeframe),
          max: Math.min(limit, 200), // Ensure we don't exceed API limits
          from: this.getFromTimestamp(timeframe, limit),
        },
      });

      return this.transformCandles(response.data.prices);
    } catch (error) {
      console.error("Error fetching historical candles:", error);
      throw new Error("Failed to fetch historical candles");
    }
  }

  private async createSession(): Promise<{ token: string }> {
    try {
      const response = await this.restClient.post("/session");
      return {
        token: response.data.token,
      };
    } catch (error) {
      console.error("Failed to create session:", error);
      throw new Error("Session creation failed");
    }
  }

  private authenticate(): void {
    if (!this.ws || !this.sessionToken) return;

    const message: WebSocketMessage = {
      destination: "auth.connect",
      payload: {
        token: this.sessionToken,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  private async reconnect(): Promise<void> {
    // Store current subscriptions
    const subscriptions = [...this.activeSubscriptions];

    // Clear current state
    this.ws = null;
    this.sessionToken = null;
    this.activeSubscriptions.clear();

    // Wait a bit before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Reconnect and resubscribe
    await this.connect();
    for (const sub of subscriptions) {
      const [pair, timeframe] = sub.split(":");
      await this.subscribeToCandles(pair, parseInt(timeframe));
    }
  }

  private handleWebSocketMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle different message types
      switch (message.destination) {
        case "price.update":
          this.handlePriceUpdate(message.payload);
          break;
        case "auth.success":
          console.log("WebSocket authentication successful");
          break;
        case "auth.error":
          console.error("WebSocket authentication failed:", message.payload);
          break;
        default:
          console.log("Received message:", message);
      }
    } catch (error) {
      console.error("Failed to handle WebSocket message:", error);
    }
  }

  private handlePriceUpdate(payload: any): void {
    // Transform the price update into our candle format
    const candle: OHLCVCandle = {
      timestamp: new Date(payload.snapshotTime).getTime(),
      open: parseFloat(payload.openPrice),
      high: parseFloat(payload.highPrice),
      low: parseFloat(payload.lowPrice),
      close: parseFloat(payload.closePrice),
      volume: parseFloat(payload.lastTradedVolume),
    };

    // Emit the update (we'll implement an event emitter later)
    console.log("New candle:", candle);
  }

  /**
   * Converts our timeframe (in minutes) to Capital.com's resolution format
   */
  private convertTimeframeToResolution(timeframeMinutes: number): string {
    const resolutionMap: { [key: number]: string } = {
      1: "MINUTE",
      5: "MINUTE_5",
      15: "MINUTE_15",
      30: "MINUTE_30",
      60: "HOUR",
      240: "HOUR_4",
      1440: "DAY",
      10080: "WEEK",
    };

    return resolutionMap[timeframeMinutes] || "HOUR";
  }

  /**
   * Calculates the 'from' timestamp based on timeframe and limit
   */
  private getFromTimestamp(timeframeMinutes: number, limit: number): string {
    const now = new Date();
    const fromDate = new Date(now.getTime() - timeframeMinutes * limit * 60 * 1000);
    return fromDate.toISOString();
  }

  /**
   * Transforms Capital.com candle format to our standardized OHLCV format
   */
  private transformCandles(capitalCandles: any[]): OHLCVCandle[] {
    return capitalCandles.map((candle) => ({
      timestamp: new Date(candle.snapshotTime).getTime(),
      open: parseFloat(candle.openPrice),
      high: parseFloat(candle.highPrice),
      low: parseFloat(candle.lowPrice),
      close: parseFloat(candle.closePrice),
      volume: parseFloat(candle.lastTradedVolume),
    }));
  }

  /**
   * Creates a new instance for user-specific operations
   * @param userApiKey - The user's Capital.com API key
   * @param demo - Whether to use demo environment
   */
  public static createUserInstance(userApiKey: string, demo: boolean = true): CapitalService {
    return new CapitalService({ apiKey: userApiKey, demo });
  }

  /**
   * Places a market or limit order
   */
  public async placeOrder(request: OrderRequest): Promise<OrderConfirmation> {
    try {
      const response = await this.restClient.post("/positions", {
        ...request,
        currencyCode: "USD", // Default to USD, can be made configurable
      });

      return {
        dealReference: response.data.dealReference,
        status: response.data.status,
        dealId: response.data.dealId,
      };
    } catch (error: any) {
      console.error("Failed to place order:", error.response?.data || error.message);
      return {
        dealReference: "",
        status: "REJECTED",
        reason: error.response?.data?.errorCode || "Unknown error",
      };
    }
  }

  /**
   * Gets the status of an order by deal reference
   */
  public async getOrderConfirmation(dealReference: string): Promise<OrderConfirmation> {
    try {
      const response = await this.restClient.get(`/confirms/${dealReference}`);
      return {
        dealReference,
        status: response.data.status,
        dealId: response.data.dealId,
      };
    } catch (error: any) {
      console.error("Failed to get order confirmation:", error.response?.data || error.message);
      return {
        dealReference,
        status: "REJECTED",
        reason: error.response?.data?.errorCode || "Unknown error",
      };
    }
  }

  /**
   * Modifies an existing position
   */
  public async modifyPosition(
    dealId: string,
    modifications: {
      stopLevel?: number;
      profitLevel?: number;
      trailingStop?: boolean;
    }
  ): Promise<OrderConfirmation> {
    try {
      const response = await this.restClient.put(`/positions/${dealId}`, modifications);
      return {
        dealReference: response.data.dealReference,
        status: "ACCEPTED",
        dealId,
      };
    } catch (error: any) {
      console.error("Failed to modify position:", error.response?.data || error.message);
      return {
        dealReference: "",
        status: "REJECTED",
        reason: error.response?.data?.errorCode || "Unknown error",
      };
    }
  }

  /**
   * Closes an existing position
   */
  public async closePosition(dealId: string): Promise<OrderConfirmation> {
    try {
      const response = await this.restClient.delete(`/positions/${dealId}`);
      return {
        dealReference: response.data.dealReference,
        status: "ACCEPTED",
        dealId,
      };
    } catch (error: any) {
      console.error("Failed to close position:", error.response?.data || error.message);
      return {
        dealReference: "",
        status: "REJECTED",
        reason: error.response?.data?.errorCode || "Unknown error",
      };
    }
  }

  /**
   * Gets all open positions
   */
  public async getOpenPositions(): Promise<Position[]> {
    try {
      const response = await this.restClient.get("/positions");
      return response.data.positions.map(this.transformPosition);
    } catch (error: any) {
      console.error("Failed to get positions:", error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Gets account balance and other details
   */
  public async getAccountInfo(): Promise<{
    balance: number;
    deposit: number;
    profitLoss: number;
    available: number;
  }> {
    try {
      const response = await this.restClient.get("/accounts");
      const account = response.data.accounts[0]; // Get first account
      return {
        balance: parseFloat(account.balance),
        deposit: parseFloat(account.deposit),
        profitLoss: parseFloat(account.profitLoss),
        available: parseFloat(account.available),
      };
    } catch (error: any) {
      console.error("Failed to get account info:", error.response?.data || error.message);
      throw new Error("Failed to get account information");
    }
  }

  private transformPosition(position: any): Position {
    return {
      dealId: position.dealId,
      epic: position.epic,
      direction: position.direction,
      size: parseFloat(position.size),
      profit: parseFloat(position.profit),
      openLevel: parseFloat(position.openLevel),
      currentLevel: parseFloat(position.currentLevel),
      stopLevel: position.stopLevel ? parseFloat(position.stopLevel) : undefined,
      profitLevel: position.profitLevel ? parseFloat(position.profitLevel) : undefined,
      createdDate: position.createdDate,
    };
  }
}

export default CapitalService;
