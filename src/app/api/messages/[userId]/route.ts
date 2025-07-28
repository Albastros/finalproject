import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/message";
import User from "@/models/models/User";
import { auth } from "@/lib/auth/auth";
import getUserSession from "@/hooks/use-get-user-session";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = params.userId;
  const myId = session.user.id;
  const messages = await Message.find({
    $or: [
      { senderId: myId, recipientId: userId },
      { senderId: userId, recipientId: myId },
    ],
  }).sort({ createdAt: 1 });
  // Fetch user info for both users
  const users = await User.find({ _id: { $in: [myId, userId] } }).lean();
  const userMap: Record<string, { name: string; avatar: string | null }> = {};
  for (const user of users) {
    if (!user._id) continue;
    const id =
      typeof user._id === "object" && "toString" in user._id
        ? user._id.toString()
        : String(user._id);
    userMap[id] = {
      name: user.name,
      avatar: user.profileImage ?? user.image ?? null,
    };
  }
  return NextResponse.json({ messages, users: userMap });
}
