import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import LandingNavbar from "@/components/landing/LandingNavbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "TutoringPlatform",
  description: "Connecting students with the best tutors in Ethiopia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LandingNavbar />
          <Toaster position="top-center" />
          <Script src="https://meet.jit.si/external_api.js" strategy="beforeInteractive" />
          {children}
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
