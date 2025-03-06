import { PrismaClient, TradingStrategy, Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
  generationConfig: {
    temperature: 0.7,
  },
});

export class TradingPatternService {
  async findSimilarPatterns(query: string, limit: number = 5): Promise<TradingStrategy[]> {
    // Generate embedding for the query
    const embedding = await this.generateEmbedding(query);

    // Find similar patterns using vector similarity
    const patterns = await prisma.$queryRaw<TradingStrategy[]>`
      SELECT *,
        embedding <=> ${JSON.stringify(embedding)}::vector AS similarity
      FROM trading_strategies
      ORDER BY similarity ASC
      LIMIT ${limit};
    `;

    return patterns;
  }

  async createPattern(data: { name: string; description: string; rules: string; metadata?: Record<string, any> }): Promise<TradingStrategy> {
    const embedding = await this.generateEmbedding(data.description + " " + data.rules);

    return prisma.tradingStrategy.create({
      data: {
        ...data,
        embedding: embedding as Prisma.InputJsonValue,
        metadata: (data.metadata || {}) as Prisma.InputJsonValue,
      },
    });
  }

  async updatePattern(
    id: string,
    data: {
      name?: string;
      description?: string;
      rules?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<TradingStrategy> {
    const pattern = await prisma.tradingStrategy.findUnique({
      where: { id },
    });

    if (!pattern) {
      throw new Error("Pattern not found");
    }

    // Only regenerate embedding if description or rules are updated
    let embedding: Prisma.InputJsonValue = pattern.embedding as Prisma.InputJsonValue;
    if (data.description || data.rules) {
      const textToEmbed = (data.description || pattern.description) + " " + (data.rules || pattern.rules);
      embedding = (await this.generateEmbedding(textToEmbed)) as Prisma.InputJsonValue;
    }

    return prisma.tradingStrategy.update({
      where: { id },
      data: {
        ...data,
        embedding,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async deletePattern(id: string): Promise<void> {
    await prisma.tradingStrategy.delete({
      where: { id },
    });
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await model.embedContent(text);
      const embedding = await result.embedding;
      return embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }
}

export const tradingPatternService = new TradingPatternService();
