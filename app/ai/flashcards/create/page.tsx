"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { aiFlashcardService } from "@/services/ai-flashcard.service";
import { AiPageWrapper } from "@/components/ai/common";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Sparkles, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const manualFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

const aiFormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200, "Topic is too long"),
  customTitle: z.string().optional(),
  description: z.string().optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  cardCount: z.number().min(5).max(50).optional(),
});

export default function CreateDeckPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      title: "",
      description: "",
      cefrLevel: "B1",
    },
  });

  const aiForm = useForm<z.infer<typeof aiFormSchema>>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      topic: "",
      customTitle: "",
      description: "",
      cefrLevel: "B2",
      cardCount: 15,
    },
  });

  async function onManualSubmit(values: z.infer<typeof manualFormSchema>) {
    setIsSubmitting(true);
    try {
      const deck = await aiFlashcardService.createDeck({
        title: values.title,
        description: values.description,
        cefrLevel: values.cefrLevel,
        sourceType: "USER_CREATED",
        cards: [],
      });
      
      toast.success("Deck created successfully");
      router.push(`/ai/flashcards/${deck.id}/edit`);
    } catch (error: any) {
      toast.error("Failed to create deck", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAISubmit(values: z.infer<typeof aiFormSchema>) {
    setIsSubmitting(true);
    try {
      const deck = await aiFlashcardService.generateFlashcardsByTopic({
        topic: values.topic,
        customTitle: values.customTitle || undefined,
        description: values.description || undefined,
        cefrLevel: values.cefrLevel,
        cardCount: values.cardCount,
      });
      
      toast.success(`Generated ${deck.cardCount} flashcards!`, {
        description: `Deck "${deck.title}" is ready for study.`,
      });
      router.push(`/ai/flashcards/${deck.id}`);
    } catch (error: any) {
      toast.error("Failed to generate flashcards", {
        description: error.response?.data?.message || "AI generation failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AiPageWrapper
      title="Create Flashcard Deck"
      backHref="/ai/flashcards"
      backLabel="Back to Decks"
      feature="flashcards"
      showQuota={true}
    >
      <div className="max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Empty Deck
            </TabsTrigger>
          </TabsList>

          {/* AI Generation Tab */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Powered Generation
                </CardTitle>
                <CardDescription>
                  Enter a topic and let AI generate vocabulary flashcards for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aiForm}>
                  <form onSubmit={aiForm.handleSubmit(onAISubmit)} className="space-y-6">
                    <FormField
                      control={aiForm.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Business negotiations, Travel vocabulary, Medical terminology" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the topic you want to learn vocabulary for.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={aiForm.control}
                        name="cefrLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEFR Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={aiForm.control}
                        name="cardCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Cards</FormLabel>
                            <Select 
                              onValueChange={(v) => field.onChange(parseInt(v))} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select count" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[5, 10, 15, 20, 25, 30, 40, 50].map((count) => (
                                  <SelectItem key={count} value={count.toString()}>
                                    {count} cards
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={aiForm.control}
                      name="customTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Title (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Leave empty to auto-generate from topic" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={aiForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional context about this deck..." 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        AI generation uses your daily quota. Each generation creates one deck.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Flashcards
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Creation Tab */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Create Empty Deck</CardTitle>
                <CardDescription>
                  Create a new empty deck and add cards manually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...manualForm}>
                  <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6">
                    <FormField
                      control={manualForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Business Vocabulary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={manualForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is this deck about?" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={manualForm.control}
                      name="cefrLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target CEFR Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Create Deck
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AiPageWrapper>
  );
}
