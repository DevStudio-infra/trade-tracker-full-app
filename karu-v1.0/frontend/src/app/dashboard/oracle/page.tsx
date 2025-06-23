"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Brain, Send, Loader2 } from "lucide-react";

export default function OraclePage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!currentQuestion.trim()) return;

    const userMessage = { role: "user" as const, content: currentQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    // Simulate Oracle response (replace with actual tRPC call later)
    setTimeout(() => {
      const responses = [
        "I can help you with ingredient substitutions. What specific ingredient are you looking to replace?",
        "For dietary restrictions, I can suggest alternatives based on your menu items. What type of diet are you accommodating?",
        "Based on your current menu, I recommend checking if you have enough stock for the weekend rush.",
        "That ingredient pairs well with seasonal vegetables. Would you like some specific recipe suggestions?",
        "I can help you calculate portion sizes. How many guests are you expecting?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8 text-orange-600" />
          Oracle - Kitchen Assistant
        </h1>
        <p className="text-muted-foreground mt-2">Ask questions about menu items, ingredients, substitutions, dietary information, and more.</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with Oracle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-orange-600" />
                  <h3 className="text-lg font-medium mb-2">Oracle is ready to help!</h3>
                  <p className="text-sm max-w-md">Ask about ingredients, substitutions, dietary info, cooking techniques, or anything related to your kitchen operations.</p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : ""}`}>
                  <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-orange-600 text-white ml-auto" : "bg-muted"}`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{message.role === "user" ? "You" : "Oracle"}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="max-w-[80%]">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Oracle is thinking...</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">Oracle</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask Oracle about ingredients, substitutions, dietary info..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!currentQuestion.trim() || isLoading} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
