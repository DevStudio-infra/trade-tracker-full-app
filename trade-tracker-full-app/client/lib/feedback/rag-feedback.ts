import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export interface RAGFeedback {
  userId: string;
  queryText: string;
  selectedKnowledge: string[];
  isRelevant: boolean;
  feedbackText?: string;
  suggestedImprovement?: string;
}

export interface KnowledgeUsageMetrics {
  knowledgeId: string;
  usageCount: number;
  relevanceScore: number;
  lastUsed: Date;
}

export class RAGFeedbackService {
  private static instance: RAGFeedbackService;

  private constructor() {}

  public static getInstance(): RAGFeedbackService {
    if (!RAGFeedbackService.instance) {
      RAGFeedbackService.instance = new RAGFeedbackService();
    }
    return RAGFeedbackService.instance;
  }

  async recordFeedback(feedback: RAGFeedback) {
    // Store feedback using Prisma
    const data = await prisma.rAGFeedback.create({
      data: {
        userId: feedback.userId,
        queryText: feedback.queryText,
        selectedKnowledge: feedback.selectedKnowledge,
        isRelevant: feedback.isRelevant,
        feedbackText: feedback.feedbackText,
        suggestedImprovement: feedback.suggestedImprovement,
      },
    });

    // Update knowledge usage metrics
    await this.updateKnowledgeMetrics(feedback);

    return data;
  }

  private async updateKnowledgeMetrics(feedback: RAGFeedback) {
    const relevanceScore = feedback.isRelevant ? 1 : -1;

    for (const knowledgeId of feedback.selectedKnowledge) {
      // First get current metrics
      const current = await prisma.knowledgeUsageMetrics.findUnique({
        where: { knowledgeId },
      });

      // Calculate new relevance score
      const newUsageCount = (current?.usageCount ?? 0) + 1;
      const newRelevanceScore = current
        ? (current.relevanceScore * current.usageCount + relevanceScore) /
          newUsageCount
        : relevanceScore;

      await prisma.knowledgeUsageMetrics.upsert({
        where: {
          knowledgeId: knowledgeId,
        },
        create: {
          knowledgeId: knowledgeId,
          usageCount: 1,
          relevanceScore: relevanceScore,
          lastUsed: new Date(),
        },
        update: {
          usageCount: newUsageCount,
          relevanceScore: newRelevanceScore,
          lastUsed: new Date(),
        },
      });
    }
  }

  async getKnowledgeMetrics(
    knowledgeId: string,
  ): Promise<KnowledgeUsageMetrics | null> {
    return prisma.knowledgeUsageMetrics.findUnique({
      where: {
        knowledgeId: knowledgeId,
      },
    });
  }

  async getTopPerformingKnowledge(
    limit: number = 10,
  ): Promise<KnowledgeUsageMetrics[]> {
    return prisma.knowledgeUsageMetrics.findMany({
      orderBy: [{ relevanceScore: "desc" }, { usageCount: "desc" }],
      take: limit,
    });
  }

  async getLowPerformingKnowledge(
    threshold: number = 0.5,
  ): Promise<KnowledgeUsageMetrics[]> {
    return prisma.knowledgeUsageMetrics.findMany({
      where: {
        AND: [{ relevanceScore: { lt: threshold } }, { usageCount: { gt: 5 } }],
      },
      orderBy: {
        relevanceScore: "asc",
      },
    });
  }
}

export const ragFeedbackService = RAGFeedbackService.getInstance();
