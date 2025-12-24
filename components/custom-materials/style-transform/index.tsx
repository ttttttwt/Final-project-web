"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Coffee, 
  Mail, 
  Presentation, 
  Share2, 
  Handshake, 
  Zap,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Info,
  RotateCcw,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCustomMaterialStore } from "@/store/customMaterialStore";
import { StyleType } from "@/types/custom-materials";

const STYLES: { type: StyleType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    type: "FORMAL", 
    label: "Formal", 
    icon: <ShieldCheck className="h-4 w-4" />, 
    description: "Professional, academic, and structured language." 
  },
  { 
    type: "CASUAL", 
    label: "Casual", 
    icon: <Coffee className="h-4 w-4" />, 
    description: "Friendly, relaxed, and conversational tone." 
  },
  { 
    type: "EMAIL", 
    label: "Email", 
    icon: <Mail className="h-4 w-4" />, 
    description: "Standard business correspondence format." 
  },
  { 
    type: "PRESENTATION", 
    label: "Presentation", 
    icon: <Presentation className="h-4 w-4" />, 
    description: "Engaging, clear, and structured for speaking." 
  },
  { 
    type: "SOCIAL_MEDIA", 
    label: "Social Media", 
    icon: <Share2 className="h-4 w-4" />, 
    description: "Concise, catchy, and engaging for online platforms." 
  },
  { 
    type: "DIPLOMATIC", 
    label: "Diplomatic", 
    icon: <Handshake className="h-4 w-4" />, 
    description: "Tactful and polite for sensitive professional contexts." 
  },
  { 
    type: "PERSUASIVE", 
    label: "Persuasive", 
    icon: <Zap className="h-4 w-4" />, 
    description: "Convincing and influential to drive action." 
  },
];

export function StyleTransformer() {
  const [text, setText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("FORMAL");
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [copied, setCopied] = useState(false);

  const { 
    transformStyle, 
    transformationResult, 
    isTransforming, 
    clearTransformation 
  } = useCustomMaterialStore();

  const handleTransform = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to transform");
      return;
    }

    try {
      await transformStyle({
        text,
        targetStyle: selectedStyle,
        includeExplanation
      });
      toast.success("Text transformed successfully!");
    } catch (err) {
      toast.error("Failed to transform text. Please try again.");
    }
  };

  const handleCopy = () => {
    if (!transformationResult?.transformedText) return;
    
    navigator.clipboard.writeText(transformationResult.transformedText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setText("");
    clearTransformation();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#202124] dark:text-[#E8EAED]">
            Style Transformer
          </h2>
          <p className="text-[#5F6368] dark:text-[#9AA0A6] mt-1">
            Adapt your writing for any professional context with AI-powered precision.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-full border border-border/50">
            <Switch 
              id="learn-mode" 
              checked={includeExplanation}
              onCheckedChange={setIncludeExplanation}
            />
            <Label htmlFor="learn-mode" className="text-sm font-medium cursor-pointer">
              Learn Mode
            </Label>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleReset}
            className="rounded-full"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Style Selection */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your text here (e.g., a draft email, a report snippet, or a casual message)..."
                className="min-h-[300px] resize-none border-none focus-visible:ring-0 p-0 text-base leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {text.length} / 5000 characters
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Target Style
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.type}
                  onClick={() => setSelectedStyle(style.type)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                    selectedStyle === style.type
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    selectedStyle === style.type 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background text-muted-foreground group-hover:text-foreground"
                  )}>
                    {style.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{style.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {style.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
            onClick={handleTransform}
            disabled={isTransforming || !text.trim()}
          >
            {isTransforming ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                Transforming...
              </>
            ) : (
              <>
                Transform Style
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Output & Explanations */}
        <div className="lg:col-span-7 space-y-6">
          {!transformationResult && !isTransforming ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-3xl bg-muted/10">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">Ready to Transform</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                Enter your text and select a style to see the magic happen.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {/* Transformed Output */}
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background font-bold">
                      {selectedStyle}
                    </Badge>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Transformed Result
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopy}
                    className="h-8 gap-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {isTransforming ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      <div className="h-4 bg-muted animate-pulse rounded w-[90%]" />
                      <div className="h-4 bg-muted animate-pulse rounded w-[95%]" />
                      <div className="h-4 bg-muted animate-pulse rounded w-[85%]" />
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-lg leading-relaxed whitespace-pre-wrap text-[#202124] dark:text-[#E8EAED]">
                        {transformationResult?.transformedText}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explanations (Learn Mode) */}
              {includeExplanation && transformationResult?.explanations && transformationResult.explanations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Key Changes & Learning Points
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {transformationResult.explanations.map((exp, idx) => (
                      <Card key={idx} className="border-l-4 border-l-primary overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3">
                            {exp.original && exp.changed && (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 line-through decoration-red-500/50">
                                  {exp.original}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                                  {exp.changed}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {exp.reason}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
