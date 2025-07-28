import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Rating from "@/models/rating";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { studentId, tutorId, bookingId, sessionId, score, comment } = body;

  if (!studentId || !tutorId || (!bookingId && !sessionId) || !score) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rating = await Rating.create({
    studentId,
    tutorId,
    bookingId,
    sessionId,
    score,
    comment,
  });

  return NextResponse.json({ rating });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const sessionId = searchParams.get("sessionId");
  const query: any = {};
  if (studentId) query.studentId = studentId;
  if (sessionId) query.sessionId = sessionId;
  if (!studentId && !sessionId) {
    return NextResponse.json({ error: "Missing studentId or sessionId" }, { status: 400 });
  }
  const ratings = await Rating.find(query);
  return NextResponse.json({ ratings });
}
