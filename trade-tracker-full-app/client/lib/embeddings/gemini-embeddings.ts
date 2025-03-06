import { GoogleGenerativeAI } from "@google/generative-ai";
import { chunk } from "lodash";

import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const embeddingModel = "embedding-001";

export type KnowledgeCategory =
  | "PATTERN"
  | "PSYCHOLOGY"
  | "RISK_MANAGEMENT"
  | "ANALYSIS"
  | "MARKET_CONDITION";

interface EmbeddingInput {
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  metadata: Record<string, any>;
}

export class GeminiEmbeddingService {
  private static instance: GeminiEmbeddingService;
  private batchSize = 100;
  private rateLimit = 60; // requests per minute

  private constructor() {}

  public static getInstance(): GeminiEmbeddingService {
    if (!GeminiEmbeddingService.instance) {
      GeminiEmbeddingService.instance = new GeminiEmbeddingService();
    }
    return GeminiEmbeddingService.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: embeddingModel });
    const result = await model.embedContent(text);
    const embedding = await result.embedding;
    return embedding.values;
  }

  async batchProcess(inputs: EmbeddingInput[]): Promise<void> {
    const batches = chunk(inputs, this.batchSize);

    for (const batch of batches) {
      const promises = batch.map(async (input) => {
        try {
          const embedding = await this.generateEmbedding(input.content);

          await prisma.$queryRawUnsafe(
            `
            INSERT INTO trading_knowledge_embeddings (id, content, embedding, category, tags, metadata, created_at, updated_at)
            VALUES (uuid_generate_v4(), ?, ?::vector, ?, ?, ?::jsonb, NOW(), NOW())
            ON CONFLICT (content)
            DO UPDATE SET
              embedding = ?::vector,
              category = ?,
              tags = ?,
              metadata = ?::jsonb,
              updated_at = NOW()
          `,
            input.content,
            JSON.stringify(embedding),
            input.category,
            input.tags,
            JSON.stringify(input.metadata),
            JSON.stringify(embedding),
            input.category,
            input.tags,
            JSON.stringify(input.metadata),
          );
        } catch (error) {
          console.error(
            `Error processing embedding for content: ${input.content.substring(0, 50)}...`,
            error,
          );
        }
      });

      await Promise.all(promises);
      await new Promise((resolve) =>
        setTimeout(resolve, (60 / this.rateLimit) * 1000),
      );
    }
  }

  async findSimilar(
    query: string,
    category?: KnowledgeCategory,
    limit: number = 5,
  ): Promise<any[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const whereClause = category ? `WHERE category = '${category}'` : "";

    const results = await prisma.$queryRawUnsafe(
      `
      SELECT
        id,
        content,
        metadata,
        category,
        tags,
        1 - (embedding <=> $1::vector) as similarity
      FROM trading_knowledge_embeddings
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `,
      JSON.stringify(queryEmbedding),
      limit,
    );

    return results as any[];
  }
}

export const embeddingService = GeminiEmbeddingService.getInstance();
