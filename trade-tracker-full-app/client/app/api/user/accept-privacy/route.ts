import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update user's privacy acceptance status
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hasAcceptedPrivacy: true,
      },
    });

    return NextResponse.json({
      message: "Privacy policy accepted successfully",
    });
  } catch (error) {
    console.error("[ACCEPT_PRIVACY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
