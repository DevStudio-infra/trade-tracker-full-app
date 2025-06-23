"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Clock, Users, ChefHat } from "lucide-react";

// Mock recipe data for demo
const mockRecipes = [
  {
    id: 1,
    name: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    isPublic: true,
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Fresh basil", "Olive oil"],
    instructions: "1. Preheat oven to 475°F\n2. Roll out pizza dough\n3. Spread tomato sauce\n4. Add mozzarella and basil\n5. Bake for 12-15 minutes",
  },
  {
    id: 2,
    name: "Beef Wellington",
    description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
    prepTime: 45,
    cookTime: 25,
    servings: 6,
    difficulty: "Hard",
    isPublic: false,
    ingredients: ["Beef tenderloin", "Puff pastry", "Mushrooms", "Prosciutto", "Egg wash"],
    instructions: "1. Sear beef on all sides\n2. Prepare mushroom duxelles\n3. Wrap in prosciutto and pastry\n4. Bake until golden",
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with classic Caesar dressing and croutons",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "Easy",
    isPublic: true,
    ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing", "Anchovies"],
    instructions: "1. Wash and chop romaine\n2. Make dressing\n3. Toss with lettuce\n4. Top with parmesan and croutons",
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState(mockRecipes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredRecipes = recipes.filter(
    (recipe) => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) || recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRecipe = (recipeData: any) => {
    const newRecipe = {
      id: Date.now(),
      ...recipeData,
      difficulty: recipeData.difficulty || "Easy",
      isPublic: recipeData.isPublic || false,
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setShowCreateForm(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-orange-600" />
          Digital Recipe Book
        </h1>
        <p className="text-muted-foreground mt-2">Manage your restaurant&apos;s recipes, ingredients, and cooking instructions.</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search recipes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm ? "No recipes found" : "No recipes yet"}</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm ? `No recipes match "${searchTerm}". Try adjusting your search.` : "Start building your digital recipe book by adding your first recipe."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRecipe(recipe)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-1">{recipe.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prepTime + recipe.cookTime}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  <Badge variant={recipe.difficulty === "Easy" ? "default" : recipe.difficulty === "Medium" ? "secondary" : "destructive"}>{recipe.difficulty}</Badge>
                </div>

                {recipe.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    <ChefHat className="h-3 w-3 mr-1" />
                    Public Recipe
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedRecipe.name}
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{selectedRecipe.description}</p>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Prep Time:</span> {selectedRecipe.prepTime}min
                </div>
                <div>
                  <span className="font-medium">Cook Time:</span> {selectedRecipe.cookTime}min
                </div>
                <div>
                  <span className="font-medium">Servings:</span> {selectedRecipe.servings}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Instructions:</h4>
                <div className="text-sm whitespace-pre-line">{selectedRecipe.instructions}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Recipe Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create New Recipe
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateRecipe({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    prepTime: parseInt(formData.get("prepTime") as string) || 0,
                    cookTime: parseInt(formData.get("cookTime") as string) || 0,
                    servings: parseInt(formData.get("servings") as string) || 1,
                    difficulty: formData.get("difficulty"),
                    ingredients: (formData.get("ingredients") as string).split("\n").filter(Boolean),
                    instructions: formData.get("instructions"),
                    isPublic: formData.get("isPublic") === "on",
                  });
                }}
                className="space-y-4">
                <Input name="name" placeholder="Recipe name" required />
                <Input name="description" placeholder="Short description" />
                <div className="grid grid-cols-3 gap-2">
                  <Input name="prepTime" type="number" placeholder="Prep (min)" />
                  <Input name="cookTime" type="number" placeholder="Cook (min)" />
                  <Input name="servings" type="number" placeholder="Servings" />
                </div>
                <select name="difficulty" className="w-full p-2 border rounded">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <textarea name="ingredients" placeholder="Ingredients (one per line)" className="w-full p-2 border rounded h-20 resize-none" />
                <textarea name="instructions" placeholder="Cooking instructions" className="w-full p-2 border rounded h-24 resize-none" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPublic" />
                  <span className="text-sm">Make this recipe public</span>
                </label>
                <Button type="submit" className="w-full">
                  Create Recipe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
