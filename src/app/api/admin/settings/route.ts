import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Settings from "@/models/settings";

export async function GET() {
  try {
    await dbConnect();
    
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        siteName: "Tutoring Platform",
        siteDescription: "Connecting students with the best tutors in Ethiopia",
        registrationEnabled: true,
        passwordMinLength: 8,
        maxLoginAttempts: 5,
        commissionRate: 15,
        minimumPayout: 50,
        autoPayouts: true
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    let settings = await Settings.findOne();
    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new settings
      settings = await Settings.create(body);
    }
    
    return NextResponse.json({ settings, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}