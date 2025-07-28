import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "cancelled" },
    { new: true }
  );
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
