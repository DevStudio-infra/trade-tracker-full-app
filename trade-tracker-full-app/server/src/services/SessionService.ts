import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type AnalysisSession = Prisma.AnalysisSessionGetPayload<{
  include: {
    analyses: true;
  };
}>;

type Analysis = Prisma.AnalysisGetPayload<{}>;

export class SessionService {
  async findById(sessionId: string, userId: string): Promise<AnalysisSession | null> {
    return prisma.analysisSession.findUnique({
      where: {
        id: sessionId,
        userId,
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
  }

  async updateSession(sessionId: string, userId: string, name: string): Promise<AnalysisSession> {
    return prisma.analysisSession.update({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        name,
      },
      include: {
        analyses: true,
      },
    });
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    await prisma.analysisSession.delete({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async listSessions(userId: string): Promise<AnalysisSession[]> {
    return prisma.analysisSession.findMany({
      where: {
        userId,
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
  }

  async createSession(userId: string, name: string): Promise<AnalysisSession> {
    return prisma.analysisSession.create({
      data: {
        userId,
        name,
      },
      include: {
        analyses: true,
      },
    });
  }

  async createAnalysis(sessionId: string, type: string, prompt: string, image: string, result: Prisma.JsonObject): Promise<Analysis> {
    const [analysis] = await prisma.$transaction([
      prisma.analysis.create({
        data: {
          sessionId,
          type,
          prompt,
          image,
          result,
        },
      }),
      prisma.analysisSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return analysis;
  }
}

export const sessionService = new SessionService();
