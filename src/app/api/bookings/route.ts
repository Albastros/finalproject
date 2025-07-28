import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import { sendNotification } from "@/lib/server-notifications";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const tutorId = body.tutorId;
  const studentId = body.studentId;
  const price = body.price;
  const sessionDate = body.sessionDate || "TBD";
  const sessionTime = body.sessionTime || "TBD";
  const subject = body.subject || "TBD";
  const message = body.message || "";
  const sessionType = body.sessionType || "individual";

  if (!tutorId || !studentId || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check for any booking at the same slot
  const slotQuery = {
    tutorId,
    sessionDate,
    sessionTime,
    status: { $in: ["pending", "confirmed"] },
  };

  if (sessionType === "individual") {
    // Individual + anything = block
    const existingBooking = await Booking.findOne(slotQuery);
    if (existingBooking) {
      return NextResponse.json({ error: "Tutor is already booked for this slot" }, { status: 400 });
    }
    // Create new individual booking
    const booking = await Booking.create({
      tutorId,
      studentId,
      price,
      isPaid: false,
      status: "confirmed",
      sessionDate,
      sessionTime,
      subject,
      message,
      sessionType: "individual",
      maxGroupSize: 1,
      currentGroupSize: 1,
    });
    await sendNotification({
      userId: studentId,
      message: `Your individual session has been confirmed.`,
    });
    await sendNotification({
      userId: tutorId,
      message: `You have a new individual session booking.`,
    });
    return NextResponse.json({ booking });
  }

  if (sessionType === "group") {
    // Group + individual = not allowed
    const individualBooking = await Booking.findOne({
      ...slotQuery,
      sessionType: "individual",
    });
    if (individualBooking) {
      return NextResponse.json(
        { error: "Tutor is already booked for an individual session at this slot" },
        { status: 400 }
      );
    }
    // Group + group = possible
    let groupBooking = await Booking.findOne({
      ...slotQuery,
      sessionType: "group",
    });
    if (groupBooking) {
      // If group is full, block
      if ((groupBooking.currentGroupSize || 1) >= (groupBooking.maxGroupSize || 5)) {
        return NextResponse.json({ error: "Group session is full for this slot" }, { status: 400 });
      }
      // Add student to group (increment currentGroupSize)
      groupBooking.currentGroupSize = (groupBooking.currentGroupSize || 1) + 1;
      await groupBooking.save();
      // Create a booking for this student referencing the group booking
      const booking = await Booking.create({
        tutorId,
        studentId,
        price,
        isPaid: false,
        status: "confirmed",
        sessionDate,
        sessionTime,
        subject,
        message,
        sessionType: "group",
        groupId: groupBooking._id,
        maxGroupSize: groupBooking.maxGroupSize,
        currentGroupSize: 1,
      });
      await sendNotification({
        userId: studentId,
        message: `You have joined a group session.`,
      });
      await sendNotification({
        userId: tutorId,
        message: `A student has joined your group session.`,
      });
      return NextResponse.json({ booking });
    } else {
      // No group booking exists, create new group booking
      const booking = await Booking.create({
        tutorId,
        studentId,
        price,
        isPaid: false,
        status: "confirmed",
        sessionDate,
        sessionTime,
        subject,
        message,
        sessionType: "group",
        maxGroupSize: 5,
        currentGroupSize: 1,
      });
      await sendNotification({
        userId: studentId,
        message: `Your group session has been confirmed.`,
      });
      await sendNotification({
        userId: tutorId,
        message: `You have a new group session booking.`,
      });
      return NextResponse.json({ booking });
    }
  }

  return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const studentId = searchParams.get("studentId");
  const tutorId = searchParams.get("tutorId");
  const status = searchParams.get("status");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const disputesOnly = searchParams.get("disputesOnly");

  if (id) {
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ booking });
  }

  if (!studentId && !tutorId && disputesOnly !== "true") {
    return NextResponse.json({ error: "Missing studentId or tutorId" }, { status: 400 });
  }

  const query: any = {};
  if (studentId) query.studentId = studentId;
  if (tutorId) query.tutorId = tutorId;
  if (status) query.status = status;
  if (fromDate) query.sessionDate = { $gte: fromDate };
  if (toDate) query.sessionDate = { ...(query.sessionDate || {}), $lte: toDate };

  if (disputesOnly === "true") {
    query["dispute.filed"] = true;
    query["dispute.resolved"] = false;
  }

  const bookings = await Booking.find(query).sort({ sessionDate: 1, sessionTime: 1 });
  return NextResponse.json({ bookings });
}
