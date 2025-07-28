import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import { sendNotification } from "@/lib/server-notifications";
import getUserSession from "@/hooks/use-get-user-session";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    // Debug logging
    console.log("ETN verify endpoint called");
    
    const session = await getUserSession();
    console.log("Session:", session);
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }
    
    console.log("Looking for user with email:", session.user.email);
    const currentUser = await User.findOne({ email: session.user.email });
    console.log("Found user:", currentUser);
    
    if (!currentUser) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    
    if (currentUser.role !== "etn") {
      console.log("User role is not ETN, role:", currentUser.role);
      return NextResponse.json({ error: "ETN access required" }, { status: 401 });
    }
    
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    
    const tutor = await User.findOneAndUpdate(
      { email, role: "tutor" },
      { $set: { isVerified: true } },
      { new: true }
    );
    
    if (!tutor) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    
    // Notify tutor about approval
    await sendNotification({
      userId: tutor._id.toString(),
      message: "Your tutor profile has been approved by ETN.",
      type: "info",
    });
    
    return NextResponse.json({ success: true, user: tutor });
  } catch (error) {
    console.error("Verify tutor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
