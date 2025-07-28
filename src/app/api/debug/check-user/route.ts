import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();
  
  const { email, password } = await req.json();
  
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return NextResponse.json({ exists: false });
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  return NextResponse.json({ 
    exists: true, 
    passwordMatch,
    hasPassword: !!user.password,
    provider: user.provider,
    emailVerified: user.emailVerified
  });
}