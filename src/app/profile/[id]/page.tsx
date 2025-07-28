import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getUser(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/users?id=${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser(params.id);
  
  if (!user) {
    notFound();
  }

  return (
    <div className="flex justify-center py-10 min-h-[80vh] bg-muted/50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2">
          <Image
            src={user.profileImage || user.image || "/profile-mock.jpg"}
            alt={user.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-white -mt-12"
          />
          <CardTitle className="text-2xl font-bold mt-2">{user.name}</CardTitle>
          {user.bio && (
            <div className="text-muted-foreground text-center text-sm mt-1">
              {user.bio}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-2 px-6 pb-4">
          {user.role === "tutor" && (
            <>
              {user.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.subjects.map((subject: string) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
              
              {user.experience && (
                <div className="text-sm text-muted-foreground">
                  Experience: {user.experience} years
                </div>
              )}
              
              {user.price && (
                <div className="text-lg font-semibold text-green-600">
                  ${user.price}/hour
                </div>
              )}
            </>
          )}
          
          <div className="text-sm text-muted-foreground">
            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}