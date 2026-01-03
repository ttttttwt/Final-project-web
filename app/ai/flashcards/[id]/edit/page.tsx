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
import { Loader2, Save, Plus, Trash2, GripVertical, Sparkles, Upload, ImageOff } from "lucide-react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  imageSource: z.enum(["AI", "UPLOAD", "NONE"]),
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Track pending uploads per card index
  const [pendingUploads, setPendingUploads] = useState<Map<number, File>>(new Map());

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
      imageSource: "AI",
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
      // First, upload any pending images
      const updatedCards = [...cards];
      for (const [cardIndex, file] of pendingUploads.entries()) {
        if (cardIndex < updatedCards.length && updatedCards[cardIndex].back.imageSource === "UPLOAD") {
          try {
            const imageUrl = await aiFlashcardService.uploadCardImage(file, id, cardIndex);
            updatedCards[cardIndex] = {
              ...updatedCards[cardIndex],
              back: {
                ...updatedCards[cardIndex].back,
                imageUrl,
                imageStatus: "COMPLETED",
              },
            };
          } catch (uploadErr) {
            console.error(`Failed to upload image for card ${cardIndex}:`, uploadErr);
            toast.error(`Failed to upload image for card #${cardIndex + 1}`);
          }
        }
      }

      const updateData: UpdateFlashcardDeckDTO = {
        title: values.title,
        description: values.description,
        cefrLevel: values.cefrLevel,
        cards: updatedCards,
      };

      await aiFlashcardService.updateDeck(id, updateData);
      setPendingUploads(new Map()); // Clear pending uploads
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
        imageSource: values.imageSource,
        imageStatus: values.imageSource === "AI" ? "PENDING" : undefined,
        // For UPLOAD with preview, set temporary local preview URL
        imageUrl: values.imageSource === "UPLOAD" && imagePreview ? imagePreview : undefined,
      },
    };

    let targetIndex: number;
    if (editingCardIndex !== null) {
      // Update existing card
      const newCards = [...cards];
      newCards[editingCardIndex] = newCard;
      setCards(newCards);
      targetIndex = editingCardIndex;
      setEditingCardIndex(null);
    } else {
      // Add new card
      setCards([...cards, newCard]);
      targetIndex = cards.length; // Index of the new card
    }

    // Track uploaded file for later upload
    if (values.imageSource === "UPLOAD" && uploadedFile) {
      setPendingUploads(prev => {
        const newMap = new Map(prev);
        newMap.set(targetIndex, uploadedFile);
        return newMap;
      });
    }

    // Reset form and file state
    cardForm.reset();
    setShowAddCardDialog(false);
    setUploadedFile(null);
    setImagePreview(null);
  };

  const handleEditCard = (index: number) => {
    const card = cards[index];
    cardForm.reset({
      front: card.front,
      definition: card.back.definition,
      partOfSpeech: card.back.partOfSpeech || "",
      pronunciation: card.back.pronunciation || "",
      exampleSentence: card.back.exampleSentence || "",
      imageSource: card.back.imageSource || "AI",
    });
    setEditingCardIndex(index);
    setShowAddCardDialog(true);
    // Reset file upload state when editing
    setUploadedFile(null);
    setImagePreview(card.back.imageUrl || null);
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
    // Reset file upload state
    setUploadedFile(null);
    setImagePreview(null);
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

              {/* Current Image Preview (shown when editing and image exists) */}
              {editingCardIndex !== null && cards[editingCardIndex]?.back.imageUrl && (
                <div className="space-y-2">
                  <FormLabel>Current Image</FormLabel>
                  <div className="flex items-center gap-4 p-3 border border-border rounded-lg bg-muted/10">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-background">
                      <Image
                        src={cards[editingCardIndex].back.imageUrl!}
                        alt="Current card image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>This card has an existing image.</p>
                      <p className="text-xs">Change the source below to replace it.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Source Selection */}
              <FormField
                control={cardForm.control}
                name="imageSource"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Card Image</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="AI" id="image-ai" />
                          <Label htmlFor="image-ai" className="flex items-center gap-1.5 cursor-pointer">
                            <Sparkles className="w-4 h-4 text-primary" />
                            AI Generate
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="UPLOAD" id="image-upload" />
                          <Label htmlFor="image-upload" className="flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-4 h-4 text-blue-500" />
                            Upload
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NONE" id="image-none" />
                          <Label htmlFor="image-none" className="flex items-center gap-1.5 cursor-pointer">
                            <ImageOff className="w-4 h-4 text-muted-foreground" />
                            None
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Default Image Preview (shown when AI selected) */}
              {cardForm.watch("imageSource") === "AI" && (
                <div className="flex items-center gap-4 p-3 border border-border rounded-lg bg-muted/10">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-background">
                    <Image
                      src="/images/flashcard-default.svg"
                      alt="AI generated image preview"
                      fill
                      className="object-cover opacity-70"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>AI will generate an image based on the card content.</p>
                  </div>
                </div>
              )}

              {/* File Upload (shown when UPLOAD selected) */}
              {cardForm.watch("imageSource") === "UPLOAD" && (
                <div className="space-y-3 p-4 border border-dashed border-border rounded-lg bg-muted/20">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("File too large", { description: "Max size is 5MB" });
                          return;
                        }
                        setUploadedFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
                  />
                  {imagePreview && (
                    <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden border">
                      <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                    </div>
                  )}
                </div>
              )}

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
