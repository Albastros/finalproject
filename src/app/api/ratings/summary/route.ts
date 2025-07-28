import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Rating from "@/models/rating";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const tutorId = searchParams.get("tutorId");

  if (!studentId && !tutorId) {
    return NextResponse.json({ error: "Missing studentId or tutorId" }, { status: 400 });
  }

  let ratings = [];
  if (studentId) {
    ratings = await Rating.find({ studentId }).lean();
  } else if (tutorId) {
    ratings = await Rating.find({ tutorId }).lean();
  }

  const sessionIds = ratings.map((r) => r.sessionId).filter(Boolean);
  const bookings = await Booking.find({ _id: { $in: sessionIds } }).lean();
  const bookingMap = Object.fromEntries(bookings.map((b) => [b._id.toString(), b]));

  let userMap: Record<string, any> = {};
  if (tutorId) {
    // For tutor, fetch all student names
    const studentIds = [...new Set(ratings.map((r) => r.studentId))];
    const users = await User.find({ _id: { $in: studentIds } }).select("_id name");
    userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));
  }

  const rows = ratings.map((rating) => {
    const booking = bookingMap[rating.sessionId?.toString() || ""] || {};
    return {
      subject: booking.subject || "",
      date: booking.sessionDate || "",
      time: booking.sessionTime || "",
      score: rating.score,
      comment: rating.comment,
      ...(tutorId && { student: userMap[rating.studentId] || rating.studentId }),
    };
  });

  return NextResponse.json({ rows });
}
