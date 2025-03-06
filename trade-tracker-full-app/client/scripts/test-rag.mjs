import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = "embedding-001";

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: embeddingModel });
  const result = await model.embedContent(text);
  const embedding = await result.embedding;
  return embedding.values;
}

async function testRAG() {
  try {
    console.log("🔍 Testing RAG System...\n");

    // 1. First verify we have data
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM trading_knowledge_embeddings
    `;
    console.log(`📊 Total knowledge entries: ${count[0].count}\n`);

    // 2. Test queries for different categories
    const testQueries = [
      {
        query: "What should I do when I see a double bottom pattern?",
        expectedCategory: "PATTERN",
      },
      {
        query: "How do I handle FOMO in trading?",
        expectedCategory: "PSYCHOLOGY",
      },
      {
        query: "What's the best position size for a trade?",
        expectedCategory: "RISK_MANAGEMENT",
      },
    ];

    for (const test of testQueries) {
      console.log(`🔎 Testing query: "${test.query}"`);
      const queryEmbedding = await generateEmbedding(test.query);

      const results = await prisma.$queryRaw`
        SELECT
          id,
          content,
          category,
          1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
        FROM trading_knowledge_embeddings
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT 1
      `;

      const match = results[0];
      console.log(`📝 Top match category: ${match.category}`);
      console.log(
        `📈 Similarity score: ${(match.similarity * 100).toFixed(2)}%`,
      );
      console.log(`🎯 Expected category: ${test.expectedCategory}`);
      console.log(
        `✅ Category match: ${match.category === test.expectedCategory}`,
      );
      console.log("\nMatched content preview:");
      console.log(match.content.substring(0, 150) + "...\n");
      console.log("-".repeat(80) + "\n");
    }

    // 3. Test category-specific search
    console.log("🎯 Testing category-specific search...");
    const categoryQuery = "managing trading losses";
    const queryEmbedding = await generateEmbedding(categoryQuery);

    const psychologyResults = await prisma.$queryRaw`
      SELECT
        content,
        category,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM trading_knowledge_embeddings
      WHERE category = 'PSYCHOLOGY'
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT 1
    `;

    console.log("\n📊 Psychology-specific results:");
    console.log(`Query: "${categoryQuery}"`);
    console.log(
      `Top match similarity: ${(psychologyResults[0].similarity * 100).toFixed(2)}%`,
    );
    console.log(
      `Content preview: ${psychologyResults[0].content.substring(0, 100)}...\n`,
    );
  } catch (error) {
    console.error("❌ Error testing RAG:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testRAG();
