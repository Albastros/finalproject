import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import Payment from "@/models/payment";

export async function GET(req: NextRequest) {
  await dbConnect();
  const earnings = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$tutorId", earnings: { $sum: "$amount" } } },
  ]);
  const tutorIds = earnings.map((e) => e._id);
  const tutors = await User.find({ _id: { $in: tutorIds } }).select("_id name");
  const tutorsMap = tutors.reduce(
    (acc, t) => {
      acc[t._id.toString()] = t.name;
      return acc;
    },
    {} as Record<string, string>
  );
  const result = earnings.map((e) => ({
    tutorId: e._id,
    tutorName: tutorsMap[e._id.toString()] || "Unknown",
    earnings: e.earnings,
  }));
  return NextResponse.json(result);
}
