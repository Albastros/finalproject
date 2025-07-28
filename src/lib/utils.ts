import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export async function sendNotification({
//   userId,
//   message,
//   link,
//   type = "info",
// }: {
//   userId: string;
//   message: string;
//   link?: string;
//   type?: "info" | "warning" | "alert";
// }) {
//   return await Notification.create({
//     userId,
//     message,
//     link,
//     type,
//   });
// }
