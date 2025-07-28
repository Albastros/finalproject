/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth/auth-client";
export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onRequest: (ctx: any) => {
          setLoading(true);
        },
        onResponse: (ctx: any) => {
          toast.error("Logged out successfully");
          setLoading(false);
        },
      },
    });
  }
  return (
    <Button variant={"outline"} onClick={() => handleLogOut()}>
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
    </Button>
  );
}
