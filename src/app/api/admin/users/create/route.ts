import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const { name, email, password, role = "user" } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      originalPassword: password, // Store original password (SECURITY RISK)
      role,
      emailVerified: true, // Admin created users are auto-verified
      isVerified: role === "tutor" ? false : true, // Tutors need separate verification
    });
    
    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();
    
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
