export interface PlacementQuestion {
  id: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  category: 'GRAMMAR' | 'VOCABULARY' | 'SITUATIONAL';
}

export interface PlacementAnswer {
  questionId: string;
  selectedOption: string;
}

export interface PlacementSubmission {
  answers: PlacementAnswer[];
}

export interface PlacementResult {
  score: number;
  totalQuestions: number;
  assignedLevel: string;
  message: string;
  assignedLearningPathId: number | null;
  assignedLearningPathName: string | null;
}
