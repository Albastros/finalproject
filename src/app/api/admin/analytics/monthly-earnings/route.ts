import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/booking";

export async function GET(req: NextRequest) {
  await dbConnect();
  const monthly = await Booking.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalPaid: { $sum: "$price" },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  const result = monthly.map((m) => ({
    year: m._id.year,
    month: m._id.month,
    totalPaid: m.totalPaid,
    platformEarnings: m.totalPaid * 0.3,
    tutorEarnings: m.totalPaid * 0.7,
    sessions: m.sessions,
  }));
  return NextResponse.json(result);
}
