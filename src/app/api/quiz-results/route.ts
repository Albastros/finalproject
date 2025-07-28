import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quiz from "@/models/quiz";
import QuizResult from "@/models/quizResult";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { studentId, quizId, selectedAnswers } = await req.json();
  if (!studentId || !quizId || !selectedAnswers) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  let score = 0;
  const incorrectChapters: string[] = [];
  quiz.questions.forEach((q: any, idx: number) => {
    if (selectedAnswers[idx] === q.correctAnswerIndex) {
      score++;
    } else {
      incorrectChapters.push(q.chapterTitle);
    }
  });
  const result = await QuizResult.create({
    studentId,
    quizId,
    selectedAnswers,
    score,
    incorrectChapters,
  });
  return NextResponse.json({ result });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const quizId = searchParams.get("quizId");
  if (quizId && !studentId) {
    // Return all results for this quiz
    const results = await QuizResult.find({ quizId });
    return NextResponse.json({ results });
  }
  if (!studentId || !quizId) {
    return NextResponse.json({ error: "Missing studentId or quizId" }, { status: 400 });
  }
  const result = await QuizResult.findOne({ studentId, quizId });
  return NextResponse.json({ result });
}
