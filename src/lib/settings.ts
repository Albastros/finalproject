import Settings from "@/models/settings";
import dbConnect from "@/lib/db";

let cachedSettings: any = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSystemSettings() {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedSettings && (now - lastFetch) < CACHE_DURATION) {
    return cachedSettings;
  }
  
  try {
    await dbConnect();
    
    let settings = await Settings.findOne().lean();
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
    
    cachedSettings = settings;
    lastFetch = now;
    
    return settings;
  } catch (error) {
    console.error("Failed to fetch system settings:", error);
    // Return default settings on error
    return {
      siteName: "Tutoring Platform",
      siteDescription: "Connecting students with the best tutors in Ethiopia",
      registrationEnabled: true,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      commissionRate: 15,
      minimumPayout: 50,
      autoPayouts: true
    };
  }
}

export function clearSettingsCache() {
  cachedSettings = null;
  lastFetch = 0;
}