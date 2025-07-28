import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Material from "@/models/material";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const tutorId = searchParams.get("tutorId");

  if (!studentId && !tutorId) {
    return NextResponse.json({ error: "Missing studentId or tutorId" }, { status: 400 });
  }

  let bookings = [];
  if (studentId) {
    bookings = await Booking.find({ studentId }).lean();
  } else if (tutorId) {
    bookings = await Booking.find({ tutorId }).lean();
  }

  const sessionIds = bookings.map((b) => b._id.toString());
  const materials = await Material.find({ sessionId: { $in: sessionIds } }).lean();
  const bookingMap = Object.fromEntries(bookings.map((b) => [b._id.toString(), b]));

  const rows = materials.map((mat) => {
    const booking = bookingMap[mat.sessionId?.toString() || ""] || {};
    return {
      _id: mat._id,
      title: mat.title,
      fileUrl: mat.fileUrl,
      uploadedAt: mat.uploadedAt,
      subject: booking.subject || "",
      sessionDate: booking.sessionDate || "",
      sessionTime: booking.sessionTime || "",
    };
  });

  return NextResponse.json({ rows });
}
