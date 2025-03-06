import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Schema for validating trading pattern responses
const TradingPatternSchema = z.object({
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  metadata: z.object({
    success_rate: z.number().optional(),
    timeframes: z.array(z.string()).optional(),
    volume_importance: z.string().optional(),
    risk_ratio: z.number().optional(),
    confirmation_indicators: z.array(z.string()).optional(),
    failure_points: z.array(z.string()).optional(),
    target_calculation: z.string().optional(),
    stop_loss_rules: z.array(z.string()).optional(),
  }).optional(),
});

export type TradingPattern = z.infer<typeof TradingPatternSchema>;

export class LLMResponseHandler {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-pro") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  /**
   * Validates and formats JSON response from LLM
   */
  private async validateResponse(jsonString: string): Promise<TradingPattern> {
    try {
      // First, ensure we have valid JSON
      const parsed = JSON.parse(jsonString);

      // Then validate against our schema
      const validated = TradingPatternSchema.parse(parsed);

      return validated;
    } catch (error) {
      // If validation fails, try to fix common JSON issues
      const cleanedJson = await this.attemptJsonRepair(jsonString);
      const parsed = JSON.parse(cleanedJson);
      return TradingPatternSchema.parse(parsed);
    }
  }

  /**
   * Attempts to repair common JSON formatting issues
   */
  private async attemptJsonRepair(jsonString: string): Promise<string> {
    // Remove any markdown code block markers
    let cleaned = jsonString.replace(/```json\n?|\n?```/g, "");

    // Fix common quote issues
    cleaned = cleaned.replace(/[''](?=\w)/g, '"')
      .replace(/(?<=\w)[''](?=:)/g, '"')
      .replace(/(?<=:)\s*[''](?=\w)/g, ' "')
      .replace(/(?<=\w)[''](?=,|\s*}|\s*\])/g, '"');

    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

    return cleaned;
  }

  /**
   * Gets a complete response with validation
   */
  async getValidatedResponse(prompt: string): Promise<TradingPattern> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return this.validateResponse(text);
  }

  /**
   * Formats a prompt to encourage valid JSON responses
   */
  static formatPrompt(basePrompt: string): string {
    return `
Please provide your response in valid JSON format following this schema:
{
  "content": "string",
  "category": "string",
  "tags": ["string"],
  "metadata": {
    "success_rate": number,
    "timeframes": ["string"],
    "volume_importance": "string",
    "risk_ratio": number,
    "confirmation_indicators": ["string"],
    "failure_points": ["string"],
    "target_calculation": "string",
    "stop_loss_rules": ["string"]
  }
}

${basePrompt}

Remember to:
1. Use double quotes for strings
2. Avoid trailing commas
3. Ensure all JSON is properly nested and closed
4. Only include valid JSON in your response
`;
  }
}

// Example usage:
// const handler = new LLMResponseHandler(process.env.GOOGLE_API_KEY || "");
// const prompt = LLMResponseHandler.formatPrompt("Describe the Bullish Engulfing pattern");
// const response = await handler.getValidatedResponse(prompt);
