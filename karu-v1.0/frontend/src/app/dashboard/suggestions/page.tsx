"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Lightbulb, Send, ShoppingCart, Clock, Users } from "lucide-react";

const mockSuggestions = [
  {
    id: 1,
    type: "menu",
    title: "Winter Comfort Menu",
    content: "• Hearty Beef Stew with root vegetables\n• Butternut Squash Soup with sage\n• Roasted Chicken with winter herbs\n• Apple Cinnamon Crumble",
    createdAt: "2024-01-15",
    tags: ["seasonal", "comfort food"],
  },
  {
    id: 2,
    type: "shopping_list",
    title: "Weekend Prep Shopping List",
    content: "• 5 lbs ground beef\n• 20 lbs potatoes\n• 3 lbs carrots\n• 2 lbs onions\n• Fresh herbs (thyme, rosemary)\n• Heavy cream (2 quarts)",
    createdAt: "2024-01-14",
    tags: ["prep", "weekend"],
  },
  {
    id: 3,
    type: "prep_list",
    title: "Monday Prep Tasks",
    content: "• Prep vegetables for stews (2 hours)\n• Make stock from bones (4 hours)\n• Prepare herb mixes\n• Portion proteins for the week",
    createdAt: "2024-01-13",
    tags: ["prep", "weekly"],
  },
];

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<"menu" | "shopping_list" | "prep_list">("menu");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSuggestion = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newSuggestion = {
        id: Date.now(),
        type: selectedType,
        title: `${selectedType.replace("_", " ")} suggestion`,
        content: `AI-generated ${selectedType} based on: "${prompt}"\n\n• Sample item 1\n• Sample item 2\n• Sample item 3`,
        createdAt: new Date().toISOString().split("T")[0],
        tags: ["ai-generated", "custom"],
      };

      setSuggestions((prev) => [newSuggestion, ...prev]);
      setPrompt("");
      setIsGenerating(false);
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "menu":
        return <ChefHat className="h-4 w-4" />;
      case "shopping_list":
        return <ShoppingCart className="h-4 w-4" />;
      case "prep_list":
        return <Clock className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "menu":
        return "bg-blue-100 text-blue-800";
      case "shopping_list":
        return "bg-green-100 text-green-800";
      case "prep_list":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-orange-600" />
          Menu & Dish Suggestions
        </h1>
        <p className="text-muted-foreground mt-2">Get AI-powered menu suggestions, shopping lists, and prep schedules tailored to your restaurant.</p>
      </div>

      {/* Suggestion Generator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generate New Suggestion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={selectedType === "menu" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("menu")}>
              <ChefHat className="h-4 w-4 mr-1" />
              Menu
            </Button>
            <Button variant={selectedType === "shopping_list" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("shopping_list")}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Shopping List
            </Button>
            <Button variant={selectedType === "prep_list" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("prep_list")}>
              <Clock className="h-4 w-4 mr-1" />
              Prep List
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={`Describe what you need for your ${selectedType.replace("_", " ")}...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleGenerateSuggestion();
                }
              }}
            />
            <Button onClick={handleGenerateSuggestion} disabled={!prompt.trim() || isGenerating}>
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Examples:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Menu: "Create a healthy lunch menu for office workers"</li>
              <li>Shopping: "What ingredients do I need for 50 pasta dishes?"</li>
              <li>Prep: "Help me plan prep tasks for a busy weekend"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Suggestions</h2>

        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suggestion.type)}
                  {suggestion.title}
                </div>
                <Badge className={getTypeColor(suggestion.type)}>{suggestion.type.replace("_", " ")}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm mb-4">{suggestion.content}</div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex gap-2">
                  {suggestion.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <span>Generated on {suggestion.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No suggestions yet</h3>
              <p className="text-gray-500 text-center mb-4">Generate your first AI-powered suggestion using the form above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
