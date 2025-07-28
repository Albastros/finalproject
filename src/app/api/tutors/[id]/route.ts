import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  console.log(params);
  const tutor = await User.findOne({ _id: params.id, role: "tutor", isVerified: true }).lean();
  if (!tutor) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  return NextResponse.json({ tutor });
}
