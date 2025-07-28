import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quiz from "@/models/quiz";
import Booking from "@/models/booking";
import { sendNotification } from "@/lib/server-notifications";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sessionId, tutorId, title, questions } = await req.json();
  if (!sessionId || !tutorId || !title || !questions?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const quiz = await Quiz.create({ sessionId, tutorId, title, questions });
  // Notify all students in the session
  const bookings = await Booking.find({ _id: sessionId });
  for (const booking of bookings) {
    await sendNotification({
      userId: booking.studentId,
      message: `A new quiz has been added for your session.`,
    });
  }
  return NextResponse.json({ quiz });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const studentId = searchParams.get("studentId");
  const sessionId = searchParams.get("sessionId");
  let quizzes = [];
  if (id) {
    const quiz = await Quiz.findById(id);
    quizzes = quiz ? [quiz] : [];
  } else if (studentId) {
    // Find all sessionIds for this student
    const bookings = await Booking.find({ studentId });
    const sessionIds = bookings.map((b: any) => b._id.toString());
    quizzes = await Quiz.find({ sessionId: { $in: sessionIds } });
  } else if (sessionId) {
    quizzes = await Quiz.find({ sessionId });
  } else {
    quizzes = await Quiz.find({});
  }
  return NextResponse.json({ quizzes });
}
