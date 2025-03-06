import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { acceptTerms, acceptPrivacy, hasCompletedOnboarding } =
      await req.json();

    if (
      typeof acceptTerms !== "boolean" ||
      typeof acceptPrivacy !== "boolean"
    ) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Update user's acceptance status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasAcceptedToS: acceptTerms,
        hasAcceptedPrivacy: acceptPrivacy,
        hasCompletedOnboarding: hasCompletedOnboarding,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACCEPT_TERMS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
