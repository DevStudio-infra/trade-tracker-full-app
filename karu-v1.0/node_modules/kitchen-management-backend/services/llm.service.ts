/**
 * LLM Service for Oracle functionality using Google Gemini
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

interface OracleContext {
  menus: any[];
  recipes: any[];
  notes: any[];
  ingredients: any[];
}

interface SuggestionInput {
  type: "menu" | "shopping_list" | "prep_list";
  context: OracleContext;
  prompt: string;
  recipes?: any[];
  servings?: number;
}

export class LLMService {
  private genAI: GoogleGenerativeAI | null = null;
  private hasApiKey: boolean = false;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.hasApiKey = true;
      console.log("✅ Gemini AI initialized successfully");
    } else {
      console.log("⚠️  GOOGLE_AI_API_KEY not found - using mock responses for demo");
      this.hasApiKey = false;
    }
  }

  /**
   * Ask Oracle questions about the kitchen/menu
   */
  async askOracle(question: string, context: OracleContext, history: any[] = []): Promise<{ answer: string; tokens: number }> {
    if (!this.hasApiKey) {
      // Return mock response for demo
      return this.getMockOracleResponse(question, context);
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextText = this.buildContextPrompt(context);
      const historyText = history.length > 0 ? "\n\nConversation History:\n" + history.map((msg) => `${msg.role}: ${msg.content}`).join("\n") : "";

      const prompt = `You are Oracle, a knowledgeable kitchen assistant for a restaurant. You help staff with questions about ingredients, cooking techniques, dietary information, and menu items.

Context about this restaurant:
${contextText}
${historyText}

User Question: ${question}

Please provide a helpful, accurate response based on the restaurant's context. If you don't have specific information, provide general culinary guidance.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        answer: text,
        tokens: this.estimateTokens(prompt + text),
      };
    } catch (error) {
      console.error("LLM Oracle error:", error);
      return this.getMockOracleResponse(question, context);
    }
  }

  /**
   * Generate suggestions for menus, shopping lists, or prep lists
   */
  async generateSuggestion(input: SuggestionInput): Promise<{ suggestion: string; tokens: number }> {
    if (!this.hasApiKey) {
      return this.getMockSuggestion(input);
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextText = this.buildContextPrompt(input.context);
      const recipesText = input.recipes ? "\n\nAvailable Recipes:\n" + input.recipes.map((r) => `- ${r.name}: ${r.description}`).join("\n") : "";

      let typePrompt = "";
      switch (input.type) {
        case "menu":
          typePrompt = "Create a menu suggestion based on the available recipes and the user's request.";
          break;
        case "shopping_list":
          typePrompt = "Generate a shopping list with quantities needed for the requested items.";
          break;
        case "prep_list":
          typePrompt = "Create a preparation schedule with tasks and estimated times for kitchen staff.";
          break;
      }

      const servingsText = input.servings ? `\nNumber of servings needed: ${input.servings}` : "";

      const prompt = `You are Oracle, a restaurant management assistant. ${typePrompt}

Restaurant Context:
${contextText}
${recipesText}
${servingsText}

User Request: ${input.prompt}

Please provide a detailed ${input.type.replace("_", " ")} that addresses the user's request.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        suggestion: text,
        tokens: this.estimateTokens(prompt + text),
      };
    } catch (error) {
      console.error("LLM Suggestion error:", error);
      return this.getMockSuggestion(input);
    }
  }

  /**
   * Build context prompt from restaurant data
   */
  private buildContextPrompt(context: OracleContext): string {
    const menuText = context.menus.length > 0 ? "Menus:\n" + context.menus.map((m) => `- ${m.name}: ${m.description || "No description"}`).join("\n") : "No menus available.";

    const recipeText =
      context.recipes.length > 0 ? "Recipes:\n" + context.recipes.map((r) => `- ${r.name}: ${r.description || "No description"}`).join("\n") : "No recipes available.";

    return `${menuText}\n\n${recipeText}`;
  }

  /**
   * Mock Oracle response for demo purposes
   */
  private getMockOracleResponse(question: string, context: OracleContext): { answer: string; tokens: number } {
    const responses = [
      `Based on your current menu items, I can help you with that! For ingredient substitutions, I recommend checking what you have available in your kitchen first.`,
      `That's a great question about dietary restrictions. From your recipes, I can suggest several alternatives that would work well.`,
      `For cooking techniques, I'd recommend following the methods outlined in your recipe collection. Would you like me to suggest some specific approaches?`,
      `Looking at your available ingredients and recipes, here are some recommendations that would work well for your kitchen setup.`,
      `Based on your menu context, I can provide guidance on that topic. What specific aspect would you like me to focus on?`,
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      answer: `🤖 **Demo Mode Response** (Connect Google AI API for full functionality)\n\n${randomResponse}\n\n*This is a simulated response. In production, Oracle would provide context-aware answers based on your specific menu items, recipes, and ingredients using Google's Gemini AI.*`,
      tokens: 150,
    };
  }

  /**
   * Mock suggestion response for demo purposes
   */
  private getMockSuggestion(input: SuggestionInput): { suggestion: string; tokens: number } {
    const suggestions = {
      menu: `🍽️ **Demo Menu Suggestion**\n\n**Appetizers:**\n• Seasonal soup of the day\n• Mixed green salad with house dressing\n\n**Main Courses:**\n• Grilled chicken with herbs\n• Pasta with seasonal vegetables\n• Chef's special of the day\n\n**Desserts:**\n• Seasonal fruit dessert\n• House-made ice cream\n\n*Based on your request: "${input.prompt}"*`,
      shopping_list: `🛒 **Demo Shopping List**\n\n**Proteins:**\n• Chicken breast - 5 lbs\n• Fresh fish - 3 lbs\n\n**Vegetables:**\n• Mixed greens - 2 bags\n• Onions - 3 lbs\n• Tomatoes - 2 lbs\n\n**Pantry Items:**\n• Olive oil - 1 bottle\n• Fresh herbs - assorted\n• Seasonings as needed\n\n*Generated for: "${input.prompt}"*`,
      prep_list: `📋 **Demo Prep List**\n\n**Morning Prep (2 hours):**\n• Wash and prep vegetables\n• Prepare soup base\n• Mix salad dressings\n\n**Afternoon Prep (1.5 hours):**\n• Marinate proteins\n• Prepare dessert components\n• Set up stations\n\n**Evening Prep (30 minutes):**\n• Final plating setup\n• Check inventory\n\n*Created for: "${input.prompt}"*`,
    };

    return {
      suggestion: suggestions[input.type] + `\n\n*🤖 This is a demo response. Connect Google AI API for personalized suggestions based on your actual recipes and inventory.*`,
      tokens: 200,
    };
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
