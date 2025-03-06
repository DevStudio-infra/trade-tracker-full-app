import { PrismaClient } from "@prisma/client";
import { creditsService, CreditOperation } from "./credits";
import axios from "axios";

const prisma = new PrismaClient();

interface NewsItem {
  title: string;
  content: string;
  source: string;
  publishedAt: Date;
  url: string;
}

interface SentimentScore {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to infinity (strength of emotion)
  confidence: number; // 0 to 1
}

interface MarketImpact {
  asset: string;
  impactScore: number; // -1 to 1
  confidence: number; // 0 to 1
  timeframe: string; // "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM"
}

export class MarketAnalysisService {
  private static instance: MarketAnalysisService;
  private newsApiKey: string;
  private aiApiKey: string;

  private constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY || "";
    this.aiApiKey = process.env.GEMINI_API_KEY || "";
  }

  public static getInstance(): MarketAnalysisService {
    if (!MarketAnalysisService.instance) {
      MarketAnalysisService.instance = new MarketAnalysisService();
    }
    return MarketAnalysisService.instance;
  }

  /**
   * Fetch relevant news for a specific asset or market
   */
  public async fetchNews(asset: string, timeframe: string = "1d"): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: asset,
          from: this.getTimeframeDate(timeframe),
          sortBy: "relevancy",
          language: "en",
          apiKey: this.newsApiKey,
        },
      });

      return response.data.articles.map((article: any) => ({
        title: article.title,
        content: article.description,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        url: article.url,
      }));
    } catch (error) {
      console.error("Error fetching news:", error);
      throw new Error("Failed to fetch news data");
    }
  }

  /**
   * Analyze sentiment of news items
   */
  public async analyzeSentiment(userId: string, newsItems: NewsItem[]): Promise<SentimentScore> {
    // Check if user has enough credits
    const hasCredits = await creditsService.hasEnoughCredits(userId, CreditOperation.SIGNAL_DETECTION);
    if (!hasCredits) {
      throw new Error("Insufficient credits for sentiment analysis");
    }

    try {
      // Combine news items into a single text for analysis
      const combinedText = newsItems.map((item) => `${item.title}. ${item.content}`).join(" ");

      // Use Gemini API for sentiment analysis
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Analyze the sentiment of the following news text and return a JSON object with score (-1 to 1), magnitude (0 to infinity), and confidence (0 to 1): ${combinedText}`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.aiApiKey}`,
          },
        }
      );

      // Deduct credits for the operation
      await creditsService.deductCredits(userId, CreditOperation.SIGNAL_DETECTION, {
        operation: "NEWS_SENTIMENT_ANALYSIS",
        newsCount: newsItems.length,
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      throw new Error("Failed to analyze news sentiment");
    }
  }

  /**
   * Assess market impact based on news sentiment
   */
  public async assessMarketImpact(userId: string, asset: string, sentiment: SentimentScore): Promise<MarketImpact> {
    try {
      // Use Gemini API for market impact assessment
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Given the sentiment score of ${sentiment.score}, magnitude of ${sentiment.magnitude}, and confidence of ${sentiment.confidence} for ${asset}, assess the potential market impact. Return a JSON object with impactScore (-1 to 1), confidence (0 to 1), and timeframe (SHORT_TERM, MEDIUM_TERM, or LONG_TERM).`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.aiApiKey}`,
          },
        }
      );

      return {
        asset,
        ...JSON.parse(response.data.candidates[0].content.parts[0].text),
      };
    } catch (error) {
      console.error("Error assessing market impact:", error);
      throw new Error("Failed to assess market impact");
    }
  }

  private getTimeframeDate(timeframe: string): string {
    const date = new Date();
    switch (timeframe) {
      case "1h":
        date.setHours(date.getHours() - 1);
        break;
      case "4h":
        date.setHours(date.getHours() - 4);
        break;
      case "12h":
        date.setHours(date.getHours() - 12);
        break;
      case "1d":
        date.setDate(date.getDate() - 1);
        break;
      case "1w":
        date.setDate(date.getDate() - 7);
        break;
      default:
        date.setDate(date.getDate() - 1);
    }
    return date.toISOString();
  }
}

export const marketAnalysisService = MarketAnalysisService.getInstance();
