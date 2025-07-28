import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import Notification from "@/models/models/notification";
import getUserSession from "@/hooks/use-get-user-session";
import User from "@/models/models/User";

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session || session.user.role !== "tutor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { bookingId, newDate, newTime, note } = await req.json();
  if (!bookingId || !newDate || !newTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.tutorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Prevent rescheduling past sessions
  const now = new Date();
  const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}`);
  if (sessionDateTime < now) {
    return NextResponse.json({ error: "Cannot reschedule past sessions" }, { status: 400 });
  }
  // Save old date/time
  const oldDate = booking.sessionDate;
  const oldTime = booking.sessionTime;
  booking.sessionDate = newDate;
  booking.sessionTime = newTime;
  booking.rescheduled = {
    wasRescheduled: true,
    oldDate,
    oldTime,
    note: note || "",
  };
  await booking.save();
  // Get tutor name for notification
  let tutorName = "Your tutor";
  try {
    const tutor = await User.findById(booking.tutorId);
    if (tutor?.name) tutorName = tutor.name;
  } catch {}
  // Send notification to student
  await Notification.create({
    userId: booking.studentId,
    message: `Your session with ${tutorName} has been rescheduled to ${newDate} at ${newTime}.`,
    type: "info",
    read: false,
  });
  return NextResponse.json({ booking });
}
