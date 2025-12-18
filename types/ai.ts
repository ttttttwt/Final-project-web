import { PaginatedResponse } from "./common";

// ==========================================
// Role-Play Types
// ==========================================

export interface RolePlayRequestDTO {
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  domain: string;
  industry?: string;
  userContext?: string;
}

export interface RolePlayVocabularyItemDTO {
  term: string;
  definition: string;
  example?: string;
  ipa?: string;
}

export interface RolePlayContextDetailsDTO {
  setting?: string;
  situation?: string;
  keyInfo?: string[];
  yourGoal?: string;
  tips?: string[];
}

export interface RolePlayScenarioDTO {
  id: string;
  title: string;
  context: string;
  contextDetails?: RolePlayContextDetailsDTO;
  yourRole: string;
  aiRole: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  domain: string;
  industry?: string;
  objectives: string[];
  keyVocabulary: RolePlayVocabularyItemDTO[];
  openingLine?: string;
  suggestedPrompts?: string[];
  agenda?: string[];
  suggestedDuration?: number;
  isFallback?: boolean;
  createdAt?: string;
}

export interface RolePlayStartConversationDTO {
  scenarioId: string;
  mode: "immersive" | "learning";
}

export interface RolePlayMessageDTO {
  role: "user" | "ai";
  content: string;
  timestamp: string;
  feedback?: Record<string, any>;
}

export interface RolePlayConversationDTO {
  id: string;
  userId: string;
  scenarioId?: string;
  messages: RolePlayMessageDTO[];
  contextSummary?: string;
  status: "in_progress" | "completed" | "abandoned";
  mode: "immersive" | "learning";
  metrics?: Record<string, any>;
  feedbackSummary?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePlaySendMessageDTO {
  content: string;
}

// ==========================================
// Grammar Types
// ==========================================

export interface GrammarRequestDTO {
  grammarTopic: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  theme?: string;
  exerciseCount?: number;
  timeLimitSeconds?: number;
  useFallback?: boolean;
}

export interface GrammarExplanationDTO {
  rule: string;
  examples: string[];
  commonMistakes?: string[];
  tips?: string[];
}

export interface GrammarExerciseDTO {
  type: "multiple_choice" | "fill_blank" | "transformation" | "error_correction";
  instruction: string;
  question: string;
  options?: string[];
  blanks?: string[];
  correctAnswer: any;
  hint?: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GrammarExerciseSetDTO {
  id: string;
  grammarPoint: string;
  cefrLevel: string;
  theme?: string;
  explanation: GrammarExplanationDTO;
  exercises: GrammarExerciseDTO[];
  exerciseCount: number;
  timeLimitSeconds?: number;
  isFallback?: boolean;
  createdAt?: string;
}

export interface GrammarAnswerItem {
  questionIndex: number;
  answer: any;
  timeMs?: number;
}

export interface GrammarAnswerDTO {
  exerciseSetId: string;
  answers: GrammarAnswerItem[];
  totalTimeSeconds: number;
}

export interface GrammarTopicDTO {
  id: number;
  name: string;
  category: string;
  cefrLevels: string[];
  description?: string;
  isActive: boolean;
}

export interface GrammarProgressDTO {
  id: number;
  userId: string;
  exerciseSetId: string;
  grammarPoint: string;
  cefrLevel: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface GrammarStatsDTO {
  userId: string;
  totalAttempted: number;
  totalCompleted: number;
  totalPassed: number;
  averageScore: number;
  totalTimeSpentSeconds: number;
  currentStreak: number;
  longestStreak: number;
  topicBreakdown?: Record<string, {
    attempted: number;
    passed: number;
    averageScore: number;
  }>;
  recentActivity?: GrammarProgressDTO[];
}

export interface QuestionFeedback {
  questionIndex: number;
  userAnswer: any;
  correctAnswer: any;
  correct: boolean;
  explanation: string;
  timeMs?: number;
}

export interface GrammarResultDTO {
  exerciseSetId: string;
  grammarPoint: string;
  cefrLevel: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  feedback: QuestionFeedback[];
  areasToImprove?: string[];
  encouragement?: string;
  completedAt?: string;
}

// ==========================================
// Flashcard Types
// ==========================================

export interface GenerateFlashcardsDTO {
  lessonId: number;
  maxCards?: number;
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  focusAreas?: string[];
  includeExamples?: boolean;
  includePronunciation?: boolean;
  includeSynonyms?: boolean;
  customTitle?: string;
}

export interface GenerateFlashcardsByTopicDTO {
  topic: string;
  customTitle?: string;
  description?: string;
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  cardCount?: number;
  focusAreas?: string[];
  includeExamples?: boolean;
  includePronunciation?: boolean;
}

export interface FlashcardBackDTO {
  definition: string;
  partOfSpeech?: string;
  pronunciation?: string;
  exampleSentence?: string;
  synonyms?: string[];
  collocations?: string[];
  notes?: string[];
  imageUrl?: string;
  audioUrl?: string;
}

export interface FlashcardCardDTO {
  front: string;
  back: FlashcardBackDTO;
  tags?: string[];
  difficulty?: number; // 1-5
}

export interface FlashcardDeckDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  sourceType: "LESSON" | "AI_GENERATED" | "USER_CREATED";
  sourceId?: number;
  courseTitle?: string;
  lessonTitle?: string;
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  cards: FlashcardCardDTO[];
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  // Optional progress fields from backend
  dueCount?: number;
  newCount?: number;
  masteredCount?: number;
  accuracyRate?: number;
  masteryLevel?: number;
  nextReview?: string;
}

export interface CreateFlashcardDeckDTO {
  title: string;
  description?: string;
  sourceType: "LESSON" | "AI_GENERATED" | "USER_CREATED";
  sourceId?: number;
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  cards?: FlashcardCardDTO[];
}

export interface UpdateFlashcardDeckDTO {
  title?: string;
  description?: string;
  cefrLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  cards?: FlashcardCardDTO[];
}

export interface FlashcardProgressDTO {
  id?: number;
  cardIndex: number;
  masteryLevel: number;
  masteryLevelName?: string;
  reviewCount: number;
  correctCount: number;
  accuracyRate?: number;
  easeFactor?: number;
  intervalDays?: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  due?: boolean;
}

export interface FlashcardStudySessionDTO {
  deckId: string;
  deckTitle: string;
  sessionStartedAt: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  sessionSize?: number;
  cardsToStudy: FlashcardProgressDTO[];
  stats?: {
    newCount: number;
    learningCount: number;
    reviewCount: number;
    masteredCount: number;
  };
}

export interface CardReviewDTO {
  cardIndex: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  timeTakenMs?: number;
}

export interface FlashcardReviewResultDTO {
  reviews: CardReviewDTO[];
  sessionTimeMs?: number;
}

export interface DueCountResponse {
  totalDueCards: number;
}

export interface LessonDeckCheckResponse {
  exists: boolean;
  deckId?: string;
}

export interface UserAiQuota {
  userId: string;
  dailyLimit: number;
  dailyUsed: number;
  lastResetDaily: string;
  monthlyLimit: number;
  monthlyUsed: number;
  lastResetMonthly: string;
  isPremium: boolean;
  suspended: boolean;
  isUnlimited: boolean;
  
  rolePlayDailyLimit: number;
  rolePlayUsedToday: number;
  rolePlayMonthlyLimit: number;
  rolePlayUsedMonth: number;
  
  grammarDailyLimit: number;
  grammarUsedToday: number;
  grammarMonthlyLimit: number;
  grammarUsedMonth: number;
  
  flashcardDailyLimit: number;
  flashcardUsedToday: number;
  flashcardMonthlyLimit: number;
  flashcardUsedMonth: number;
  
  totalUsedToday: number;
  totalDailyLimit: number;
}
