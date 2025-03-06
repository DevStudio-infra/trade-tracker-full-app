import { NextResponse } from "next/server";

import { embeddingService } from "@/lib/embeddings/gemini-embeddings";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, category, tags } = await req.json();

    if (!content || !category || !tags) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Delete existing item
    await prisma.$executeRaw`
      DELETE FROM trading_knowledge_embeddings
      WHERE id = ${params.id}::uuid
    `;

    // Create new item with updated content
    await embeddingService.batchProcess([
      {
        content,
        category,
        tags,
        metadata: {},
      },
    ]);

    return new NextResponse("Updated", { status: 200 });
  } catch (error) {
    console.error("[KNOWLEDGE_PUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.$executeRaw`
      DELETE FROM trading_knowledge_embeddings
      WHERE id = ${params.id}::uuid
    `;

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[KNOWLEDGE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
