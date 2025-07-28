import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/message";
import User from "@/models/models/User";
import { auth } from "@/lib/auth/auth";
import getUserSession from "@/hooks/use-get-user-session";

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const myId = session.user.id;
  // Get all messages where user is sender or recipient
  const messages = await Message.find({
    $or: [{ senderId: myId }, { recipientId: myId }],
  }).sort({ createdAt: -1 });

  // Group by conversation (other user)
  const threads: Record<string, any> = {};
  for (const msg of messages) {
    const otherId = msg.senderId === myId ? msg.recipientId : msg.senderId;
    if (!threads[otherId]) {
      threads[otherId] = {
        userId: otherId,
        lastMessage: msg.message,
        lastTimestamp: msg.createdAt,
        read: msg.senderId !== myId ? msg.read : true,
      };
    }
  }
  // Fetch user info for each thread
  const userIds = Object.keys(threads);
  interface IUserLean {
    _id: string;
    name?: string;
    profileImage?: string;
    image?: string;
  }

  const users = await User.find({ _id: { $in: userIds } }).lean<IUserLean[]>();
  users.forEach((user) => {
    const userId = user._id.toString();
    if (threads[userId]) {
      threads[userId].name = user.name ?? "";
      threads[userId].avatar = user.profileImage ?? user.image ?? null;
    }
  });
  return NextResponse.json({ conversations: Object.values(threads) });
}
