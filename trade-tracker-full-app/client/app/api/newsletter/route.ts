import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return new NextResponse("Already subscribed", { status: 400 });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return new NextResponse("Subscribed successfully", { status: 201 });
  } catch (error) {
    console.error("[NEWSLETTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("[NEWSLETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
