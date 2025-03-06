import Redis from "ioredis";

class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    // Construct Upstash Redis URL from environment variables
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      throw new Error("Missing Upstash Redis credentials");
    }

    // Remove 'https://' from the URL and construct the Redis URL
    const hostname = UPSTASH_URL.replace("https://", "");
    const redisUrl = `rediss://default:${UPSTASH_TOKEN}@${hostname}:6379`;

    this.client = new Redis(redisUrl);

    this.client.on("error", (error) => {
      console.error("Redis Error:", error);
    });

    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });

    this.client.on("ready", () => {
      console.log("Redis Client Ready");
    });

    this.client.on("end", () => {
      console.log("Redis Connection Ended");
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  // Cache OHLCV candles
  public async setCandleData(pair: string, timeframe: string, candles: any[]): Promise<void> {
    const key = `pair:${pair}:tf:${timeframe}:candles`;
    await this.client.set(key, JSON.stringify(candles), "EX", this.getTTL(timeframe));
  }

  public async getCandleData(pair: string, timeframe: string): Promise<any[] | null> {
    const key = `pair:${pair}:tf:${timeframe}:candles`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Helper method to convert timeframe to TTL in seconds
  private getTTL(timeframe: string): number {
    const ttlMap: { [key: string]: number } = {
      "1m": 60,
      "5m": 300,
      "15m": 900,
      "30m": 1800,
      "1h": 3600,
      "4h": 14400,
      "1d": 86400,
      "1w": 604800,
    };
    return ttlMap[timeframe] || 3600; // Default to 1 hour if timeframe not found
  }

  // Method to close the Redis connection
  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Export a singleton instance
export const redis = RedisService.getInstance();
