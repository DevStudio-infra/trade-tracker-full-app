import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
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

    // First get the user's credit record
    const creditRecord = await prisma.aICredit.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!creditRecord) {
      return NextResponse.json({ transactions: [] });
    }

    // Then get all transactions for this credit record
    const transactions = await prisma.aICreditTransaction.findMany({
      where: {
        creditId: creditRecord.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
