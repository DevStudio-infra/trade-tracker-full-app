import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.id !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { amount = 1 } = await req.json();

    const credit = await prisma.aICredit.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!credit) {
      return new NextResponse("No credits found", { status: 404 });
    }

    if (credit.balance < amount) {
      return new NextResponse("Insufficient credits", { status: 400 });
    }

    // Update credit balance and create transaction record
    const [updatedCredit, transaction] = await prisma.$transaction([
      prisma.aICredit.update({
        where: {
          id: credit.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
      prisma.aICreditTransaction.create({
        data: {
          creditId: credit.id,
          amount: -amount,
          type: "USAGE",
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      balance: updatedCredit.balance,
      transaction,
    });
  } catch (error) {
    console.error("[CREDITS_USE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
