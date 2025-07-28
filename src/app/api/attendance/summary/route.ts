import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Attendance from "@/models/attendance";
import User from "@/models/models/User";

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
  const attendanceRecords = await Attendance.find({ sessionId: { $in: sessionIds } }).lean();

  let userMap: Record<string, any> = {};
  if (tutorId) {
    // For tutor, fetch all student names
    const studentIds = [...new Set(bookings.map((b) => b.studentId))];
    const users = await User.find({ _id: { $in: studentIds } }).select("_id name");
    userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));
  }

  const rows = bookings.map((booking) => {
    const attendance = attendanceRecords.find(
      (a) =>
        a.sessionId.toString() === booking._id.toString() &&
        (studentId ? a.studentId === studentId : a.studentId === booking.studentId)
    );
    // Format time as HH:mm (hour and minute)
    let formattedTime = booking.sessionTime;
    if (booking.sessionTime) {
      // If only hour is provided, add :00
      if (/^\d{1,2}$/.test(booking.sessionTime)) {
        formattedTime = booking.sessionTime.padStart(2, '0') + ':00';
      } else if (/^\d{1,2}:\d{1,2}$/.test(booking.sessionTime)) {
        // Ensure both hour and minute are two digits
        const [h, m] = booking.sessionTime.split(":");
        formattedTime = h.padStart(2, '0') + ':' + m.padStart(2, '0');
      }
    }
    return {
      subject: booking.subject,
      date: booking.sessionDate,
      time: formattedTime,
      present: attendance?.present === true ? "Present" : "Absent",
      ...(tutorId && { student: userMap[booking.studentId] || booking.studentId }),
    };
  });

  return NextResponse.json({ rows });
}
