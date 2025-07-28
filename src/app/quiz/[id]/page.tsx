"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface Quiz {
  _id: string;
  sessionId: string;
  tutorId: string;
  title: string;
  questions: {
    question: string;
    chapterTitle: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
}

interface QuizResult {
  studentId: string;
  quizId: string;
  selectedAnswers: number[];
  score: number;
  incorrectChapters: string[];
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retakeMode, setRetakeMode] = useState(false);

  useEffect(() => {
    // Reset state on quiz id change
    setResult(null);
    setSelected([]);
    setRetakeMode(false);
    setQuiz(null);
    setLoading(true);
    // If ?start=1, force retake mode
    if (searchParams.get("start") === "1") {
      setRetakeMode(true);
    }
    async function fetchQuiz() {
      setLoading(true);
      // Always fetch quiz by id directly
      const res = await fetch(`/api/quizzes?id=${params.id}`);
      let quizData;
      try {
        quizData = (await res.json()).quizzes?.[0];
      } catch {
        quizData = null;
      }
      setQuiz(quizData);
      if (session?.user?.id && quizData && !retakeMode && searchParams.get("start") !== "1") {
        const rres = await fetch(
          `/api/quiz-results?studentId=${session.user.id}&quizId=${quizData._id}`
        );
        const rdata = await rres.json();
        setResult(rdata.result);
        setSelected(rdata.result?.selectedAnswers || Array(quizData.questions.length).fill(-1));
      } else if (quizData) {
        setSelected(Array(quizData.questions.length).fill(-1));
      }
      setLoading(false);
    }
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, session?.user?.id, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz || !session?.user?.id) return;
    setSubmitting(true);
    const res = await fetch("/api/quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: session.user.id,
        quizId: quiz._id,
        selectedAnswers: selected,
      }),
    });
    const data = await res.json();
    setResult(data.result);
    setRetakeMode(false);
    toast.success("Quiz submitted!");
    setSubmitting(false);
  }

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!quiz) return <div className="p-8 text-center text-red-600">Quiz not found.</div>;

  // If result exists and not in retake mode, show result view
  if (result && !retakeMode) {
    return (
      <div className="flex flex-col items-center min-h-[80vh] p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Quiz Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-lg font-semibold">
              Score: {result.score} / {quiz.questions.length}
            </div>
            {result.incorrectChapters.length > 0 && (
              <div>
                <span className="font-semibold">Missed Chapters:</span>{" "}
                {result.incorrectChapters.join(", ")}
              </div>
            )}
            <div className="mt-4">
              <div className="font-semibold mb-2">Question Breakdown</div>
              <div className="flex flex-col gap-4">
                {quiz.questions.map((q, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <div className="font-semibold">
                      Q{idx + 1}: {q.question}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{q.chapterTitle}</div>
                    <div className="mb-1">
                      <span className="font-semibold">Your Answer:</span>{" "}
                      <span
                        className={
                          result.selectedAnswers[idx] === q.correctAnswerIndex
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {q.options[result.selectedAnswers[idx]] ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Correct Answer:</span>{" "}
                      {q.options[q.correctAnswerIndex]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              className="w-fit self-end mt-4"
              variant="outline"
              onClick={() => {
                setRetakeMode(true);
                setResult(null);
                setSelected(Array(quiz.questions.length).fill(-1));
              }}
            >
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz attempt form
  return (
    <div className="flex flex-col items-center min-h-[80vh] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="border rounded p-4">
                <div className="font-semibold mb-1">
                  Q{idx + 1}: {q.question}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{q.chapterTitle}</div>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={oIdx}
                        checked={selected[idx] === oIdx}
                        onChange={() => {
                          setSelected((prev) => {
                            const arr = [...prev];
                            arr[idx] = oIdx;
                            return arr;
                          });
                        }}
                        required
                      />
                      <span>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button type="submit" className="w-fit self-end" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
