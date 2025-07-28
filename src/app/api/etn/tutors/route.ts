import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import { requireEtn } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Check ETN authentication
    const user = await requireEtn(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const verified = searchParams.get("verified");
    const rejected = searchParams.get("rejected");
    
    let query: any = {};
    
    if (verified === "true") {
      query.role = "tutor";
      query.isVerified = true;
    } else if (rejected === "true") {
      // Debug: Let's see all users with role "user" first
      const allUsers = await User.find({ role: "user" }).select('name email role isVerified subjects').lean();
      console.log("All users with role 'user':", allUsers);
      
      // Find users who were previously tutors but got rejected
      query.role = "user";
      query.isVerified = false;
      // Look for users who have any tutor-related data
      query.$or = [
        { subjects: { $exists: true, $not: { $size: 0 } } },
        { experience: { $exists: true, $ne: null } },
        { resumeUrls: { $exists: true, $not: { $size: 0 } } },
        { certificateUrls: { $exists: true, $not: { $size: 0 } } },
        { nationalIdUrl: { $exists: true, $ne: null } },
        { bio: { $exists: true, $ne: "" } },
        { price: { $exists: true, $ne: null } }
      ];
    } else {
      // Default: pending tutors
      query.role = "tutor";
      query.isVerified = false;
    }
    
    const tutors = await User.find(query)
    .select('name email phone bio subjects experience languages resumeUrls certificateUrls profileImage nationalIdUrl price location gender tutoringType availability createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    const total = await User.countDocuments(query);
    
    console.log(`Found ${tutors.length} tutors for query:`, query);
    
    return NextResponse.json({ 
      tutors, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error("ETN tutors fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}
