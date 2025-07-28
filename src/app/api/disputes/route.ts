import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import User from "@/models/models/User";
import { sendNotification } from "@/lib/server-notifications";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const includeResolved = searchParams.get("includeResolved") === "true";

  const query: any = {
    "dispute.filed": true,
  };

  // Only filter for unresolved if not explicitly including resolved
  if (!includeResolved) {
    query["dispute.resolved"] = false;
  }

  const bookings = await Booking.find(query).sort({ "dispute.filedAt": -1 });

  // Get user names for display
  const userIds = [
    ...new Set([...bookings.map((b) => b.studentId), ...bookings.map((b) => b.tutorId)]),
  ];

  const users = await User.find({ _id: { $in: userIds } }).select("_id name");
  const userMap = Object.fromEntries(users.map((user) => [user._id.toString(), user.name]));

  return NextResponse.json({ bookings, userMap });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { bookingId, reason, bankAccountName, bankAccountNumber, bankCode } = await req.json();
  if (!bookingId || !reason) {
    return NextResponse.json({ error: "Missing bookingId or reason" }, { status: 400 });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.dispute?.filed) {
    return NextResponse.json({ error: "Dispute already filed for this booking" }, { status: 400 });
  }
  booking.dispute = {
    filed: true,
    reason,
    resolved: false,
    filedAt: new Date(),
    bankAccountName,
    bankAccountNumber,
    bankCode,
  };
  await booking.save();

  // Notify admin(s), tutor, and student
  const User = (await import("@/models/models/User")).default;
  const admins = await User.find({ role: "admin" }).select("_id");
  const notifications = [
    ...admins.map((admin: any) =>
      sendNotification({
        userId: admin._id.toString(),
        message: `A new dispute has been filed for booking ${bookingId}.`,
        type: "alert",
      })
    ),
    sendNotification({
      userId: booking.tutorId,
      message: `A dispute has been filed for your session by the student.`,
      type: "warning",
    }),
    sendNotification({
      userId: booking.studentId,
      message: `Your dispute for session has been filed and is under review.`,
      type: "info",
    }),
  ];
  await Promise.all(notifications);

  return NextResponse.json({ success: true, booking });
}
