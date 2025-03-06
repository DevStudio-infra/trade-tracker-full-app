import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  embeddingService,
  KnowledgeCategory,
} from "@/lib/embeddings/gemini-embeddings";
import { prisma } from "@/lib/prisma";

// Mock the Gemini AI and Prisma client
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      embedContent: jest.fn().mockImplementation(() => ({
        embedding: {
          values: Array(768).fill(0.1), // Mock embedding vector
        },
      })),
    })),
  })),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    tradingKnowledgeEmbedding: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

describe("GeminiEmbeddingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateEmbedding", () => {
    it("should generate embeddings for given text", async () => {
      const text = "Test trading pattern";
      const embedding = await embeddingService.generateEmbedding(text);

      expect(embedding).toHaveLength(768);
      expect(embedding.every((val) => val === 0.1)).toBe(true);
    });
  });

  describe("batchProcess", () => {
    it("should process multiple inputs in batches", async () => {
      const inputs = [
        {
          content: "Pattern 1",
          category: "PATTERN" as KnowledgeCategory,
          tags: ["test"],
          metadata: {},
        },
        {
          content: "Psychology 1",
          category: "PSYCHOLOGY" as KnowledgeCategory,
          tags: ["test"],
          metadata: {},
        },
      ];

      await embeddingService.batchProcess(inputs);

      expect(prisma.tradingKnowledgeEmbedding.create).toHaveBeenCalledTimes(2);
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Test error");
      (
        prisma.tradingKnowledgeEmbedding.create as jest.Mock
      ).mockRejectedValueOnce(mockError);

      const inputs = [
        {
          content: "Error Pattern",
          category: "PATTERN" as KnowledgeCategory,
          tags: ["test"],
          metadata: {},
        },
      ];

      await expect(
        embeddingService.batchProcess(inputs),
      ).resolves.not.toThrow();
    });
  });

  describe("findSimilar", () => {
    it("should find similar documents with correct query structure", async () => {
      const mockResults = [
        {
          id: "1",
          content: "Test Pattern",
          similarity: 0.9,
        },
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResults);

      const results = await embeddingService.findSimilar("test query");

      expect(results).toEqual(mockResults);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should apply category filter when provided", async () => {
      const category = "PATTERN" as KnowledgeCategory;
      await embeddingService.findSimilar("test query", category);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      // Verify the SQL contains the category filter
      const sqlCall = (prisma.$queryRaw as jest.Mock).mock.calls[0][0];
      expect(sqlCall.strings.join("")).toContain("WHERE category =");
    });
  });
});
