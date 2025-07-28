import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import Booking from "@/models/booking";
import { addMonths, addDays, format, isBefore, parseISO } from "date-fns";
import getUserSession from "@/hooks/use-get-user-session";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const {
    tutorId,
    startDate,
    durationInMonths,
    subject,
    message,
    weekdays, // Changed from single weekday to array
    time,
    price: priceFromClient,
  } = await req.json();
  
  if (!tutorId || !startDate || !durationInMonths || !weekdays || !Array.isArray(weekdays) || weekdays.length === 0 || !time) {
    console.log("Missing required fields");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  
  const studentId = session.user.id;
  const tutor = await User.findOne({ _id: tutorId, role: "tutor", isVerified: true });
  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }
  
  const start = parseISO(startDate);
  const end = addMonths(start, durationInMonths);
  let bookings = [];
  let firstSessionDate = null;
  let price = priceFromClient || tutor.price || 100;
  
  // Generate bookings for all selected weekdays
  for (let d = start; isBefore(d, end); d = addDays(d, 1)) {
    const day = format(d, "EEEE").toLowerCase();
    if (weekdays.includes(day)) {
      const sessionDate = format(d, "yyyy-MM-dd");
      const sessionTime = time;
      
      const bookingObj = {
        tutorId,
        studentId,
        sessionDate,
        sessionTime,
        subject,
        message,
        isPaid: false,
        price,
        status: "pending",
      };
      
      if (!firstSessionDate) firstSessionDate = sessionDate;
      bookings.push(bookingObj);
    }
  }
  
  // Calculate total sessions and payment
  const totalSessions = bookings.length;
  const totalPayment = price * totalSessions;
  
  if (!bookings.length) {
    return NextResponse.json({ error: "No sessions could be scheduled for the selected weekdays" }, { status: 400 });
  }
  
  const inserted = await Booking.insertMany(bookings);
  
  // Send notifications with detailed information
  const { sendNotification } = await import("@/lib/server-notifications");
  
  // Notify student
  await sendNotification({
    userId: studentId,
    message: `Your recurring sessions have been scheduled! ${totalSessions} sessions over ${durationInMonths} month(s) for ${weekdays.join(', ')}. Total: ${totalPayment} ETB`,
    type: "success",
  });
  
  // Notify tutor
  await sendNotification({
    userId: tutorId,
    message: `New recurring booking from ${session.user.name}! ${totalSessions} sessions scheduled for ${weekdays.join(', ')} - Subject: ${subject}`,
    type: "info",
  });
  
  return NextResponse.json({
    success: true,
    tutorName: tutor.name,
    firstSessionDate,
    sessions: inserted,
    totalSessions,
    totalPayment,
    weekdays,
    durationInMonths,
  });
}
