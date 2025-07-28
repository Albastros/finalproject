import { NextRequest, NextResponse } from "next/server";
import Notification from "@/models/models/notification";
import dbConnect from "@/lib/db";
import getUserSession from "@/hooks/use-get-user-session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  return NextResponse.json({ notification });
}
