import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/message";
import { auth } from "@/lib/auth/auth";
import getUserSession from "@/hooks/use-get-user-session";
import { sendNotification } from "@/lib/server-notifications";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { recipientId, message } = await req.json();
  if (!recipientId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const msg = await Message.create({
    senderId: session.user.id,
    recipientId,
    message,
    read: false,
  });
  // Send notification to recipient
  await sendNotification({
    userId: recipientId,
    message: `New message from ${session.user.name || "a user"}.`,
    link: `/chat/${session.user.id}`,
    type: "info",
  });
  return NextResponse.json({ message: msg });
}
