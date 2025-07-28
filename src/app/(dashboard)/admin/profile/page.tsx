
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSession } from "@/hooks/use-session";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt="Profile picture"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            )}
            <div className="text-lg font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.email}</div>
            <div className="text-sm mt-2 px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">
              Role: {user.role}
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="px-4 py-2 rounded bg-primary text-white text-sm font-medium">
                Share profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
