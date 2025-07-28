import { NextRequest, NextResponse } from "next/server";
import Notification from "@/models/models/notification";
import dbConnect from "@/lib/db";
import getUserSession from "@/hooks/use-get-user-session";

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { userId, message, link, type } = body;
  if (!userId || !message) {
    return NextResponse.json({ error: "Missing userId or message" }, { status: 400 });
  }
  const notification = await Notification.create({
    userId,
    message,
    link,
    type: type || "info",
    read: false,
  });
  return NextResponse.json({ notification });
}
