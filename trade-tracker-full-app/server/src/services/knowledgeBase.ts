import { PrismaClient, TradingStrategy } from "@prisma/client";
import { AIService } from "./ai";
import { gemini } from "./gemini";
import { z } from "zod";

// Schema for strategy creation/update
const strategySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  rules: z.string().min(10),
  metadata: z
    .object({
      timeframes: z.array(z.string()),
      indicators: z.array(z.string()),
      riskLevel: z.enum(["low", "medium", "high"]),
      type: z.string(),
    })
    .optional(),
});

export type StrategyInput = z.infer<typeof strategySchema>;

class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private prisma: PrismaClient;
  private aiService: AIService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.aiService = AIService.getInstance();
  }

  public static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  /**
   * Add a new trading strategy to the knowledge base
   */
  public async addStrategy(input: StrategyInput): Promise<TradingStrategy> {
    try {
      // Validate input
      const validatedData = strategySchema.parse(input);

      // Generate embedding for the strategy
      const embedding = await this.generateEmbedding(validatedData);

      // Create strategy in database
      const strategy = await this.prisma.tradingStrategy.create({
        data: {
          ...validatedData,
          embedding,
        },
      });

      return strategy;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid strategy data: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing trading strategy
   */
  public async updateStrategy(id: string, input: Partial<StrategyInput>): Promise<TradingStrategy> {
    try {
      // Get existing strategy
      const existingStrategy = await this.prisma.tradingStrategy.findUnique({
        where: { id },
      });

      if (!existingStrategy) {
        throw new Error("Strategy not found");
      }

      // Merge existing data with updates
      const updatedData = {
        ...existingStrategy,
        ...input,
      };

      // Validate merged data
      strategySchema.parse(updatedData);

      // Generate new embedding if content changed
      const embedding = await this.generateEmbedding(updatedData);

      // Update strategy
      const strategy = await this.prisma.tradingStrategy.update({
        where: { id },
        data: {
          ...input,
          embedding,
        },
      });

      return strategy;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid strategy data: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for similar trading strategies
   */
  public async searchStrategies(query: string, limit: number = 5): Promise<TradingStrategy[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding({ description: query });

      // Search using vector similarity
      const strategies = await this.prisma.$queryRaw<TradingStrategy[]>`
        SELECT * FROM trading_strategies
        ORDER BY embedding <=> ${queryEmbedding}::vector
        LIMIT ${limit}
      `;

      return strategies;
    } catch (error) {
      console.error("Error searching strategies:", error);
      throw new Error("Failed to search strategies");
    }
  }

  /**
   * Delete a trading strategy
   */
  public async deleteStrategy(id: string): Promise<void> {
    await this.prisma.tradingStrategy.delete({
      where: { id },
    });
  }

  /**
   * Generate embedding for a strategy or query
   */
  private async generateEmbedding(input: Partial<StrategyInput> | { description: string }): Promise<number[]> {
    try {
      // Combine relevant fields for embedding
      const text = "description" in input ? input.description : `${input.name || ""}\n${input.description || ""}\n${input.rules || ""}`.trim();

      if (!text) {
        throw new Error("No text content available for embedding generation");
      }

      // Use Gemini service to generate embedding
      return await gemini.generateEmbedding(text);
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }
}

export default KnowledgeBaseService;
