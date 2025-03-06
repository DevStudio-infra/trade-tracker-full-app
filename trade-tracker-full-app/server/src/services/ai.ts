import { google } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";
import { z } from "zod";

// Schema for validating AI requests
const aiRequestSchema = z.object({
  prompt: z.string(),
  model: z.enum(["gemini-1.5-flash"]).default("gemini-1.5-flash"),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1000),
  imageUrl: z.string().optional(), // Optional image URL
});

export type AIRequest = z.infer<typeof aiRequestSchema>;

export class AIService {
  private static instance: AIService;
  private messages: CoreMessage[] = [];

  private constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateStreamingResponse(request: AIRequest): Promise<any> {
    try {
      // Validate request
      const validatedRequest = aiRequestSchema.parse(request);

      // Add user message
      this.messages.push({
        role: "user",
        content: validatedRequest.prompt,
      });

      // If there's an image URL, prepare image data
      let imageData: string | undefined;
      if (validatedRequest.imageUrl) {
        const imageResponse = await fetch(validatedRequest.imageUrl);
        const buffer = await imageResponse.arrayBuffer();
        imageData = Buffer.from(buffer).toString("base64");
      }

      // Generate stream
      const result = await streamText({
        model: google(validatedRequest.model),
        messages: this.messages,
        ...(imageData && {
          images: [
            {
              type: "image_url",
              url: `data:image/jpeg;base64,${imageData}`,
            },
          ],
        }),
        temperature: validatedRequest.temperature,
        maxTokens: validatedRequest.maxTokens,
      });

      // Add assistant message
      let fullResponse = "";
      for await (const delta of result.textStream) {
        fullResponse += delta;
      }
      this.messages.push({
        role: "assistant",
        content: fullResponse,
      });

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid request parameters: ${error.message}`);
      }
      throw error;
    }
  }

  public async generateJSONResponse(request: AIRequest): Promise<any> {
    try {
      // Validate request
      const validatedRequest = aiRequestSchema.parse(request);

      // Modify prompt to request JSON output
      const jsonPrompt = `${validatedRequest.prompt}\n\nRespond with valid JSON only.`;

      // Add user message
      this.messages.push({
        role: "user",
        content: jsonPrompt,
      });

      // If there's an image URL, prepare image data
      let imageData: string | undefined;
      if (validatedRequest.imageUrl) {
        const imageResponse = await fetch(validatedRequest.imageUrl);
        const buffer = await imageResponse.arrayBuffer();
        imageData = Buffer.from(buffer).toString("base64");
      }

      // Generate response
      const result = await streamText({
        model: google(validatedRequest.model),
        messages: this.messages,
        ...(imageData && {
          images: [
            {
              type: "image_url",
              url: `data:image/jpeg;base64,${imageData}`,
            },
          ],
        }),
        temperature: validatedRequest.temperature,
        maxTokens: validatedRequest.maxTokens,
      });

      // Collect full response
      let fullResponse = "";
      for await (const delta of result.textStream) {
        fullResponse += delta;
      }

      // Add assistant message
      this.messages.push({
        role: "assistant",
        content: fullResponse,
      });

      try {
        // Parse and return JSON
        return JSON.parse(fullResponse);
      } catch (e) {
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid request parameters: ${error.message}`);
      }
      throw error;
    }
  }
}
