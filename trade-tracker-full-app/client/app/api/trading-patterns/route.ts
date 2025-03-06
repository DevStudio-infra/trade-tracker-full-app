import { NextResponse } from "next/server";
import { LLMResponseHandler } from "@/lib/utils/llm-response-handler";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const handler = new LLMResponseHandler(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Format the prompt to encourage valid JSON responses
    const formattedPrompt = LLMResponseHandler.formatPrompt(prompt);

    // Get validated response from LLM
    const pattern = await handler.getValidatedResponse(formattedPrompt);

    // Store in database
    const embedding = await generateEmbedding(pattern.content);
    await prisma.$executeRaw`
      INSERT INTO trading_knowledge_embeddings (
        id, content, embedding, category, tags, metadata, "createdAt", "updatedAt"
      )
      VALUES (
        uuid_generate_v4(),
        ${pattern.content},
        ${JSON.stringify(embedding)}::vector,
        ${pattern.category},
        ${pattern.tags},
        ${JSON.stringify(pattern.metadata)}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (content) DO UPDATE SET
        embedding = ${JSON.stringify(embedding)}::vector,
        category = ${pattern.category},
        tags = ${pattern.tags},
        metadata = ${JSON.stringify(pattern.metadata)}::jsonb,
        "updatedAt" = NOW()
    `;

    return NextResponse.json({ success: true, pattern });
  } catch (error) {
    console.error("Error processing pattern:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process pattern" },
      { status: 500 }
    );
  }
}

async function generateEmbedding(text: string) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
