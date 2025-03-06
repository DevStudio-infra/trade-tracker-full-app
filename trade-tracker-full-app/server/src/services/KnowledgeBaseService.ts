import { PrismaClient, Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
  generationConfig: {
    temperature: 0.7,
  },
});

export class KnowledgeBaseService {
  async executeRawQuery(query: string, params: Record<string, any> = {}) {
    try {
      // Generate embedding for semantic search if needed
      if (params.useSemanticSearch) {
        const embedding = await this.generateEmbedding(query);
        params.embedding = embedding;
      }

      // Execute the raw query with parameters
      const result = await prisma.$queryRawUnsafe(query, ...Object.values(params));
      return result;
    } catch (error) {
      console.error("Error executing raw query:", error);
      throw error;
    }
  }

  async updateKnowledgeItem(
    id: string,
    data: {
      title?: string;
      content?: string;
      metadata?: Record<string, any>;
      tags?: string[];
    }
  ) {
    const item = await prisma.knowledgeBaseItem.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    // Update embedding if content changed
    if (data.content) {
      const embedding = await this.generateEmbedding(data.content);
      await prisma.knowledgeBaseItem.update({
        where: { id },
        data: {
          embedding: embedding as Prisma.InputJsonValue,
        },
      });
    }

    return item;
  }

  async createRagFeedback(data: { itemId: string; userId: string; query: string; response: string; isRelevant: boolean; feedback?: string }) {
    return prisma.ragFeedback.create({
      data: {
        ...data,
        metadata: {
          timestamp: new Date(),
          queryEmbedding: await this.generateEmbedding(data.query),
        } as Prisma.InputJsonValue,
      },
    });
  }

  async trackUsageMetrics(data: { itemId: string; userId: string; action: string; metadata?: Record<string, any> }) {
    return prisma.knowledgeBaseMetric.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
        timestamp: new Date(),
      },
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

export const knowledgeBaseService = new KnowledgeBaseService();
