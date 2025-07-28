"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function TutorMaterialsPage() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/materials/summary", {
        params: { tutorId: session.user.id },
      });
      setMaterials(res.data.rows || []);
      setLoading(false);
    }
    fetchMaterials();
  }, [session]);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading materials...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center text-gray-500">No materials found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {materials.map((mat) => (
                <Card key={mat._id} className="flex flex-col gap-2 p-4">
                  <div className="font-medium text-base truncate" title={mat.title || mat.fileUrl}>
                    {mat.title || "Untitled Material"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {mat.subject && <span>Subject: {mat.subject} | </span>}
                    {mat.sessionDate} {mat.sessionTime}
                  </div>
                  <div className="text-xs text-gray-400">
                    Uploaded: {new Date(mat.uploadedAt).toLocaleString()}
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-2 w-fit">
                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
