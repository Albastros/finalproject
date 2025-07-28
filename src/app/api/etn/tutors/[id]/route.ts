import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import { requireEtn } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const user = await requireEtn(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const tutor = await User.findById(params.id)
      .select('name email phone bio subjects experience languages resumeUrls certificateUrls profileImage nationalIdUrl price location gender tutoringType availability createdAt')
      .lean();
    
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }
    
    return NextResponse.json({ tutor });
    
  } catch (error) {
    console.error("Error fetching tutor details:", error);
    return NextResponse.json({ error: "Failed to fetch tutor details" }, { status: 500 });
  }
}


