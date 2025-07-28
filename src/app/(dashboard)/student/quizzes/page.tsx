"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function StudentQuizzesPage() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/quizzes/summary", {
        params: { studentId: session.user.id },
      });
      setQuizzes(res.data.rows || []);
      setLoading(false);
    }
    fetchQuizzes();
  }, [session]);

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;
  if (!quizzes.length) return <div className="text-muted-foreground">No quizzes assigned yet.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => {
              const result = quiz.result;
              return (
                <Card key={quiz._id} className="flex flex-col gap-2 p-4">
                  <div className="font-medium text-base truncate" title={quiz.title}>
                    {quiz.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {quiz.subject && <span>Subject: {quiz.subject} | </span>}
                    {quiz.sessionDate} {quiz.sessionTime}
                  </div>
                  <div className="text-xs text-gray-400">
                    Status: {result ? "✅ Completed" : "❌ Not Attempted"}
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
                    <a href={result ? `/quiz/${quiz._id}` : `/quiz/${quiz._id}?start=1`}>
                      {result ? "View Result" : "Start Quiz"}
                    </a>
                  </Button>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
