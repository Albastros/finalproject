import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import getUserSession from "@/hooks/use-get-user-session";
import { sendNotification } from "@/lib/server-notifications";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    // Direct session check for ETN
    const session = await getUserSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }
    
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== "etn") {
      return NextResponse.json({ error: "ETN access required" }, { status: 401 });
    }
    
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    
    const tutor = await User.findOneAndUpdate(
      { email, role: "tutor" },
      { $set: { role: "user", isVerified: false } },
      { new: true }
    );
    
    if (!tutor) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    
    // Notify tutor about rejection
    await sendNotification({
      userId: tutor._id.toString(),
      message: "Your tutor application has been rejected by ETN.",
      type: "alert",
    });
    
    return NextResponse.json({ success: true, user: tutor });
  } catch (error) {
    console.error("Reject tutor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
