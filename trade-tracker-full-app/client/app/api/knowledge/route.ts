import { NextResponse } from "next/server";

import { embeddingService } from "@/lib/embeddings/gemini-embeddings";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const items = await prisma.$queryRaw`
      SELECT id, content, category, tags, metadata
      FROM trading_knowledge_embeddings
      ORDER BY created_at DESC
    `;

    return NextResponse.json(items);
  } catch (error) {
    console.error("[KNOWLEDGE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, category, tags } = await req.json();

    if (!content || !category || !tags) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await embeddingService.batchProcess([
      {
        content,
        category,
        tags,
        metadata: {},
      },
    ]);

    return new NextResponse("Created", { status: 201 });
  } catch (error) {
    console.error("[KNOWLEDGE_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
