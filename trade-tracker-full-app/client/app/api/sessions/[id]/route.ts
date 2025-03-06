import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Get a specific session with its analysis history
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await prisma.analysisSession.findUnique({
      where: {
        id: params.id,
        userId: user.id!,
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Limit to last 10 analyses
        },
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("[SESSION_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update session name
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Missing session name", { status: 400 });
    }

    const session = await prisma.analysisSession.update({
      where: {
        id: params.id,
        userId: user.id!,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[SESSION_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete a session
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.analysisSession.delete({
      where: {
        id: params.id,
        userId: user.id!,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SESSION_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
