import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const tutors = await User.find({ role: "tutor", isVerified: false }).lean();
  return NextResponse.json({ tutors });
}
