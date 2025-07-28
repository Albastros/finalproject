import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.role !== "tutor") {
    return NextResponse.json({ error: "Only tutors can be approved" }, { status: 400 });
  }
  user.isVerified = true;
  await user.save();
  return NextResponse.json({ success: true });
}
