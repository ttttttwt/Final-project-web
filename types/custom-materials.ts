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
  | "SOCIAL_MEDIA"
  | "DIPLOMATIC"
  | "PERSUASIVE";

// ==========================================
// Style Transform Types
// ==========================================

export interface StyleExplanation {
  original?: string;
  changed?: string;
  reason: string;
}

export interface StyleTransformRequest {
  text: string;
  targetStyle: StyleType;
  includeExplanation: boolean;
}

export interface StyleTransformResponse {
  transformedText: string;
  explanations?: StyleExplanation[];
}

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
  id?: string;              // Optional - AI may not generate this
  word?: string;            // AI often returns this field
  term?: string;            // Original expected field (fallback)
  definition: string;
  example?: string;
  partOfSpeech?: string;
  ipa?: string;
  context?: string;         // AI returns this for usage context
  contextNote?: string;     // Legacy field (fallback)
}

export interface QuizQuestion {
  id?: string;
  type?: "multiple_choice" | "fill_blank" | "true_false";
  question: string;
  options?: string[];
  answer?: string;          // AI returns this
  correctAnswer?: string | number;  // Legacy/fallback
  explanation?: string;
}

export interface ShadowingSentence {
  id: string;
  sentence?: string;        // AI returns this
  text?: string;            // Fallback/Legacy
  phonetic?: string;        // AI returns this
  ipa?: string;             // Fallback/Legacy
  notes?: string;           // AI returns this
  translation?: string;     // Optional
  audioUrl?: string;
}

export interface RolePlayDialogue {
  speaker: string;
  dialogue: string;
}

export interface RolePlayContext {
  // Required fields (match RolePlayScenarioDTO)
  scenario: string;
  yourRole: string;
  aiRole: string;
  objectives: string[];
  
  // Optional from existing RolePlayScenarioDTO
  title?: string;
  suggestedOpening?: string;
  openingLine?: string;
  keyVocabulary?: VocabularyItem[] | string[];
  suggestedPrompts?: string[];
  contextDetails?: {
    setting?: string;
    situation?: string;
    keyInfo?: string[];
    yourGoal?: string;
    tips?: string[];
  };
  
  // New fields for Custom Materials
  userCharacter?: string;  // Name of character user plays
  aiCharacter?: string;    // Name of AI character
  description?: string;
  sampleDialogues?: RolePlayDialogue[];
}

export interface GeneratedContent {
  schemaVersion: number;
  vocabulary?: VocabularyItem[];
  quiz?: QuizQuestion[];
  summary?: string;
  rolePlay?: RolePlayContext;
  roleplay?: RolePlayContext;  // Backend may return lowercase
  shadowing?: ShadowingSentence[];
}

// ==========================================
// Request DTOs
// ==========================================

export interface MaterialSettingsInput {
  aiCorrectionMode?: AiCorrectionMode;
  styleLearnMode?: boolean;
  syncVocabToSrs?: boolean;
  generateFlashcardImages?: boolean;
}

export interface CreateMaterialRequest {
  title: string;
  sourceType: CustomMaterialSourceType;
  sourceUrl?: string;
  rawText?: string;
  inputMetadata?: InputMetadata;
  targetOptions: TargetOption[];
  settings?: MaterialSettingsInput;
}

export interface UpdateContentRequest {
  generatedContent: GeneratedContent;
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string | null;
}

// Note: StyleTransformRequest is defined above in "Style Transform Types" section

// ==========================================
// Response DTOs
// ==========================================

export interface MaterialSettings {
  targetOptions: TargetOption[];
  aiCorrectionMode: AiCorrectionMode;
  styleLearnMode: boolean;
  syncVocabToSrs: boolean;
  generateFlashcardImages?: boolean;
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
  corrections?: GrammarError[];
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
// Shadowing Types (StyleExplanation and StyleTransformResponse defined above)
// ==========================================

// ==========================================
// Shadowing Types
// ==========================================

export interface WordScore {
  word: string;
  score: number;
  note: string;
}

export interface ShadowingScoreResponse {
  score: number;
  feedback: string;
  phonemeBreakdown?: Record<string, WordScore>;
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
  generateFlashcardImages: boolean;
}

export interface ChatSessionState {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isEnded: boolean;
  performanceReport: PerformanceReport | null;
}
