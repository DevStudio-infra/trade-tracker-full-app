"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Clock, LineChart, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Analysis {
  id: string;
  type: "OPPORTUNITY" | "GUIDANCE";
  prompt: string;
  result: any;
  createdAt: string;
}

interface SessionHistoryProps {
  sessionId: string | null;
  onAnalysisSelect: (analysis: Analysis) => void;
}

// Utility function for score colors - moved outside components to be accessible to both
const getScoreColor = (score: number) => {
  if (score >= 80)
    return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
  if (score >= 70)
    return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
  return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
};

function AnalysisDialog({
  analysis,
  onOpenChange,
}: {
  analysis: Analysis | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!analysis) return null;

  const formatTimeframeList = (timeframes: string[]) => {
    return timeframes.join(", ");
  };

  return (
    <DialogContent className="max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>
          {analysis.type === "OPPORTUNITY"
            ? "Trade Setup Analysis"
            : "Position Guidance"}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[calc(80vh-100px)] pr-4">
        <div className="space-y-4">
          {/* Prompt Section */}
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium">Prompt</p>
            <p className="text-sm text-muted-foreground">{analysis.prompt}</p>
          </div>

          {/* Scores Section for Opportunity Analysis */}
          {analysis.type === "OPPORTUNITY" && analysis.result.score && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 font-medium">Technical Analysis</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score:
                      </span>
                      <Badge
                        className={cn(
                          "font-normal",
                          getScoreColor(analysis.result.score.technicalScore),
                        )}
                      >
                        {analysis.result.score.technicalScore}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 font-medium">Market Context</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score:
                      </span>
                      <Badge
                        className={cn(
                          "font-normal",
                          getScoreColor(
                            analysis.result.score.marketContextScore,
                          ),
                        )}
                      >
                        {analysis.result.score.marketContextScore}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 font-medium">Risk Assessment</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score:
                      </span>
                      <Badge
                        className={cn(
                          "font-normal",
                          getScoreColor(analysis.result.score.riskScore),
                        )}
                      >
                        {analysis.result.score.riskScore}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 font-medium">Overall Score</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score:
                      </span>
                      <Badge
                        className={cn(
                          "font-normal",
                          getScoreColor(analysis.result.score.overallScore),
                        )}
                      >
                        {analysis.result.score.overallScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeframe Recommendations */}
              {analysis.result.score.timeframeRecommendations && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 font-medium">Timeframe Analysis</div>
                  <div className="space-y-2">
                    {analysis.result.score.timeframeRecommendations
                      .suggestedTimeframes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Check timeframes:
                        </span>
                        <Badge variant="outline">
                          {formatTimeframeList(
                            analysis.result.score.timeframeRecommendations
                              .suggestedTimeframes,
                          )}
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {analysis.result.score.timeframeRecommendations.reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 font-medium">Detailed Analysis</div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {analysis.result.score.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guidance Section */}
          {analysis.type === "GUIDANCE" && analysis.result.guidance && (
            <div className="space-y-4">
              {/* ... existing guidance rendering code ... */}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            Analyzed at{" "}
            {format(new Date(analysis.createdAt), "MMM d, yyyy HH:mm:ss")}
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

function HistoryItemSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg">
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Separator className="my-6 opacity-30" />
        </div>
      ))}
    </div>
  );
}

export function SessionHistory({
  sessionId,
  onAnalysisSelect,
}: SessionHistoryProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null,
  );
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  // Fetch analyses initially and set up polling
  useEffect(() => {
    if (sessionId) {
      fetchAnalyses();
      const interval = setInterval(fetchAnalyses, 5000);
      return () => clearInterval(interval);
    } else {
      setAnalyses([]);
    }
  }, [sessionId]);

  const fetchAnalyses = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch analyses");
      const data = await response.json();

      if (JSON.stringify(data.analyses) !== JSON.stringify(analyses)) {
        setAnalyses(data.analyses);
      }
    } catch (error) {
      console.error("Error fetching analyses:", error);
      if (analyses.length === 0) {
        toast.error("Failed to load analysis history");
      }
    }
  };

  const handleAnalysisClick = (analysis: Analysis) => {
    onAnalysisSelect(analysis);
    setSelectedAnalysis(analysis);
    setShowAnalysisDialog(true);
  };

  if (!sessionId) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Select a session to view history
      </div>
    );
  }

  if (isLoading && analyses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Analysis History</h3>
          <Skeleton className="h-4 w-20" />
        </div>

        <ScrollArea className="h-[600px]">
          <div className="pr-4">
            <HistoryItemSkeleton />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Analysis History</h3>
        <span className="text-xs text-muted-foreground">
          {analyses.length} analyses
        </span>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-6 pr-4">
          {analyses.map((analysis, index) => (
            <div
              key={analysis.id}
              className="group rounded-lg transition-colors hover:bg-muted/30"
            >
              <Button
                variant="ghost"
                className="w-full justify-start p-5 hover:bg-transparent"
                onClick={() => handleAnalysisClick(analysis)}
              >
                <div className="flex w-full flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysis.type === "OPPORTUNITY" ? (
                        <LineChart className="size-4 text-primary" />
                      ) : (
                        <MessageSquare className="size-4 text-primary" />
                      )}
                      <Badge variant="secondary" className="font-normal">
                        {analysis.type === "OPPORTUNITY"
                          ? "Trade Setup"
                          : "Position Guidance"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>
                        {format(new Date(analysis.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {analysis.prompt}
                    </p>

                    {analysis.type === "OPPORTUNITY" &&
                      analysis.result.score && (
                        <Badge
                          className={cn(
                            "font-normal",
                            getScoreColor(analysis.result.score.overallScore),
                          )}
                        >
                          Score: {analysis.result.score.overallScore}
                        </Badge>
                      )}
                  </div>
                </div>
              </Button>
              {index < analyses.length - 1 && (
                <Separator className="my-6 opacity-30" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <AnalysisDialog
          analysis={selectedAnalysis}
          onOpenChange={setShowAnalysisDialog}
        />
      </Dialog>
    </div>
  );
}
