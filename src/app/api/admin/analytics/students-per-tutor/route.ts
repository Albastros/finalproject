import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import Booking from "@/models/booking";

export async function GET(req: NextRequest) {
  await dbConnect();
  const studentsAgg = await Booking.aggregate([
    { $group: { _id: "$tutorId", students: { $addToSet: "$studentId" } } },
    { $project: { tutorId: "$_id", studentsCount: { $size: "$students" } } },
  ]);
  const tutorIds = studentsAgg.map((s) => s.tutorId);
  const tutors = await User.find({ _id: { $in: tutorIds } }).select("_id name");
  const tutorsMap = tutors.reduce(
    (acc, t) => {
      acc[t._id.toString()] = t.name;
      return acc;
    },
    {} as Record<string, string>
  );
  const result = studentsAgg.map((s) => ({
    tutorId: s.tutorId,
    tutorName: tutorsMap[s.tutorId.toString()] || "Unknown",
    students: s.studentsCount,
  }));
  return NextResponse.json(result);
}
