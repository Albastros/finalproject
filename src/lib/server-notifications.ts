import Notification from "@/models/models/notification";

export async function sendNotification({
  userId,
  message,
  link,
  type = "info",
}: {
  userId: string;
  message: string;
  link?: string;
  type?: "info" | "warning" | "alert";
}) {
  return await Notification.create({
    userId,
    message,
    link,
    type,
  });
}
