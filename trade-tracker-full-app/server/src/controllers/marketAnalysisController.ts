import { Request, Response } from "express";
import { marketAnalysisService } from "../services/marketAnalysis";
import { z } from "zod";

// Request validation schemas
const newsAnalysisSchema = z.object({
  asset: z.string(),
  timeframe: z.string().optional(),
});

export const marketAnalysisController = {
  async analyzeNewsForAsset(req: Request, res: Response) {
    try {
      const { asset, timeframe } = newsAnalysisSchema.parse(req.body);
      const userId = req.user.id;

      // Fetch news
      const newsItems = await marketAnalysisService.fetchNews(asset, timeframe);

      // Analyze sentiment
      const sentiment = await marketAnalysisService.analyzeSentiment(userId, newsItems);

      // Assess market impact
      const marketImpact = await marketAnalysisService.assessMarketImpact(userId, asset, sentiment);

      res.json({
        success: true,
        data: {
          newsCount: newsItems.length,
          sentiment,
          marketImpact,
          news: newsItems.map((item) => ({
            title: item.title,
            source: item.source,
            publishedAt: item.publishedAt,
            url: item.url,
          })),
        },
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "An unknown error occurred",
      });
    }
  },
};
