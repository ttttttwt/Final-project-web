"use client";

import { cn } from "@/lib/utils";
import { PerformanceReport } from "@/types/custom-materials";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Trophy,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  BookOpen,
  MessageSquare,
  X,
} from "lucide-react";

interface EndSessionReportProps {
  report: PerformanceReport;
  onClose: () => void;
  onPracticeAgain?: () => void;
  className?: string;
}

/**
 * Performance report displayed at the end of a chat session.
 * Shows score, grammar errors, and improvement suggestions.
 */
export function EndSessionReport({
  report,
  onClose,
  onPracticeAgain,
  className,
}: EndSessionReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#4CAF50]";
    if (score >= 60) return "text-[#F57F17]";
    return "text-[#D32F2F]";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great Job!";
    if (score >= 70) return "Good Progress";
    if (score >= 60) return "Keep Practicing";
    return "Needs Improvement";
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Score */}
          <div className="flex flex-col items-center text-center pt-4">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-3",
                report.score >= 80
                  ? "bg-[#E8F5E9]"
                  : report.score >= 60
                  ? "bg-[#FFF8E1]"
                  : "bg-[#FFEBEE]"
              )}
            >
              <Trophy className={cn("h-10 w-10", getScoreColor(report.score))} />
            </div>
            <CardTitle className={cn("text-4xl font-bold", getScoreColor(report.score))}>
              {report.score}%
            </CardTitle>
            <CardDescription className="text-lg">
              {getScoreLabel(report.score)}
            </CardDescription>
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-1">
              {report.totalMessages} messages exchanged
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-[#4CAF50]">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-1 pl-6">
                {report.strengths.map((strength, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-[#202124] dark:text-[#E8EAED] list-disc"
                  >
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {report.areasForImprovement.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-[#F57F17]">
                <ArrowUp className="h-4 w-4" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1 pl-6">
                {report.areasForImprovement.map((area, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-[#202124] dark:text-[#E8EAED] list-disc"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Errors */}
          {report.grammarErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-[#D32F2F]">
                <AlertTriangle className="h-4 w-4" />
                Grammar Corrections ({report.grammarErrors.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {report.grammarErrors.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#FFEBEE] dark:bg-[#D32F2F]/10 text-sm"
                  >
                    <p>
                      <span className="line-through text-[#D32F2F]">
                        {error.original}
                      </span>
                      {" → "}
                      <span className="text-[#4CAF50] font-medium">
                        {error.corrected}
                      </span>
                    </p>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1">
                      {error.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Suggestions */}
          {report.vocabularySuggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-[#4285F4]">
                <BookOpen className="h-4 w-4" />
                Vocabulary to Review
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.vocabularySuggestions.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-sm rounded-full bg-[#E3F2FD] dark:bg-[#4285F4]/20 text-[#1565C0] dark:text-[#90CAF9]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {onPracticeAgain && (
              <Button onClick={onPracticeAgain} className="flex-1 gap-2">
                <MessageSquare className="h-4 w-4" />
                Practice Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
