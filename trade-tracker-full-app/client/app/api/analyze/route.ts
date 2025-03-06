import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, GenerateContentResult } from "@google/generative-ai";
import { Prisma } from "@prisma/client";

import { embeddingService } from "@/lib/embeddings/gemini-embeddings";
import { ragFeedbackService } from "@/lib/feedback/rag-feedback";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ANALYSIS_CREDIT_COST } from "@/lib/credits/credit-manager";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
  generationConfig: {
    temperature: 0.7
  }
});

interface TradeScore {
  technicalScore: number;
  marketContextScore: number;
  riskScore: number;
  overallScore: number;
  confidence: number;
  explanation: string;
  timeframeRecommendations: {
    shouldCheckOther: boolean;
    suggestedTimeframes: string[];
    reason: string;
  };
}

interface TradeGuidance {
  currentPosition: {
    status: "PROFIT" | "LOSS" | "BREAKEVEN";
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    suggestedAction: "HOLD" | "EXIT" | "PARTIAL_EXIT" | "ADD";
  };
  psychologyCheck: {
    emotionalState: string;
    biasWarnings: string[];
    recommendations: string[];
  };
}

interface AnalysisResponse {
  type: "OPPORTUNITY" | "GUIDANCE";
  score?: TradeScore;
  guidance?: TradeGuidance;
  analysis: string;
  context: Array<{ id: string; category: string; similarity: number }>;
  timestamp: string; // ISO string format
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check user's credit balance
    const creditInfo = await prisma.aICredit.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!creditInfo || creditInfo.balance < ANALYSIS_CREDIT_COST) {
      return new NextResponse(
        JSON.stringify({
          error: "Insufficient credits",
          required: ANALYSIS_CREDIT_COST,
          current: creditInfo?.balance || 0,
        }),
        { status: 402 }
      );
    }

    const { image, prompt, type = "OPPORTUNITY", sessionId } = await req.json();

    if (!image || !prompt) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify session exists and belongs to user
    let session;
    if (sessionId) {
      session = await prisma.analysisSession.findUnique({
        where: {
          id: sessionId,
          userId: user.id!,
        },
      });

      if (!session) {
        return new NextResponse("Invalid session", { status: 400 });
      }
    }

    // Get relevant trading knowledge - limit to 2 most relevant items
    const relevantKnowledge = await embeddingService.findSimilar(
      prompt,
      undefined,
      2
    );

    // Format knowledge for context injection
    const knowledgeContext = relevantKnowledge
      .map((k) => `${k.category}: ${k.content}`)
      .join("\n\n");

    // Convert base64 image to bytes
    const imageData = image.split(",")[1];

    // Create parts array with image and text
    const parts: Part[] = [
      {
        inlineData: {
          data: imageData,
          mimeType: "image/png",
        },
      },
      {
        text: `Using the following trading knowledge as context:

${knowledgeContext}

${prompt}

Provide a concise analysis focusing on:
1. Key patterns and signals
2. Risk assessment
3. Direct answers to user questions
4. Clear actionable recommendations

${type === "OPPORTUNITY" ?
`Format response as JSON:
{
  "technicalScore": <0-100>,
  "marketContextScore": <0-100>,
  "riskScore": <0-100>,
  "overallScore": <weighted average>,
  "confidence": <0-100>,
  "timeframeRecommendations": {
    "shouldCheckOther": <boolean>,
    "suggestedTimeframes": [<timeframes>],
    "reason": "<brief explanation>"
  },
  "explanation": "<concise analysis>"
}` :
`Format response as JSON:
{
  "currentPosition": {
    "status": "<PROFIT|LOSS|BREAKEVEN>",
    "riskLevel": "<LOW|MEDIUM|HIGH>",
    "suggestedAction": "<HOLD|EXIT|PARTIAL_EXIT|ADD>"
  },
  "psychologyCheck": {
    "emotionalState": "<state>",
    "biasWarnings": ["<warnings>"],
    "recommendations": ["<actions>"]
  }
}`}`,
      },
    ];

    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(parts),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Analysis timeout")), 8000)
      ),
    ]) as GenerateContentResult;

    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsedResponse = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Failed to parse JSON response", e);
      parsedResponse = type === "OPPORTUNITY"
        ? {
            technicalScore: 0,
            marketContextScore: 0,
            riskScore: 0,
            overallScore: 0,
            confidence: 0,
            explanation: "Analysis parsing failed. Please try again.",
            timeframeRecommendations: {
              shouldCheckOther: false,
              suggestedTimeframes: [],
              reason: "Analysis failed",
            },
          }
        : {
            currentPosition: {
              status: "BREAKEVEN",
              riskLevel: "MEDIUM",
              suggestedAction: "HOLD",
            },
            psychologyCheck: {
              emotionalState: "Unable to analyze",
              biasWarnings: ["Analysis failed"],
              recommendations: ["Please try again"],
            },
          };
    }

    // Record feedback, create response object, and deduct credits
    const [_, analysisResponse] = await Promise.all([
      Promise.all([
        ragFeedbackService.recordFeedback({
          userId: user.id!,
          queryText: prompt,
          selectedKnowledge: relevantKnowledge.map((k) => k.id),
          isRelevant: true,
        }),
        // Deduct credits and create transaction record
        prisma.$transaction([
          prisma.aICredit.update({
            where: {
              userId: user.id,
            },
            data: {
              balance: {
                decrement: ANALYSIS_CREDIT_COST,
              },
            },
          }),
          prisma.aICreditTransaction.create({
            data: {
              creditId: creditInfo.id,
              amount: -ANALYSIS_CREDIT_COST,
              type: "USAGE",
              status: "COMPLETED",
              metadata: {
                feature: "chart_analysis",
                analysisType: type,
              },
            },
          }),
        ]),
      ]),
      Promise.resolve({
        type,
        ...(type === "OPPORTUNITY" ? { score: parsedResponse } : { guidance: parsedResponse }),
        analysis: text,
        context: relevantKnowledge.map((k) => ({
          id: k.id,
          category: k.category,
          similarity: k.similarity,
        })),
        timestamp: new Date().toISOString(),
      } as AnalysisResponse),
    ]);

    // Store analysis in session if provided
    if (sessionId) {
      await prisma.analysis.create({
        data: {
          sessionId,
          type,
          prompt,
          image,
          result: JSON.parse(JSON.stringify(analysisResponse)) as Prisma.JsonObject,
        },
      });

      // Update session timestamp
      await prisma.analysisSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      ...analysisResponse,
      credits: {
        cost: ANALYSIS_CREDIT_COST,
        remaining: creditInfo.balance - ANALYSIS_CREDIT_COST,
      },
    });
  } catch (error) {
    console.error("[ANALYZE_ERROR]", error);
    if (error.message === "Analysis timeout") {
      return new NextResponse("Analysis timed out. Please try again.", { status: 504 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
