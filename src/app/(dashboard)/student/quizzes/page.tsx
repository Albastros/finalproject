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

  if (loading) return (
    <div className="p-8 text-center animate-pulse text-xl text-blue-500">Loading quizzes...</div>
  );
  if (!quizzes.length) return (
    <div className="max-w-3xl mx-auto py-12 flex flex-col items-center">
      <div className="text-3xl font-bold text-blue-600 mb-2">No quizzes assigned yet.</div>
      <div className="text-lg text-muted-foreground">Check back soon for new challenges!</div>
      <svg className="w-16 h-16 mt-4 text-purple-300 animate-bounce" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z"/></svg>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Card className="shadow-xl border-none bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60 backdrop-blur-lg" style={{ borderRadius: '2rem', border: '1px solid rgba(180,180,255,0.18)' }}>
        <CardHeader className="flex flex-col items-center pt-6 pb-2">
          <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <svg className="w-7 h-7 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V7h2v2z"/></svg>
            Quizzes
          </CardTitle>
          <div className="text-md text-muted-foreground mt-1">Your selected exams prepared by tutors</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            {quizzes.map((quiz, idx) => {
              const result = quiz.result;
              return (
                <Card key={quiz._id} className={`flex flex-col gap-4 p-6 relative overflow-hidden shadow-lg border-none bg-gradient-to-tr from-blue-50 via-white to-purple-50 transition-transform hover:scale-[1.03] hover:shadow-2xl`} style={{ borderRadius: '1.5rem', border: '1px solid rgba(180,180,255,0.18)' }}>
                  {/* Decorative accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-300/30 to-blue-300/10 rounded-full blur-2xl -z-10 ${result ? 'animate-pulse' : ''}`} />
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2h8v2H6V7zm0 3h8v2H6v-2zm0 3h5v2H6v-2z"/></svg>
                    <div className="font-bold text-lg truncate" title={quiz.title}>{quiz.title}</div>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2h8v2H6V7zm0 3h8v2H6v-2zm0 3h5v2H6v-2z"/></svg>
                    {quiz.subject}
                  </div>
                  <div className="flex gap-4 items-center text-base font-semibold text-gray-700">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z"/></svg>
                      {quiz.sessionDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4.5V10l3 1.5-1 1.732-4-2V6.5h2z"/></svg>
                      <span className="font-mono text-blue-600">{quiz.sessionTime}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${result ? 'bg-green-200 text-green-700 animate-pulse' : 'bg-yellow-200 text-yellow-700'}`}>
                      {result ? (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><rect width="20" height="20" rx="5" /></svg>
                      )}
                      {result ? 'Completed' : 'Not Attempted'}
                    </span>
                  </div>
                  <Button asChild size="lg" variant={result ? 'default' : 'outline'} className={`mt-2 w-full font-bold text-lg transition-all duration-200 ${result ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white hover:from-green-500 hover:to-blue-500' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}>
                    <a href={result ? `/quiz/${quiz._id}` : `/quiz/${quiz._id}?start=1`}>
                      {result ? "View Result" : "Start Quiz"}
                    </a>
                  </Button>
                  {/* Fun surprise: confetti animation for completed quizzes */}
                  {result && (
                    <div className="absolute bottom-2 right-2 animate-bounce">
                      <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
