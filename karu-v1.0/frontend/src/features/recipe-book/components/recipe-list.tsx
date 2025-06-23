"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { BookOpen, FileSearch } from "lucide-react";

export function RecipeList() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await trpc.recipes.getAll.query();
        setRecipes(data || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setError("Failed to load recipes. Please try again later.");
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground">No recipes found. Add your first recipe to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="border rounded-lg overflow-hidden bg-card">
          <div className="h-32 bg-muted flex items-center justify-center">
            <FileSearch className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <div className="p-3">
            <h3 className="font-medium">{recipe.name}</h3>
            <p className="text-sm text-muted-foreground">
              {recipe.prepTime && recipe.cookTime 
                ? `Prep: ${recipe.prepTime} min • Cook: ${recipe.cookTime} min` 
                : "No time information"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
