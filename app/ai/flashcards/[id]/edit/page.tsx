"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FlashcardDeckDTO, FlashcardCardDTO, UpdateFlashcardDeckDTO } from "@/types/ai";
import { aiFlashcardService } from "@/services/ai-flashcard.service";
import { AiPageWrapper, AiLoadingState, AiErrorCard } from "@/components/ai/common";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";

interface EditDeckPageProps {
  params: Promise<{ id: string }>;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

const cardSchema = z.object({
  front: z.string().min(1, "Front text is required"),
  definition: z.string().min(1, "Definition is required"),
  partOfSpeech: z.string().optional(),
  pronunciation: z.string().optional(),
  exampleSentence: z.string().optional(),
});

/**
 * Edit Flashcard Deck Page
 * Allows editing deck metadata and managing cards.
 */
export default function EditDeckPage({ params }: EditDeckPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<FlashcardDeckDTO | null>(null);
  const [cards, setCards] = useState<FlashcardCardDTO[]>([]);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cefrLevel: "B1",
    },
  });

  const cardForm = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      front: "",
      definition: "",
      partOfSpeech: "",
      pronunciation: "",
      exampleSentence: "",
    },
  });

  useEffect(() => {
    loadDeck();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDeck = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deckData = await aiFlashcardService.getDeck(id);
      setDeck(deckData);
      setCards(deckData.cards || []);
      
      // Populate form with deck data
      form.reset({
        title: deckData.title,
        description: deckData.description || "",
        cefrLevel: deckData.cefrLevel || "B1",
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || "Failed to load deck";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, form]);

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const updateData: UpdateFlashcardDeckDTO = {
        title: values.title,
        description: values.description,
        cefrLevel: values.cefrLevel,
        cards: cards,
      };

      await aiFlashcardService.updateDeck(id, updateData);
      toast.success("Deck updated successfully");
      router.push(`/ai/flashcards/${id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || "Failed to update deck";
      toast.error("Error", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCard = (values: z.infer<typeof cardSchema>) => {
    const newCard: FlashcardCardDTO = {
      front: values.front,
      back: {
        definition: values.definition,
        partOfSpeech: values.partOfSpeech || undefined,
        pronunciation: values.pronunciation || undefined,
        exampleSentence: values.exampleSentence || undefined,
      },
    };

    if (editingCardIndex !== null) {
      // Update existing card
      const newCards = [...cards];
      newCards[editingCardIndex] = newCard;
      setCards(newCards);
      setEditingCardIndex(null);
    } else {
      // Add new card
      setCards([...cards, newCard]);
    }

    cardForm.reset();
    setShowAddCardDialog(false);
  };

  const handleEditCard = (index: number) => {
    const card = cards[index];
    cardForm.reset({
      front: card.front,
      definition: card.back.definition,
      partOfSpeech: card.back.partOfSpeech || "",
      pronunciation: card.back.pronunciation || "",
      exampleSentence: card.back.exampleSentence || "",
    });
    setEditingCardIndex(index);
    setShowAddCardDialog(true);
  };

  const handleDeleteCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    setShowDeleteCardDialog(null);
    toast.success("Card removed");
  };

  const handleCloseCardDialog = () => {
    setShowAddCardDialog(false);
    setEditingCardIndex(null);
    cardForm.reset();
  };

  if (isLoading) {
    return (
      <AiPageWrapper
        title="Edit Deck"
        backHref={`/ai/flashcards/${id}`}
        backLabel="Back to Deck"
      >
        <AiLoadingState variant="studying" message="Loading deck..." />
      </AiPageWrapper>
    );
  }

  if (error || !deck) {
    return (
      <AiPageWrapper
        title="Edit Deck"
        backHref="/ai/flashcards"
        backLabel="Flashcards"
      >
        <AiErrorCard
          title="Failed to load deck"
          message={error || "Deck not found"}
          onRetry={loadDeck}
          onReset={() => router.push("/ai/flashcards")}
        />
      </AiPageWrapper>
    );
  }

  return (
    <AiPageWrapper
      title="Edit Deck"
      backHref={`/ai/flashcards/${id}`}
      backLabel="Back to Deck"
      feature="flashcards"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Deck Metadata Form */}
        <Card>
          <CardHeader>
            <CardTitle>Deck Details</CardTitle>
            <CardDescription>
              Update the deck title, description, and CEFR level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business Vocabulary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="cefrLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target CEFR Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormDescription>
                        Helps AI generate appropriate content for this deck.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/ai/flashcards/${id}`)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Cards Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cards ({cards.length})</CardTitle>
              <CardDescription>
                Manage the flashcards in this deck.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddCardDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No cards in this deck yet.</p>
                <p className="text-sm">Click &quot;Add Card&quot; to create your first card.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{index + 1}
                        </span>
                        <span className="font-medium truncate">{card.front}</span>
                        {card.back.partOfSpeech && (
                          <Badge variant="outline" className="text-xs">
                            {card.back.partOfSpeech}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {card.back.definition}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCard(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteCardDialog(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={handleCloseCardDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCardIndex !== null ? "Edit Card" : "Add New Card"}
            </DialogTitle>
            <DialogDescription>
              {editingCardIndex !== null
                ? "Update the flashcard content."
                : "Create a new flashcard for this deck."}
            </DialogDescription>
          </DialogHeader>
          <Form {...cardForm}>
            <form onSubmit={cardForm.handleSubmit(handleAddCard)} className="space-y-4">
              <FormField
                control={cardForm.control}
                name="front"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Front (Word/Phrase)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Negotiate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cardForm.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="The meaning of the word..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={cardForm.control}
                  name="partOfSpeech"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part of Speech</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., verb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cardForm.control}
                  name="pronunciation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pronunciation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., /nɪˈɡoʊʃieɪt/" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={cardForm.control}
                name="exampleSentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example Sentence</FormLabel>
                    <FormControl>
                      <Input placeholder="Use the word in context..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseCardDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCardIndex !== null ? "Update Card" : "Add Card"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirmation Dialog */}
      <Dialog
        open={showDeleteCardDialog !== null}
        onOpenChange={() => setShowDeleteCardDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCardDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteCardDialog !== null && handleDeleteCard(showDeleteCardDialog)
              }
            >
              Delete Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AiPageWrapper>
  );
}
