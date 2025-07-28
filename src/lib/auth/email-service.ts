import { Resend } from "resend";

// Temporary fix: Use a placeholder API key if not provided
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key");

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    // Check if we have a real API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_placeholder_key") {
      console.log("📧 Email would be sent to:", to);
      console.log("📧 Subject:", subject);
      console.log("📧 Email service not configured - using mock mode");
      return { success: true, data: { id: "mock-email-id" } };
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      // Name <email@example.com>
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
}
