/**
 * Lesson Type Definitions
 * Matches backend Lesson entity and JSONB content schemas
 */

/**
 * Lesson types supported by the platform
 */
export type LessonType = "READING" | "LISTENING" | "QUIZ" | "SPEAKING";

/**
 * Question types for comprehension assessments
 */
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_blank"
  | "matching";

/**
 * Base lesson interface
 */
export interface Lesson {
  id: number;
  sectionId: number;
  title: string;
  lessonType: LessonType;
  content: string; // JSONB string
  orderIndex: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== READING LESSON ====================

export interface ReadingPassage {
  text: string;
  title?: string;
}

export interface ReadingQuestion {
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example?: string;
  partOfSpeech?: string;
}

export interface ReadingContent {
  passages: ReadingPassage[];
  questions: ReadingQuestion[];
  vocabulary?: VocabularyItem[];
}

// ==================== LISTENING LESSON ====================

export interface ListeningQuestion {
  question: string;
  type: "multiple_choice" | "true_false" | "fill_blank";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  timestamp?: number;
}

export interface ListeningVocabulary {
  word: string;
  definition: string;
  timestamp?: number;
}

export interface ListeningContent {
  audioUrl: string;
  duration: number;
  transcript: string;
  showTranscript?: boolean;
  questions: ListeningQuestion[];
  vocabulary?: ListeningVocabulary[];
}

// ==================== QUIZ LESSON ====================

export interface QuizQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number | string[];
  points?: number;
  explanation?: string;
  hint?: string;
}

export interface QuizContent {
  title?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

// ==================== SPEAKING LESSON ====================

export interface SpeakingPrompt {
  prompt: string;
  context?: string;
  sampleAnswers?: string[];
  targetGrammar?: string[];
  targetVocabulary?: string[];
}

export interface RolePlaySettings {
  aiPersona?: string;
  turns?: number;
  enableFeedback?: boolean;
}

export interface SpeakingContent {
  scenario: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompts: SpeakingPrompt[];
  rolePlaySettings?: RolePlaySettings;
}

// ==================== PARSED LESSON ====================

/**
 * Lesson with parsed content based on type
 */
export type ParsedLesson<
  T = ReadingContent | ListeningContent | QuizContent | SpeakingContent
> = Omit<Lesson, "content"> & {
  parsedContent: T;
};

export type ReadingLesson = ParsedLesson<ReadingContent>;
export type ListeningLesson = ParsedLesson<ListeningContent>;
export type QuizLesson = ParsedLesson<QuizContent>;
export type SpeakingLesson = ParsedLesson<SpeakingContent>;

/**
 * Parse JSONB content string based on lesson type
 */
export function parseLessonContent(lesson: Lesson): ParsedLesson {
  try {
    const parsedContent = JSON.parse(lesson.content);
    return {
      ...lesson,
      parsedContent,
    };
  } catch (error) {
    console.error("Failed to parse lesson content:", error);
    throw new Error("Invalid lesson content format");
  }
}

/**
 * Lesson type metadata for UI display
 */
export interface LessonTypeInfo {
  type: LessonType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const LESSON_TYPE_INFO: Record<LessonType, LessonTypeInfo> = {
  READING: {
    type: "READING",
    label: "Reading",
    icon: "BookOpen",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
    description: "Text-based reading comprehension",
  },
  LISTENING: {
    type: "LISTENING",
    label: "Listening",
    icon: "Headphones",
    color: "text-green-600 bg-green-50 dark:bg-green-950",
    description: "Audio-based listening comprehension",
  },
  QUIZ: {
    type: "QUIZ",
    label: "Quiz",
    icon: "FileCheck",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950",
    description: "Assessment quiz",
  },
  SPEAKING: {
    type: "SPEAKING",
    label: "Speaking",
    icon: "Mic",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950",
    description: "Speaking practice with AI",
  },
};
