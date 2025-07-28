"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Quiz {
  _id: string;
  sessionId: string;
  tutorId: string;
  title: string;
  questions: any[];
}

interface Session {
  _id: string;
  subject: string;
}

export function StudentQuizzes() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      if (!session?.user?.id) return;
      setLoading(true);
      // Fetch all quizzes (for all sessions)
      const res = await fetch("/api/quizzes?studentId=" + session.user.id);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      // Fetch session subjects
      const sessionIds = Array.from(new Set((data.quizzes || []).map((q: Quiz) => q.sessionId)));
      const subjectMap: Record<string, string> = {};
      await Promise.all(
        sessionIds.map(async (sid) => {
          const sres = await fetch(`/api/bookings?id=${sid}`);
          const sdata = await sres.json();
          subjectMap[sid as string] = sdata.booking?.subject || "";
        })
      );
      setSubjects(subjectMap);
      // Fetch quiz results
      const resultMap: Record<string, any> = {};
      await Promise.all(
        (data.quizzes || []).map(async (quiz: Quiz) => {
          const rres = await fetch(
            `/api/quiz-results?studentId=${session.user.id}&quizId=${quiz._id}`
          );
          const rdata = await rres.json();
          resultMap[quiz._id] = rdata.result;
        })
      );
      setResults(resultMap);
      setLoading(false);
    }
    fetchQuizzes();
  }, [session?.user?.id]);

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;
  if (!quizzes.length) return <div className="text-muted-foreground">No quizzes assigned yet.</div>;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Your Quizzes</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {quizzes.map((quiz) => {
          const result = results[quiz._id];
          return (
            <Card key={quiz._id} className="max-w-md w-full mx-auto">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold">Subject:</span> {subjects[quiz.sessionId]}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  {result ? (
                    <span className="text-green-600">✅ Completed</span>
                  ) : (
                    <span className="text-red-600">❌ Not Attempted</span>
                  )}
                </div>
                <Button asChild>
                  <a href={result ? `/quiz/${quiz._id}` : `/quiz/${quiz._id}?start=1`}>
                    {result ? "View Result" : "Start Quiz"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
