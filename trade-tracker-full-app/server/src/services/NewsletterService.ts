import { PrismaClient, NewsletterSubscriber } from "@prisma/client";

const prisma = new PrismaClient();

export class NewsletterService {
  async findSubscriber(email: string): Promise<NewsletterSubscriber | null> {
    return prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
  }

  async createSubscriber(email: string): Promise<NewsletterSubscriber> {
    return prisma.newsletterSubscriber.create({
      data: { email },
    });
  }

  async listSubscribers(): Promise<NewsletterSubscriber[]> {
    return prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteSubscriber(email: string): Promise<void> {
    await prisma.newsletterSubscriber.delete({
      where: { email },
    });
  }
}

export const newsletterService = new NewsletterService();
