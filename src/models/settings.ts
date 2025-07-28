import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: { type: String, default: "Tutoring Platform" },
  siteDescription: { type: String, default: "Connecting students with the best tutors in Ethiopia" },
  registrationEnabled: { type: Boolean, default: true },
  
  // Security Settings
  passwordMinLength: { type: Number, default: 8 },
  maxLoginAttempts: { type: Number, default: 5 },
  
  // Payment Settings
  commissionRate: { type: Number, default: 15 },
  minimumPayout: { type: Number, default: 50 },
  autoPayouts: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;