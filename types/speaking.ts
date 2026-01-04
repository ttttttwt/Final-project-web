export interface WordScore {
  word: string;
  score: number;
  note?: string;
}

export interface GrammarIssue {
  originalText: string;
  correction: string;
  rule: string;
  explanation: string;
}

export interface GrammarFeedback {
  issues: GrammarIssue[];
  usedTargetStructures: string[];
  missedStructures: string[];
  suggestion: string;
  score: number;
}

export interface VocabularyFeedback {
  usedTargetWords: string[];
  missedWords: string[];
  advancedWords: string[];
  suggestion: string;
  score: number;
}

export interface SpeakingAssessmentResponse {
  noSpeechDetected?: boolean;
  transcription: string;
  pronunciationScore: number;
  pronunciationFeedback: string;
  wordBreakdown?: Record<string, WordScore>;
  grammarFeedback: GrammarFeedback;
  vocabularyFeedback: VocabularyFeedback;
  overallScore: number;
  promptId: string;
}
