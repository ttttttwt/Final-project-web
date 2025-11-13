"use client";

/**
 * Content Renderer Component
 * Renders lesson content based on lesson type (READING, LISTENING, QUIZ, SPEAKING)
 */

import React from "react";
import {
  BookOpen,
  Headphones,
  Volume2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  LessonType,
  ReadingContent,
  ListeningContent,
  QuizContent,
  SpeakingContent,
} from "@/types/lesson";

interface ContentRendererProps {
  lessonType: LessonType;
  parsedContent:
    | ReadingContent
    | ListeningContent
    | QuizContent
    | SpeakingContent;
}

export default function ContentRenderer({
  lessonType,
  parsedContent,
}: ContentRendererProps) {
  switch (lessonType) {
    case "READING":
      return (
        <ReadingContentRenderer content={parsedContent as ReadingContent} />
      );
    case "LISTENING":
      return (
        <ListeningContentRenderer content={parsedContent as ListeningContent} />
      );
    case "QUIZ":
      return <QuizContentRenderer content={parsedContent as QuizContent} />;
    case "SPEAKING":
      return (
        <SpeakingContentRenderer content={parsedContent as SpeakingContent} />
      );
    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          Unknown lesson type
        </div>
      );
  }
}

// ==================== READING RENDERER ====================

function ReadingContentRenderer({ content }: { content: ReadingContent }) {
  return (
    <div className="space-y-6">
      {/* Passages */}
      {content.passages.map((passage, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {passage.title || `Passage ${index + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {passage.text}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Vocabulary */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.vocabulary.map((vocab, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{vocab.word}</h4>
                    {vocab.partOfSpeech && (
                      <Badge variant="outline" className="text-xs">
                        {vocab.partOfSpeech}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {vocab.definition}
                  </p>
                  {vocab.example && (
                    <p className="text-sm italic text-muted-foreground">
                      &ldquo;{vocab.example}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehension Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {content.questions.map((question, index) => (
              <div key={index} className="pb-6 border-b last:border-0">
                <h4 className="font-medium mb-3">
                  {index + 1}. {question.question}
                </h4>
                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <Button
                        key={optIndex}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        disabled
                      >
                        <span className="mr-2 font-semibold">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== LISTENING RENDERER ====================

function ListeningContentRenderer({ content }: { content: ListeningContent }) {
  const [showTranscript, setShowTranscript] = React.useState(
    content.showTranscript || false
  );

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-green-600" />
            Listening Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <audio
              controls
              className="w-full"
              src={content.audioUrl}
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Duration: {Math.floor(content.duration / 60)}:
                {String(content.duration % 60).padStart(2, "0")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {showTranscript ? "Hide" : "Show"} Transcript
              </Button>
            </div>
            {showTranscript && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {content.transcript}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.vocabulary.map((vocab, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h4 className="font-semibold text-lg mb-2">{vocab.word}</h4>
                  <p className="text-sm text-muted-foreground">
                    {vocab.definition}
                  </p>
                  {vocab.timestamp !== undefined && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      @ {vocab.timestamp}s
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehension Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {content.questions.map((question, index) => (
              <div key={index} className="pb-6 border-b last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium flex-1">
                    {index + 1}. {question.question}
                  </h4>
                  {question.timestamp !== undefined && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      @ {question.timestamp}s
                    </Badge>
                  )}
                </div>
                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <Button
                        key={optIndex}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        disabled
                      >
                        <span className="mr-2 font-semibold">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                {question.explanation && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== QUIZ RENDERER ====================

function QuizContentRenderer({ content }: { content: QuizContent }) {
  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <CardTitle>{content.title || "Quiz"}</CardTitle>
          {content.instructions && (
            <p className="text-sm text-muted-foreground">
              {content.instructions}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {content.timeLimit && (
              <span>
                ⏱️ Time Limit: {Math.floor(content.timeLimit / 60)}min
              </span>
            )}
            {content.passingScore && (
              <span>✓ Passing Score: {content.passingScore}%</span>
            )}
            <span>📝 {content.questions.length} Questions</span>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {content.questions.map((question, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  Question {index + 1}
                  {question.points && (
                    <Badge variant="secondary" className="ml-2">
                      {question.points} pts
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <p className="text-base font-normal mt-2">{question.question}</p>
            </CardHeader>
            <CardContent>
              {question.hint && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    💡 <strong>Hint:</strong> {question.hint}
                  </p>
                </div>
              )}
              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <Button
                      key={optIndex}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      disabled
                    >
                      <span className="mr-2 font-semibold">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}
              {question.type === "true_false" && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-auto py-3"
                    disabled
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    True
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-auto py-3"
                    disabled
                  >
                    <XCircle className="mr-2 h-5 w-5 text-red-600" />
                    False
                  </Button>
                </div>
              )}
              {question.explanation && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== SPEAKING RENDERER ====================

function SpeakingContentRenderer({ content }: { content: SpeakingContent }) {
  return (
    <div className="space-y-6">
      {/* Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-orange-600" />
            Speaking Practice
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={
                content.difficulty === "beginner"
                  ? "bg-green-100 text-green-800"
                  : content.difficulty === "intermediate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {content.difficulty.charAt(0).toUpperCase() +
                content.difficulty.slice(1)}
            </Badge>
            {content.rolePlaySettings?.turns && (
              <Badge variant="outline">
                {content.rolePlaySettings.turns} turns
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Scenario:</h3>
          <p className="text-muted-foreground">{content.scenario}</p>
          {content.rolePlaySettings?.aiPersona && (
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>AI Role:</strong> {content.rolePlaySettings.aiPersona}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Prompts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Practice Prompts</h3>
        {content.prompts.map((prompt, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">
                Prompt {index + 1}: {prompt.prompt}
              </CardTitle>
              {prompt.context && (
                <p className="text-sm text-muted-foreground mt-1">
                  {prompt.context}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {prompt.sampleAnswers && prompt.sampleAnswers.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">
                    Sample Answers:
                  </h4>
                  <ul className="space-y-1">
                    {prompt.sampleAnswers.map((answer, ansIndex) => (
                      <li
                        key={ansIndex}
                        className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-500"
                      >
                        &ldquo;{answer}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {prompt.targetGrammar && prompt.targetGrammar.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-semibold mb-1">
                    Target Grammar:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prompt.targetGrammar.map((grammar, gramIndex) => (
                      <Badge key={gramIndex} variant="outline">
                        {grammar}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {prompt.targetVocabulary &&
                prompt.targetVocabulary.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      Key Vocabulary:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {prompt.targetVocabulary.map((vocab, vocabIndex) => (
                        <Badge
                          key={vocabIndex}
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          {vocab}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for AI Role-play */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Volume2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">AI Role-play Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Interactive AI-powered speaking practice will be available in Sprint
            4. For now, practice these prompts on your own or with a study
            partner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
