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
    weekday,
    time,
    price: priceFromClient,
  } = await req.json();
  if (!tutorId || !startDate || !durationInMonths || !weekday || !time) {
    console.log("Missing required fields");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const studentId = session.user.id;
  const tutor = await User.findOne({ _id: tutorId, role: "tutor", isVerified: true });
  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }
  const avail = tutor.availability;
  const start = parseISO(startDate);
  const end = addMonths(start, durationInMonths);
  let bookings = [];
  let firstSessionDate = null;
  let price = priceFromClient || tutor.price || 100;
  for (
    let d = start;
    isBefore(d, end);
    d = addDays(d, 1)
  ) {
    const day = format(d, "EEEE").toLowerCase();
    if (day === weekday) {
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
  // If no bookings were created, create at least one for the requested startDate/time
  if (!bookings.length) {
    const sessionDate = format(start, "yyyy-MM-dd");
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
    firstSessionDate = sessionDate;
    bookings.push(bookingObj);
  }
  const inserted = await Booking.insertMany(bookings);
  return NextResponse.json({
    success: true,
    tutorName: tutor.name,
    firstSessionDate,
    sessions: inserted,
  });
}
