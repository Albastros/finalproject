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
              <div className="grid gap-4 md:grid-cols-2">
                {quizzes.map((quiz) => (
                  <Card key={quiz._id} className="flex flex-col gap-2 p-4">
                    <div className="font-medium text-base truncate" title={quiz.title}>
                      {quiz.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quiz.subject && <span>Subject: {quiz.subject} | </span>}
                      {quiz.sessionDate} {quiz.sessionTime}
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
                      {/* <a href={`/quiz/${quiz._id}`}>View/Edit</a> */}
                    </Button>
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
              <div className="mb-4">
                <label className="block font-medium mb-2">Select a quiz:</label>
                <select
                  className="w-full border rounded px-3 py-2"
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
              </div>
              {resultsLoading ? (
                <div>Loading results...</div>
              ) : selectedQuizId ? (
                quizResults.length === 0 ? (
                  <div>No students have taken this quiz yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border">Student Name</th>
                          <th className="px-3 py-2 border">Email</th>
                          <th className="px-3 py-2 border">Taken At</th>
                          <th className="px-3 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizResults.map((res: any) => {
                          const user = students[res.studentId];
                          return (
                            <tr key={res._id}>
                              <td className="px-3 py-2 border">{user?.name || res.studentId}</td>
                              <td className="px-3 py-2 border">{user?.email || "-"}</td>
                              <td className="px-3 py-2 border">
                                {res.createdAt ? new Date(res.createdAt).toLocaleString() : "-"}
                              </td>
                              <td className="px-3 py-2 border">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(res)}
                                  className="text-xs"
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
                )
              ) : (
                <div>Select a quiz to view student results.</div>
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
