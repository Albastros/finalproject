import getUserSession from "@/hooks/use-get-user-session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function TutorProfilePage() {
  const session = await getUserSession();
  const user = session?.user;

  if (!user) {
    return <div className="p-6 text-center">Not logged in.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {user.image && (
              <Image
                src={user.image}
                alt="Profile picture"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            )}
            <div className="text-center">
              <div className="text-xl font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
              <div className="text-sm mt-2 px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">
                Role: {user.role}
              </div>
            </div>
            
            {/* Tutor-specific information */}
            {user.role === "tutor" && (
              <div className="w-full space-y-4">
                {user.bio && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">About</h3>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.phone && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Phone</h3>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  )}
                  
                  {user.experience !== undefined && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Experience</h3>
                      <p className="text-sm">{user.experience} years</p>
                    </div>
                  )}
                  
                  {user.price !== undefined && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Hourly Rate</h3>
                      <p className="text-sm">${user.price}/hour</p>
                    </div>
                  )}
                  
                  {user.tutoringType && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Tutoring Type</h3>
                      <p className="text-sm capitalize">{user.tutoringType}</p>
                    </div>
                  )}
                </div>
                
                {user.certificateUrls && user.certificateUrls.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Certificates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {user.certificateUrls.map((cert: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => window.open(cert, '_blank')}
                          className="text-left p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                        >
                          Certificate {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
