"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Clock, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnalysisForm } from "@/components/copilot/analysis-form";
import { CopilotWalkthrough } from "@/components/copilot/copilot-walkthrough";
import { SessionHistory } from "@/components/copilot/session-history";
import { SessionManager } from "@/components/copilot/session-manager";
import {
  WindowCapture,
  WindowCaptureRef,
} from "@/components/copilot/window-capture";
import { DashboardHeader } from "@/components/dashboard/header";

interface TradeScore {
  technicalScore: number;
  marketContextScore: number;
  riskScore: number;
  overallScore: number;
  confidence: number;
  explanation: string;
}

interface TradeGuidance {
  currentPosition: {
    status: "PROFIT" | "LOSS" | "BREAKEVEN";
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    suggestedAction: "HOLD" | "EXIT" | "PARTIAL_EXIT" | "ADD";
  };
  psychologyCheck: {
    emotionalState: string;
    biasWarnings: string[];
    recommendations: string[];
  };
}

interface AnalysisResult {
  type: "OPPORTUNITY" | "GUIDANCE";
  score?: TradeScore;
  guidance?: TradeGuidance;
  analysis: string;
  context: Array<{ id: string; category: string; similarity: number }>;
  timestamp: string;
}

function CircularScore({
  value,
  label,
  explanation,
}: {
  value: number;
  label: string;
  explanation: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500 border-green-500 bg-green-50/50";
    if (score >= 80) return "text-green-400 border-green-400 bg-green-50/30";
    if (score >= 70) return "text-yellow-500 border-yellow-500 bg-yellow-50/50";
    if (score >= 60) return "text-orange-400 border-orange-400 bg-orange-50/30";
    return "text-red-500 border-red-500 bg-red-50/30";
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return "Excellent Opportunity";
    if (score >= 80) return "Strong Opportunity";
    if (score >= 70) return "Decent Opportunity";
    if (score >= 60) return "Marginal Opportunity";
    return "Not Recommended";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                "relative flex h-32 w-32 items-center justify-center rounded-full border-[6px] transition-colors duration-300",
                getScoreColor(value),
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{value}</span>
                <span className="text-xs font-medium opacity-80">Score</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="max-w-xs text-sm">{explanation}</p>
              <p className="text-sm font-medium">
                Status:{" "}
                <span
                  className={cn(
                    "font-bold",
                    getScoreColor(value).split(" ")[0],
                  )}
                >
                  {getScoreText(value)}
                </span>
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function getRelativeTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimestampDisplay({ timestamp }: { timestamp: string }) {
  const [relativeTime, setRelativeTime] = useState(getRelativeTime(timestamp));

  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-3" />
            <span>{relativeTime}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Analyzed on {new Date(timestamp).toLocaleString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CopilotContent() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [lastPrompt, setLastPrompt] = useState<{
    text: string;
    type: "OPPORTUNITY" | "GUIDANCE";
  } | null>(null);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const windowCaptureRef = useRef<WindowCaptureRef>(null);

  const handleCapture = async (screenshot: string) => {
    setCapturedImage(screenshot);

    // If there's a last prompt and auto-analysis is enabled, automatically re-run the analysis
    if (lastPrompt && autoAnalysisEnabled) {
      await handleAnalysis(lastPrompt.text, lastPrompt.type);
    }
  };

  const handleAnalysis = async (
    prompt: string,
    type: "OPPORTUNITY" | "GUIDANCE",
  ) => {
    try {
      setIsAnalyzing(true);
      setLastPrompt({ text: prompt, type }); // Store the prompt for auto-analysis

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: capturedImage,
          prompt,
          type,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setLastAnalysisTime(new Date());
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisSelect = (analysis: any) => {
    setAnalysisResult(analysis.result);
    setLastAnalysisTime(new Date(analysis.createdAt));
  };

  const renderMetricWithTooltip = (
    title: string,
    value: number,
    explanation: string,
    progressClass?: string,
  ) => (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <Progress value={value} className={progressClass} />
          <p className="text-xs text-muted-foreground">{value}%</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderOpportunityScore = (score: TradeScore) => (
    <div className="space-y-6">
      <div className="flex justify-center">
        <CircularScore
          value={score.overallScore}
          label="Overall Score"
          explanation="Weighted average of all metrics. Scores above 80 indicate strong trading opportunities."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {renderMetricWithTooltip(
          "Technical",
          score.technicalScore,
          "Analysis of chart patterns, technical indicators, and price action strength",
        )}
        {renderMetricWithTooltip(
          "Market Context",
          score.marketContextScore,
          "Evaluation of market conditions, trend alignment, and overall market sentiment",
        )}
        {renderMetricWithTooltip(
          "Risk Assessment",
          score.riskScore,
          "Analysis of risk/reward ratio, stop loss placement, and potential drawdown",
        )}
      </div>
      <Card>
        <CardContent className="p-4">
          <p className="whitespace-pre-wrap text-sm">{score.explanation}</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderStatusWithTooltip = (
    label: string,
    value: string,
    colorClass: string,
    explanation: string,
  ) => (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{label}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="size-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{explanation}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  );

  const renderTradeGuidance = (guidance: TradeGuidance) => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Position Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {renderStatusWithTooltip(
              "Status",
              guidance.currentPosition.status,
              guidance.currentPosition.status === "PROFIT"
                ? "text-green-500"
                : guidance.currentPosition.status === "LOSS"
                  ? "text-red-500"
                  : "text-yellow-500",
              "Current profit/loss status of your position",
            )}
            {renderStatusWithTooltip(
              "Risk Level",
              guidance.currentPosition.riskLevel,
              guidance.currentPosition.riskLevel === "LOW"
                ? "text-green-500"
                : guidance.currentPosition.riskLevel === "HIGH"
                  ? "text-red-500"
                  : "text-yellow-500",
              "Current risk exposure level based on market conditions and position size",
            )}
            {renderStatusWithTooltip(
              "Suggested Action",
              guidance.currentPosition.suggestedAction,
              "text-primary",
              "Recommended action based on technical analysis and risk assessment",
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Psychology Check
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Analysis of your trading psychology and potential emotional
                    biases
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Emotional State</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Current emotional context that might affect your trading
                      decisions
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm">{guidance.psychologyCheck.emotionalState}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Potential Biases</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Cognitive biases that might be influencing your trading
                      decisions
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {guidance.psychologyCheck.biasWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Recommendations</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Actionable steps to improve your trading psychology and
                      decision-making
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {guidance.psychologyCheck.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <DashboardHeader
          heading="Trading Copilot"
          text="Lock your trading chart window and get instant AI-powered analysis."
        >
          <div id="session-manager" className="w-full sm:w-auto">
            <SessionManager
              currentSessionId={currentSessionId}
              onSessionChange={setCurrentSessionId}
            />
          </div>
        </DashboardHeader>

        <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
          <div className="space-y-6">
            {/* Chart Window Section */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      {lastPrompt && (
                        <div
                          id="auto-analysis"
                          className="flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              "size-2 rounded-full",
                              autoAnalysisEnabled
                                ? "bg-green-500"
                                : "bg-yellow-500",
                              isAnalyzing && "animate-pulse",
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {autoAnalysisEnabled
                              ? "Auto-analysis active"
                              : "Auto-analysis paused"}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAutoAnalysisEnabled(!autoAnalysisEnabled)
                      }
                      className="w-full sm:w-auto"
                    >
                      {autoAnalysisEnabled ? "Pause" : "Resume"} Auto-analysis
                    </Button>
                  </div>
                  <div id="chart-window">
                    <WindowCapture
                      ref={windowCaptureRef}
                      onCapture={handleCapture}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Section */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-semibold">
                      Analysis
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            Choose between analyzing new trading opportunities
                            or getting guidance for active trades. Analysis will
                            auto-update with each new capture.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {lastAnalysisTime && (
                    <p className="text-sm text-muted-foreground">
                      Last updated {formatTime(lastAnalysisTime)}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div id="analysis-form">
                  <AnalysisForm
                    image={capturedImage}
                    onSubmit={handleAnalysis}
                    isLoading={isAnalyzing}
                  />
                </div>

                {analysisResult && (
                  <div className="relative space-y-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAnalyzing && (
                          <div className="flex items-center gap-2">
                            <div className="size-2 animate-pulse rounded-full bg-primary" />
                            <span className="text-sm">
                              Updating analysis...
                            </span>
                          </div>
                        )}
                      </div>
                      <TimestampDisplay timestamp={analysisResult.timestamp} />
                    </div>

                    {isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                        <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg">
                          <div className="size-2 animate-pulse rounded-full bg-primary" />
                          <p className="text-sm">Updating analysis...</p>
                        </div>
                      </div>
                    )}
                    {analysisResult.type === "OPPORTUNITY" &&
                    analysisResult.score
                      ? renderOpportunityScore(analysisResult.score)
                      : null}
                    {analysisResult.type === "GUIDANCE" &&
                    analysisResult.guidance
                      ? renderTradeGuidance(analysisResult.guidance)
                      : null}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Knowledge Context
                        </h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="size-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                Trading knowledge used to inform the analysis,
                                with similarity scores showing relevance
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.context.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                          >
                            <span className="font-medium text-primary">
                              {item.category}
                            </span>
                            <span className="ml-1 text-muted-foreground">
                              {(item.similarity * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session History Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div id="session-history">
                  <SessionHistory
                    sessionId={currentSessionId}
                    onAnalysisSelect={handleAnalysisSelect}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <CopilotWalkthrough />
    </TooltipProvider>
  );
}
