import User from "@/models/models/User";
import { getSystemSettings } from "@/lib/settings";

const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export async function checkLoginAttempts(email: string) {
  const settings = await getSystemSettings();
  const user = await User.findOne({ email }).select('+loginAttempts +lockUntil');
  
  if (!user) return { allowed: true };
  
  // Check if account is currently locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
    return { 
      allowed: false, 
      message: `Account locked. Try again in ${remainingTime} minutes.`,
      lockUntil: user.lockUntil
    };
  }
  
  return { allowed: true };
}

export async function recordFailedLogin(email: string) {
  const settings = await getSystemSettings();
  const user = await User.findOne({ email });
  
  if (!user) return;
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account if max attempts reached
  if (user.loginAttempts + 1 >= settings.maxLoginAttempts) {
    updates.$set = {
      lockUntil: new Date(Date.now() + LOCK_TIME)
    };
  }
  
  await User.updateOne({ email }, updates);
}

export async function resetLoginAttempts(email: string) {
  await User.updateOne(
    { email },
    { $unset: { loginAttempts: 1, lockUntil: 1 } }
  );
}