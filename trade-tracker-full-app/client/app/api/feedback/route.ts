import { NextResponse } from "next/server";
import { z } from "zod";

import { ragFeedbackService } from "@/lib/feedback/rag-feedback";
import { getCurrentUser } from "@/lib/session";

// Validate feedback payload
const feedbackSchema = z.object({
  queryText: z.string(),
  selectedKnowledge: z.array(z.string()),
  isRelevant: z.boolean(),
  feedbackText: z.string().optional(),
  suggestedImprovement: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = feedbackSchema.parse(body);

    const feedback = await ragFeedbackService.recordFeedback({
      userId: user.id,
      ...validatedData,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("[FEEDBACK_ERROR]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid feedback data", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const threshold = parseFloat(searchParams.get("threshold") || "0.5");

    const [topPerforming, lowPerforming] = await Promise.all([
      ragFeedbackService.getTopPerformingKnowledge(limit),
      ragFeedbackService.getLowPerformingKnowledge(threshold),
    ]);

    return NextResponse.json({
      topPerforming,
      lowPerforming,
    });
  } catch (error) {
    console.error("[FEEDBACK_METRICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
