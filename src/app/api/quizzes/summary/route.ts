import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Quiz from "@/models/quiz";
import QuizResult from "@/models/quizResult";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const tutorId = searchParams.get("tutorId");

  if (!studentId && !tutorId) {
    return NextResponse.json({ error: "Missing studentId or tutorId" }, { status: 400 });
  }

  let quizzes = [];
  let bookings = [];
  if (studentId) {
    bookings = await Booking.find({ studentId }).lean();
    const sessionIds = bookings.map((b) => b._id.toString());
    quizzes = await Quiz.find({ sessionId: { $in: sessionIds } }).lean();
  } else if (tutorId) {
    quizzes = await Quiz.find({ tutorId }).lean();
    // Fetch all bookings for these quizzes' sessionIds for display info
    const sessionIds = quizzes.map((q) => q.sessionId?.toString()).filter(Boolean);
    bookings = sessionIds.length ? await Booking.find({ _id: { $in: sessionIds } }).lean() : [];
  }

  const bookingMap = Object.fromEntries(bookings.map((b) => [b._id.toString(), b]));

  let quizResultsMap: Record<string, any> = {};
  if (studentId) {
    const quizIds = quizzes.map((q) => q._id.toString());
    const quizResults = await QuizResult.find({ studentId, quizId: { $in: quizIds } }).lean();
    quizResultsMap = Object.fromEntries(quizResults.map((r) => [r.quizId.toString(), r]));
  }

  const rows = quizzes.map((quiz) => {
    const booking = bookingMap[quiz.sessionId?.toString() || ""] || {};
    return {
      _id: quiz._id,
      title: quiz.title,
      sessionId: quiz.sessionId,
      subject: booking.subject || "",
      sessionDate: booking.sessionDate || "",
      sessionTime: booking.sessionTime || "",
      result: studentId ? quizResultsMap[quiz._id.toString()] || null : undefined,
    };
  });

  return NextResponse.json({ rows });
}
