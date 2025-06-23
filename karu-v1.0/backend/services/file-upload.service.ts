import multer from "multer";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ExtractedRecipe {
  name: string;
  description?: string;
  instructions: string;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

export class FileUploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/csv", "image/jpeg", "image/png", "image/webp"];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"));
        }
      },
    });
  }

  async saveFile(file: UploadedFile, organizationId: string): Promise<string> {
    const filename = `${organizationId}_${Date.now()}_${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);
    return filepath;
  }

  async processImage(file: UploadedFile, organizationId: string): Promise<string> {
    const filename = `${organizationId}_${Date.now()}_processed.webp`;
    const filepath = path.join(this.uploadDir, filename);

    await sharp(file.buffer).resize(800, 600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(filepath);

    return filepath;
  }

  async extractTextFromPDF(file: UploadedFile): Promise<string> {
    try {
      const result = await pdfParse(file.buffer);
      return result.text;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  async extractTextFromDOCX(file: UploadedFile): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } catch (error) {
      console.error("Error extracting DOCX text:", error);
      throw new Error("Failed to extract text from DOCX");
    }
  }

  parseCSVRecipes(csvText: string): ExtractedRecipe[] {
    const lines = csvText.split("\n");
    const recipes: ExtractedRecipe[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseCSVLine(line);
      if (columns.length >= 3) {
        const recipe: ExtractedRecipe = {
          name: columns[0] || "Untitled Recipe",
          description: columns[1] || "",
          instructions: columns[2] || "",
          ingredients: this.parseIngredients(columns[3] || ""),
          prepTime: this.parseTime(columns[4]),
          cookTime: this.parseTime(columns[5]),
          servings: parseInt(columns[6]) || undefined,
        };
        recipes.push(recipe);
      }
    }

    return recipes;
  }

  async extractRecipeFromText(text: string): Promise<ExtractedRecipe> {
    // Basic recipe extraction logic
    // This could be enhanced with NLP or LLM processing

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Try to identify recipe name (usually first line or after "Recipe:" etc.)
    let name = "Extracted Recipe";
    const namePatterns = [/^recipe:?\s*(.+)/i, /^title:?\s*(.+)/i, /^(.+recipe.*)$/i];

    for (const line of lines.slice(0, 5)) {
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match) {
          name = match[1].trim();
          break;
        }
      }
      if (name !== "Extracted Recipe") break;
    }

    // Extract ingredients section
    const ingredients = this.extractIngredientsFromText(text);

    // Extract instructions (everything after ingredients or instructions keyword)
    const instructionsMatch = text.match(/(?:instructions|method|directions):?\s*([\s\S]+)/i);
    const instructions = instructionsMatch ? instructionsMatch[1].trim() : text;

    // Extract times
    const prepTimeMatch = text.match(/prep(?:\s+time)?:?\s*(\d+)\s*(?:min|minutes)/i);
    const cookTimeMatch = text.match(/cook(?:\s+time)?:?\s*(\d+)\s*(?:min|minutes)/i);
    const servingsMatch = text.match(/(?:serves|servings?):?\s*(\d+)/i);

    return {
      name,
      instructions,
      ingredients,
      prepTime: prepTimeMatch ? parseInt(prepTimeMatch[1]) : undefined,
      cookTime: cookTimeMatch ? parseInt(cookTimeMatch[1]) : undefined,
      servings: servingsMatch ? parseInt(servingsMatch[1]) : undefined,
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private parseIngredients(ingredientText: string): Array<{ name: string; quantity?: number; unit?: string }> {
    if (!ingredientText) return [];

    const ingredients = ingredientText.split(/[,;]/).map((ing) => ing.trim());

    return ingredients.map((ingredient) => {
      // Try to extract quantity and unit
      const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s+(.+)$/);

      if (match) {
        return {
          quantity: parseFloat(match[1]),
          unit: match[2] || undefined,
          name: match[3],
        };
      }

      return { name: ingredient };
    });
  }

  private extractIngredientsFromText(text: string): Array<{ name: string; quantity?: number; unit?: string }> {
    const ingredientsMatch = text.match(/(?:ingredients?):?\s*([\s\S]+?)(?:\n\s*\n|(?:instructions|method|directions))/i);

    if (!ingredientsMatch) {
      return [];
    }

    const ingredientLines = ingredientsMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^[A-Z\s]+$/)); // Skip section headers

    return ingredientLines.map((line) => {
      // Remove bullet points, numbers, etc.
      const cleaned = line.replace(/^[-•*\d.)\s]+/, "").trim();

      // Try to extract quantity and unit
      const match = cleaned.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]*)\s+(.+)$/);

      if (match) {
        let quantity = parseFloat(match[1]);

        // Handle fractions
        if (match[1].includes("/")) {
          const [num, den] = match[1].split("/");
          quantity = parseFloat(num) / parseFloat(den);
        }

        return {
          quantity,
          unit: match[2] || undefined,
          name: match[3],
        };
      }

      return { name: cleaned };
    });
  }

  private parseTime(timeStr: string): number | undefined {
    if (!timeStr) return undefined;

    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error("Error deleting file:", error);
      // Don't throw error for file deletion failures
    }
  }
}
