"use client";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";

export default function DashboardRedirectPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    switch (session.user.role) {
      case "user":
        router.replace("/student");
        break;
      case "tutor":
        router.replace("/tutor");
        break;
      case "admin":
        router.replace("/admin");
        break;
      case "etn":
        router.replace("/etn/tutor");
        break;
      default:
        router.replace("/login");
    }
  }, [session, isPending, router]);

  return <div className="p-8 text-center h-screen">Redirecting to your dashboard...</div>;
}
