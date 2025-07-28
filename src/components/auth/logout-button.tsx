"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
          toast.loading("Logging out...");
          setLoading(true);
        },
        onResponse: (ctx: any) => {
          toast.error("Logged out successfully");
          setLoading(false);
        },
      },
    });
  }
  return <button onClick={() => handleLogOut()}>{loading ? "Logging out..." : "Log out"}</button>;
}
