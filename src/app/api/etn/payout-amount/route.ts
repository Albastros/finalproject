import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";
import ETNPayout from "@/models/etnPayout";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const etnId = searchParams.get("etnId");
  if (!etnId) return NextResponse.json({ error: "Missing etnId" }, { status: 400 });
  // Platform earnings: 30% of each paid booking
  const bookings = await Booking.find({ isPaid: true });
  const totalEarnings = bookings.reduce((sum, b) => sum + b.price * 0.3, 0);
  // ETN share: 10% of platform earnings
  const etnShare = totalEarnings * 0.1;
  // Already paid
  const payouts = await ETNPayout.aggregate([
    { $match: { etnId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const alreadyPaid = payouts[0]?.total || 0;
  const amount = Math.max(0, Math.floor(etnShare - alreadyPaid));
  return NextResponse.json({ amount });
}
