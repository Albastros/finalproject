import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import getUserSession from "@/hooks/use-get-user-session";
import { sendNotification } from "@/lib/server-notifications";


export async function PATCH(req: NextRequest) {
  await dbConnect();
  
  // Check if user is admin or ETN
  const session = await getUserSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await User.findOne({ email: session.user.email });
  if (!user || (user.role !== "admin" && user.role !== "etn")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  
  const tutor = await User.findOneAndUpdate(
    { email, role: "tutor" },
    { $set: { role: "user", isVerified: false } },
    { new: true }
  );
  
  if (!tutor) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
  // return NextResponse.json({ success: true, user: tutor });
  
  // if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Notify tutor
  await sendNotification({
    userId: user._id.toString(),
    message: "Your tutor application has been rejected by admin.",
    type: "alert",
  });
  return NextResponse.json({ success: true, user });
}
