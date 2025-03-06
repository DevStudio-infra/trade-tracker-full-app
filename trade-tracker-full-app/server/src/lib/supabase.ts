import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.DATABASE_URL?.split("@")[1].split(":")[0] || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

export const supabase = createClient(`https://${supabaseUrl}`, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Vector search functions
export async function similaritySearch(query_embedding: number[], match_count: number = 5) {
  const { data, error } = await supabase.rpc("match_trading_strategies", {
    query_embedding,
    match_threshold: 0.7, // Similarity threshold
    match_count,
  });

  if (error) throw error;
  return data;
}

// Function to insert a new strategy with its embedding
export async function insertStrategy(name: string, description: string, rules: string, embedding: number[], metadata: Record<string, any> = {}) {
  const { data, error } = await supabase.from("trading_strategies").insert([
    {
      name,
      description,
      rules,
      embedding,
      metadata,
    },
  ]);

  if (error) throw error;
  return data;
}

// Function to update strategy metadata
export async function updateStrategyMetadata(id: string, metadata: Record<string, any>) {
  const { data, error } = await supabase.from("trading_strategies").update({ metadata }).eq("id", id);

  if (error) throw error;
  return data;
}
