import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Get all sessions for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sessions = await prisma.analysisSession.findMany({
      where: {
        userId: user.id!,
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get only the latest analysis
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[SESSIONS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new session
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Missing session name", { status: 400 });
    }

    const session = await prisma.analysisSession.create({
      data: {
        userId: user.id!,
        name,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[SESSIONS_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
