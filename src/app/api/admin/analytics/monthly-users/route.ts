import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const monthly = await User.aggregate([
    { $match: { deleted: { $ne: true } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        tutors: {
          $sum: { $cond: [{ $eq: ["$role", "tutor"] }, 1, 0] },
        },
        students: {
          $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  return NextResponse.json(monthly);
}
