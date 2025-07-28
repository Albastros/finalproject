import { z } from "zod";
import { getSystemSettings } from "@/lib/settings";

// Enhanced email validation regex based on RFC standards
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Custom email validation function
const validateEmail = (email: string) => {
  if (!email || email.trim() === "") return false;
  if (email.length > 254) return false;
  
  // Check if email starts with @ or ends with @ or has no @ symbol
  if (email.startsWith('@') || email.endsWith('@') || !email.includes('@')) {
    return false;
  }
  
  // Check if email has exactly one @ symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return false;
  
  // Check basic format
  if (!emailRegex.test(email)) return false;
  
  const [localPart, domain] = email.split('@');
  
  // Check if local part is empty
  if (!localPart || localPart.trim() === "") return false;
  
  // Check if domain is empty or invalid
  if (!domain || domain.trim() === "" || domain === ".com" || !domain.includes('.')) {
    return false;
  }
  
  // Local part validation
  if (localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.startsWith('-') || localPart.endsWith('-')) return false;
  if (localPart.includes('..')) return false;
  
  // Domain validation
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.includes('..')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  return true;
};

// Create dynamic password schema based on system settings
export const createPasswordSchema = async () => {
  const settings = await getSystemSettings();
  return z.string().min(settings.passwordMinLength, `Password must be at least ${settings.passwordMinLength} characters`);
};

export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .max(254, "Email must not exceed 254 characters")
    .refine(validateEmail, "Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createRegisterSchema = async () => {
  const settings = await getSystemSettings();
  return z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string()
        .min(1, "Email is required")
        .max(254, "Email must not exceed 254 characters")
        .refine(validateEmail, "Please enter a valid email address"),
      password: z
        .string()
        .min(settings.passwordMinLength, `Password must be at least ${settings.passwordMinLength} characters`)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
};

export const createProfileUpdateSchema = async () => {
  const settings = await getSystemSettings();
  return z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string()
        .min(1, "Email is required")
        .max(254, "Email must not exceed 254 characters")
        .refine(validateEmail, "Please enter a valid email address"),
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
      confirmNewPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
          return data.currentPassword && data.newPassword && data.confirmNewPassword;
        }
        return true;
      },
      {
        message: "All password fields must be filled to change password",
        path: ["newPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.confirmNewPassword) {
          return data.newPassword === data.confirmNewPassword;
        }
        return true;
      },
      {
        message: "New passwords do not match",
        path: ["confirmNewPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword) {
          return data.newPassword.length >= settings.passwordMinLength;
        }
        return true;
      },
      {
        message: `New password must be at least ${settings.passwordMinLength} characters`,
        path: ["newPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
          return passwordRegex.test(data.newPassword);
        }
        return true;
      },
      {
        message: "New password must contain at least one uppercase letter, one lowercase letter, and one number",
        path: ["newPassword"],
      }
    );
};

const serviceSchema = z.object({
  name: z
    .string()
    .min(3, "Service name must be at least 3 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Service description must be at least 10 characters")
    .max(500, "Service description cannot exceed 500 characters"),
  price: z.number().min(1, "Price must be at least 1"),
  duration: z.string().min(1, "Duration is required"),
});

export const serviceProviderSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  location: z.string().min(1, "Location is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(150, "Description cannot exceed 150 characters"),
  serviceType: z.string().min(1, "Service type is required"),
  hourlyRate: z.number().min(1, "Hourly rate must be at least 1"),
  about: z
    .string()
    .min(50, "About must be at least 50 characters")
    .max(2000, "About cannot exceed 2000 characters"),
  services: z.array(serviceSchema).min(1, "At least one service is required"),
});

export type ServiceProviderFormData = z.infer<typeof serviceProviderSchema>;
