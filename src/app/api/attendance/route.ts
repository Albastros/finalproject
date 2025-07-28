import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/attendance";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sessionId, studentId, tutorId, present } = await req.json();
  if (!sessionId || !studentId || !tutorId || typeof present !== "boolean") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const attendance = await Attendance.findOneAndUpdate(
    { sessionId, studentId, tutorId },
    { present },
    { upsert: true, new: true }
  );
  return NextResponse.json({ attendance });
}
