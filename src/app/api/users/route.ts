import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");
  if (ids) {
    const idArr = ids.split(",");
    const users = await User.find({ _id: { $in: idArr } }).select("_id name email role");
    return NextResponse.json({ users });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }
  const user = await User.findById(id).select("-password -__v");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}
