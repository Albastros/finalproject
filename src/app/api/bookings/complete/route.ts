import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  booking.status = "completed";
  await booking.save();
  return NextResponse.json({ booking });
}
