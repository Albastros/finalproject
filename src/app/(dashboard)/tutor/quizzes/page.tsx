"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";

export default function TutorQuizzesPage() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<string, any>>({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchQuizzes() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/quizzes/summary", {
        params: { tutorId: session.user.id },
      });
      setQuizzes(res.data.rows || []);
      setLoading(false);
    }
    fetchQuizzes();
  }, [session]);

  async function handleSelectQuiz(quizId: string) {
    setSelectedQuizId(quizId);
    setResultsLoading(true);
    // Fetch all results for this quiz
    const res = await axios.get(`/api/quiz-results?quizId=${quizId}`);
    const results = res.data.results || [];
    setQuizResults(results);
    // Fetch student info in batch
    if (results.length > 0) {
      const studentIds = Array.from(new Set(results.map((r: any) => r.studentId)));
      const usersRes = await axios.get(`/api/users?ids=${studentIds.join(",")}`);
      const usersArr = usersRes.data.users || [];
      const userMap: Record<string, any> = {};
      usersArr.forEach((u: any) => {
        userMap[u._id] = u;
      });
      setStudents(userMap);
    } else {
      setStudents({});
    }
    setResultsLoading(false);
  }

  async function handleViewDetails(result: any) {
    setSelectedResult(result);
    setDetailsLoading(true);
    try {
      console.log("Fetching quiz details for:", result.quizId);
      // Fetch quiz questions using correct API format
      const quizRes = await axios.get(`/api/quizzes?id=${result.quizId}`);
      console.log("Quiz API response:", quizRes.data);
      const quiz = quizRes.data.quizzes?.[0] || null;
      setQuizQuestions(quiz?.questions || []);
      console.log("Quiz questions set:", quiz?.questions || []);
    } catch (error) {
      console.error("Failed to fetch quiz details:", error);
    }
    setDetailsLoading(false);
  }

  if (loading) return <div className="p-8 text-center">Loading quizzes...</div>;
  if (!quizzes.length) return <div className="text-muted-foreground">No quizzes created yet.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
          <TabsTrigger value="results">Quiz Results</TabsTrigger>
        </TabsList>
        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz._id}
                    className="relative flex flex-col gap-4 p-6 rounded-3xl shadow-2xl border border-indigo-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-indigo-300/40 group"
                    style={{ boxShadow: '0 4px 24px 0 rgba(112, 80, 255, 0.10)' }}
                  >
                    {/* Decorative gradient accent */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 opacity-30 rounded-full blur-xl group-hover:opacity-50 transition-all duration-500" />
                    <div className="font-bold text-lg truncate text-indigo-700 group-hover:text-purple-700 transition-colors duration-300" title={quiz.title}>
                      {quiz.title}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 mt-1">
                      {quiz.subject && <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 shadow">Subject: {quiz.subject}</span>}
                      <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 text-purple-700 shadow">{quiz.sessionDate} {quiz.sessionTime}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="block font-bold text-lg text-indigo-700 mb-2">Select a quiz:</label>
                <div className="relative">
                  <select
                    className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
                    value={selectedQuizId || ""}
                    onChange={(e) => handleSelectQuiz(e.target.value)}
                  >
                    <option value="">-- Select Quiz --</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
              {resultsLoading ? (
                <div className="py-8 text-center text-indigo-500 animate-pulse text-lg font-semibold">Loading results...</div>
              ) : selectedQuizId ? (
                quizResults.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-base font-medium">No students have taken this quiz yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="rounded-3xl shadow-2xl border border-indigo-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
                            <th className="px-6 py-4 text-base font-bold text-indigo-700 tracking-tight rounded-tl-3xl">Student Name</th>
                            <th className="px-6 py-4 text-base font-bold text-purple-700 tracking-tight">Email</th>
                            <th className="px-6 py-4 text-base font-bold text-pink-700 tracking-tight">Taken At</th>
                            <th className="px-6 py-4 text-base font-bold text-slate-700 tracking-tight rounded-tr-3xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quizResults.map((res: any, i: number) => {
                            const user = students[res.studentId];
                            return (
                              <tr
                                key={res._id}
                                className={`transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 ${i % 2 === 0 ? 'bg-white/60 dark:bg-slate-800/60' : 'bg-indigo-50/40 dark:bg-slate-700/40'} rounded-xl`}
                                style={{ boxShadow: '0 2px 12px 0 rgba(112, 80, 255, 0.08)', borderRadius: '1rem' }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-base font-bold text-white shadow border-2 border-white">
                                    {user?.name?.[0] || res.studentId?.[0] || "?"}
                                  </div>
                                  <span className="font-semibold text-indigo-700 text-sm">{user?.name || res.studentId}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-purple-100 via-pink-100 to-indigo-100 text-purple-700 font-semibold text-xs shadow border border-purple-200/40">
                                    {user?.email || "-"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-pink-100 via-indigo-100 to-purple-100 text-pink-700 font-semibold text-xs shadow border border-pink-200/40">
                                    {res.createdAt ? new Date(res.createdAt).toLocaleString() : "-"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewDetails(res)}
                                    className="text-xs border-indigo-300 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl px-4 py-2 transition-all hover:bg-indigo-50 hover:scale-105 hover:shadow"
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-8 text-center text-indigo-400 text-base font-semibold animate-pulse">Select a quiz to view student results.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Detailed View Modal */}
      {selectedResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-200">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Quiz Details - {students[selectedResult.studentId]?.name || 'Student'}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div 
              className="flex-1 overflow-y-scroll p-6"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF #F3F4F6',
                minHeight: '400px'
              }}
            >
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Score:</strong> {(() => {
                    const correctCount = quizQuestions.filter((q: any, index: number) => {
                      const studentAnswerIndex = selectedResult.selectedAnswers?.[index];
                      const correctAnswerIndex = q.correctAnswerIndex;
                      return studentAnswerIndex === correctAnswerIndex;
                    }).length;
                    return `${correctCount}/${quizQuestions.length}`;
                  })()}</div>
                  <div><strong>Total Questions:</strong> {quizQuestions.length}</div>
                  <div><strong>Correct Answers:</strong> {quizQuestions.filter((q: any, index: number) => {
                    const studentAnswerIndex = selectedResult.selectedAnswers?.[index];
                    const correctAnswerIndex = q.correctAnswerIndex;
                    return studentAnswerIndex === correctAnswerIndex;
                  }).length}</div>
                  <div><strong>Missed Questions:</strong> {quizQuestions.filter((q: any, index: number) => {
                    const studentAnswerIndex = selectedResult.selectedAnswers?.[index];
                    const correctAnswerIndex = q.correctAnswerIndex;
                    return studentAnswerIndex !== correctAnswerIndex;
                  }).length}</div>
                </div>
              </div>
              
              {detailsLoading ? (
                <div className="text-center py-8">Loading quiz details...</div>
              ) : quizQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No quiz questions found.</p>
                  <p className="text-sm mt-2">Quiz ID: {selectedResult?.quizId}</p>
                  <p className="text-sm">Check browser console for more details.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Questions and Answers:</h3>
                  {quizQuestions.map((question: any, index: number) => {
                    const studentAnswerIndex = selectedResult.selectedAnswers?.[index];
                    const selectedOption = question.options?.[studentAnswerIndex];
                    const correctAnswerIndex = question.correctAnswerIndex;
                    const correctAnswer = question.options?.[correctAnswerIndex];
                    const isCorrect = studentAnswerIndex === correctAnswerIndex;
                    
                    return (
                      <div key={index} className={`p-4 border rounded ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            Question {index + 1}: {question.question}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Missed'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {question.options?.map((option: string, optIndex: number) => {
                            const isStudentChoice = selectedOption === option;
                            const isCorrectAnswer = optIndex === correctAnswerIndex;
                            
                            return (
                              <div key={optIndex} className={`p-2 rounded ${
                                isCorrectAnswer ? 'bg-green-100 border border-green-300' : 
                                isStudentChoice && !isCorrectAnswer ? 'bg-red-100 border border-red-300' : 
                                'bg-gray-100'
                              }`}>
                                <span className="flex items-center gap-2">
                                  {isStudentChoice && (
                                    <span className="text-blue-600 font-bold">→</span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className="text-green-600 font-bold">✓</span>
                                  )}
                                  {option}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {!isCorrect && (
                          <div className="mt-2 text-xs text-red-600">
                            <strong>Student selected:</strong> {selectedOption || 'No answer'} | 
                            <strong> Correct answer:</strong> {correctAnswer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
