import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

interface StrategyMetadata {
  timeframes: string[];
  indicators: string[];
  riskLevel: string;
  type: string;
}

interface TradingStrategy {
  name: string;
  description: string;
  rules: string;
  metadata: StrategyMetadata;
}

interface StrategyWithSimilarity {
  strategy: TradingStrategy;
  similarity: number;
}

class GeminiService {
  private static instance: GeminiService;
  private model: GenerativeModel;
  private genAI: GoogleGenerativeAI;

  private constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: "embedding-004" });
      const result = await embeddingModel.embedContent(text);

      // Convert embedding to array of numbers
      const values = Object.values(result.embedding);
      if (!values.every((value) => typeof value === "number")) {
        throw new Error("Invalid embedding format: not all values are numbers");
      }

      return values as number[];
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  public async compareStrategies(strategy1: TradingStrategy, strategy2: TradingStrategy): Promise<number> {
    try {
      const prompt = `
Compare these two trading strategies and rate their similarity on a scale from 0 to 1, where 1 means identical and 0 means completely different.
Only respond with a number between 0 and 1.

Strategy 1:
Name: ${strategy1.name}
Description: ${strategy1.description}
Rules:
${strategy1.rules}
Timeframes: ${strategy1.metadata.timeframes.join(", ")}
Indicators: ${strategy1.metadata.indicators.join(", ")}
Risk Level: ${strategy1.metadata.riskLevel}
Type: ${strategy1.metadata.type}

Strategy 2:
Name: ${strategy2.name}
Description: ${strategy2.description}
Rules:
${strategy2.rules}
Timeframes: ${strategy2.metadata.timeframes.join(", ")}
Indicators: ${strategy2.metadata.indicators.join(", ")}
Risk Level: ${strategy2.metadata.riskLevel}
Type: ${strategy2.metadata.type}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const similarity = parseFloat(text);

      if (isNaN(similarity) || similarity < 0 || similarity > 1) {
        throw new Error("Invalid similarity score from model");
      }

      return similarity;
    } catch (error) {
      console.error("Error comparing strategies:", error);
      throw error;
    }
  }

  public async findSimilarStrategies(targetStrategy: TradingStrategy, strategies: TradingStrategy[], minSimilarity: number = 0.7): Promise<StrategyWithSimilarity[]> {
    const results: StrategyWithSimilarity[] = [];

    for (const strategy of strategies) {
      const similarity = await this.compareStrategies(targetStrategy, strategy);
      if (similarity >= minSimilarity) {
        results.push({ strategy, similarity });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  public async analyzeStrategy(strategy: TradingStrategy): Promise<string> {
    const prompt = `
Analyze this trading strategy and provide insights about its strengths, weaknesses, and potential improvements:

Name: ${strategy.name}
Description: ${strategy.description}
Rules:
${strategy.rules}
Timeframes: ${strategy.metadata.timeframes.join(", ")}
Indicators: ${strategy.metadata.indicators.join(", ")}
Risk Level: ${strategy.metadata.riskLevel}
Type: ${strategy.metadata.type}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  public async generateStrategyEmbedding(strategy: TradingStrategy): Promise<number[]> {
    const prompt = `
Strategy: ${strategy.name}
Description: ${strategy.description}
Rules:
${strategy.rules}
Timeframes: ${strategy.metadata.timeframes.join(", ")}
Indicators: ${strategy.metadata.indicators.join(", ")}
Risk Level: ${strategy.metadata.riskLevel}
Type: ${strategy.metadata.type}
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Convert text to array of numbers between -1 and 1
    const numbers = text.split(",").map((n) => parseFloat(n));
    if (numbers.length !== 1536 || numbers.some((n) => isNaN(n) || n < -1 || n > 1)) {
      throw new Error("Invalid embedding generated");
    }

    return numbers;
  }
}

export const gemini = GeminiService.getInstance();
