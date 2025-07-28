import getUserSession from "@/hooks/use-get-user-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function StudentProfilePage() {
  const session = await getUserSession();
  const user = session?.user;

  if (!user) {
    return <div className="p-6 text-center">Not logged in.</div>;
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
