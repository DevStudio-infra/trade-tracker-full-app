import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update user's welcome message status
    await prisma.user.update({
      where: { id: user.id },
      data: { hasSeenWelcome: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WELCOME_SEEN]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
