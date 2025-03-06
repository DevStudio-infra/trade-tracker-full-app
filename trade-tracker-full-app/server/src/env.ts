import { z } from "zod";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const envSchema = z.object({
  // Capital.com API Configuration
  CAPITAL_API_KEY: z.string().optional(),
  CAPITAL_DEMO_MODE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Add other environment variables as needed
});

export const env = envSchema.parse(process.env);
