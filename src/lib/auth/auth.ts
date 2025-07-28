import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, magicLink } from "better-auth/plugins";
import { sendEmail } from "./email-service";
import dbConnect from "../db";
import { nextCookies } from "better-auth/next-js";
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from "./login-attempts";
import {
  emailVerificationTemplate,
  magicLinkTemplate,
  passwordResetTemplate,
} from "./templates/templates";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/models/models/User";

await dbConnect();
const db = mongoose.connection.db;

if (!db) {
  throw new Error("Database connection is not established.");
}

export const auth = betterAuth({
  database: mongodbAdapter(db),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async verifyPassword({ password, hash }) {
      return await bcrypt.compare(password, hash);
    },
    async signIn({ email, password }) {
      await dbConnect();
      
      const loginCheck = await checkLoginAttempts(email);
      if (!loginCheck.allowed) {
        throw new Error(loginCheck.message || "Account temporarily locked");
      }
      
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        await recordFailedLogin(email);
        throw new Error("Invalid email or password");
      }

      if (!user.emailVerified) {
        throw new Error("Please verify your email before signing in");
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        await recordFailedLogin(email);
        throw new Error("Invalid email or password");
      }
      
      await resetLoginAttempts(email);
      
      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          image: user.image || user.profileImage
        }
      };
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: passwordResetTemplate(url),
      });
    },
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html: emailVerificationTemplate(url),
      });
    },
  },
  plugins: [
    admin(),
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        await sendEmail({
          to: email,
          subject: "Sign In to Service Inc",
          html: magicLinkTemplate(url),
        });
      },
    }),
  ],
});
