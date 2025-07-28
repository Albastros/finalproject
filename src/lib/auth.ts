import getUserSession from "@/hooks/use-get-user-session";
import User from "@/models/models/User";
import { NextRequest } from "next/server";

export async function requireEtn(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session?.user?.email) {
      return null;
    }
    
    const user = await User.findOne({ 
      email: session.user.email, 
      role: "etn" 
    });
    
    return user;
  } catch (error) {
    console.error("ETN auth error:", error);
    return null;
  }
}




