// ==========================================
// Custom Materials Types
// ==========================================

// Enums
export type CustomMaterialSourceType = 
  | "PDF" 
  | "DOCX" 
  | "IMAGE" 
  | "YOUTUBE" 
  | "WEBSITE" 
  | "TEXT";

export type CustomMaterialStatus = 
  | "PENDING" 
  | "PROCESSING" 
  | "COMPLETED" 
  | "FAILED";

export type AiCorrectionMode = "STRICT" | "POLITE";

export type TargetOption = 
  | "VOCABULARY" 
  | "QUIZ" 
  | "SUMMARY" 
  | "ROLE_PLAY" 
  | "SHADOWING";

export type StyleType = 
  | "FORMAL" 
  | "CASUAL" 
  | "EMAIL" 
  | "PRESENTATION" 
  | "SOCIAL_MEDIA";

// ==========================================
// Input Metadata
// ==========================================

export interface InputMetadata {
  pageStart?: number;
  pageEnd?: number;
  timeStart?: number; // seconds
  timeEnd?: number;   // seconds
}

// ==========================================
// Generated Content Types
// ==========================================

export interface VocabularyItem {
  id: string;
  term: string;
  definition: string;
  example: string;
  partOfSpeech?: string;
  ipa?: string;
  contextNote?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank" | "true_false";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface ShadowingSentence {
  id: string;
  text: string;
  audioUrl?: string;
  ipa?: string;
  translation?: string;
}

export interface RolePlayContext {
  scenario: string;
  yourRole: string;
  aiRole: string;
  objectives: string[];
  suggestedOpening?: string;
}

export interface GeneratedContent {
  schemaVersion: number;
  vocabulary?: VocabularyItem[];
  quiz?: QuizQuestion[];
  summary?: string;
  rolePlay?: RolePlayContext;
  shadowing?: ShadowingSentence[];
}

// ==========================================
// Request DTOs
// ==========================================

export interface CreateMaterialRequest {
  title: string;
  sourceType: CustomMaterialSourceType;
  sourceUrl?: string;
  rawText?: string;
  inputMetadata?: InputMetadata;
  targetOptions: TargetOption[];
  aiCorrectionMode?: AiCorrectionMode;
  stylelearnMode?: boolean;
  syncVocabToSrs?: boolean;
}

export interface UpdateContentRequest {
  generatedContent: GeneratedContent;
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string | null;
}

export interface StyleTransformRequest {
  text: string;
  targetStyle: StyleType;
  includeExplanation?: boolean;
}

// ==========================================
// Response DTOs
// ==========================================

export interface MaterialSettings {
  targetOptions: TargetOption[];
  aiCorrectionMode: AiCorrectionMode;
  styleLearnMode: boolean;
  syncVocabToSrs: boolean;
}

export interface CustomMaterial {
  id: string;
  userId: string;
  title: string;
  sourceType: CustomMaterialSourceType;
  originalFileUrl?: string;
  contentText?: string;
  inputMetadata?: InputMetadata;
  settings?: MaterialSettings;
  generatedContent?: GeneratedContent;
  status: CustomMaterialStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaterialListItem {
  id: string;
  title: string;
  sourceType: CustomMaterialSourceType;
  status: CustomMaterialStatus;
  vocabularyCount?: number;
  quizCount?: number;
  hasSummary?: boolean;
  hasRolePlay?: boolean;
  hasShadowing?: boolean;
  createdAt: string;
}

export interface MaterialStatusResponse {
  id: string;
  status: CustomMaterialStatus;
  errorMessage?: string;
  progress?: number;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

// ==========================================
// Chat Types
// ==========================================

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ChatMessageResponse {
  sessionId: string;
  aiResponse: string;
  corrections?: GrammarError[];
}

export interface PerformanceReport {
  totalMessages: number;
  score: number;
  grammarErrors: GrammarError[];
  vocabularySuggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface EndChatResponse {
  sessionId: string;
  duration: number; // seconds
  performanceReport: PerformanceReport;
}

// ==========================================
// Style Transform Types
// ==========================================

export interface StyleExplanation {
  original: string;
  changed: string;
  reason: string;
}

export interface StyleTransformResponse {
  transformedText: string;
  explanations?: StyleExplanation[];
}

// ==========================================
// Shadowing Types
// ==========================================

export interface ShadowingScoreResponse {
  score: number;
  feedback: string;
  phonemeBreakdown?: Record<string, number>;
}

// ==========================================
// UI State Types
// ==========================================

export interface UploadState {
  file: File | null;
  sourceUrl: string;
  rawText: string;
  sourceType: CustomMaterialSourceType | null;
  inputMetadata: InputMetadata;
  isValid: boolean;
  error: string | null;
}

export interface ConfigState {
  title: string;
  targetOptions: TargetOption[];
  aiCorrectionMode: AiCorrectionMode;
  styleLearnMode: boolean;
  syncVocabToSrs: boolean;
}

export interface ChatSessionState {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isEnded: boolean;
  performanceReport: PerformanceReport | null;
}
