import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import getUserSession from "@/hooks/use-get-user-session";
import Material from "@/models/material";
import Rating from "@/models/rating";
import Attendance from "@/models/attendance";
import QuizResult from "@/models/quizResult";
import Booking from "@/models/booking";

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  // Materials
  const materials = await Material.find({ sessionId: bookingId }).sort({ uploadedAt: -1 });
  // Ratings
  const ratings = await Rating.find({ $or: [{ bookingId }, { sessionId: bookingId }] }).sort({
    createdAt: -1,
  });
  // Attendance
  const attendance = await Attendance.find({ sessionId: bookingId });
  // Quiz Results
  const quizResults = await QuizResult.find({ quizId: bookingId });
  return NextResponse.json({ materials, ratings, attendance, quizResults });
}
