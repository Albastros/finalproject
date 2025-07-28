"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import axios from "axios";

export default function StudentMaterialsPage() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchMaterials() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/materials/summary", {
        params: { studentId: session.user.id },
      });
      setMaterials(res.data.rows || []);
      setLoading(false);
    }
    fetchMaterials();
  }, [session]);

  // Fetch tutor names for display
  useEffect(() => {
    async function fetchTutorNames() {
      const uniqueTutorIds = Array.from(new Set(materials.map((m) => m.tutorId)));
      await Promise.all(uniqueTutorIds.map(async (id) => {
        if (!id || tutorNames[id]) return;
        const res = await axios.get(`/api/users?id=${id}`);
        const name = res.data.user?.name || id;
        setTutorNames((prev) => ({ ...prev, [id]: name }));
      }));
    }
    if (materials.length) fetchTutorNames();
  }, [materials]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-0">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 bg-white/40 backdrop-blur-lg shadow-xl border-none rounded-2xl">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">Materials</h2>
      </div>
      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img src="/empty.svg" alt="No materials" className="w-32 h-32 mb-6 opacity-70" />
          <div className="text-xl font-semibold text-blue-400 mb-2">No materials found</div>
          <div className="text-base text-muted-foreground">Your tutor hasn't shared any materials yet.</div>
        </div>
      ) : (
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-300/30 via-purple-300/20 to-pink-300/10 rounded-full blur-2xl animate-pulse -z-10" />
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {materials.map((mat) => (
            <Card
              key={mat._id}
              className="relative flex flex-col gap-4 p-6 shadow-xl backdrop-blur-lg bg-white/40 bg-gradient-to-br from-blue-100/60 via-white/80 to-purple-100/60 border-none transition-transform hover:scale-[1.03] hover:shadow-2xl"
              style={{ borderRadius: '1.5rem', border: '1px solid rgba(180,180,255,0.18)' }}
            >
              {/* Material type badge */}
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-semibold">
                  {mat.subject || "General"}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 font-semibold">
                  {mat.sessionDate}
                </Badge>
              </div>
              {/* Title and preview */}
              <div className="flex gap-4 items-center">
                <div className="flex-shrink-0">
                  {/* PDF preview or icon */}
                  {mat.fileUrl.match(/\.pdf$/i)
                    ? <img src="/file.svg" alt="PDF" className="w-12 h-12 object-contain rounded-lg shadow" />
                    : <img src={mat.fileUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg shadow" />}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="font-bold text-lg text-blue-700 truncate" title={mat.title || mat.fileUrl}>{mat.title || "Untitled Material"}</div>
                  <div className="text-xs text-gray-500">Session: {mat.sessionName || mat.sessionDate}</div>
                </div>
              </div>
              {/* Tutor info and timestamp */}
              <div className="flex gap-2 items-center mt-2">
                <Avatar className="w-8 h-8">
                  <span className="text-base font-bold text-blue-700">{tutorNames[mat.tutorId]?.[0] || "?"}</span>
                </Avatar>
                <span className="text-xs text-blue-700 font-semibold">{tutorNames[mat.tutorId] || mat.tutorId}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {/* Calendar icon for updated time */}
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v8H4V7z" />
                  </svg>
                  Uploaded {new Date(mat.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              {/* View/download actions */}
              <div className="flex gap-2 mt-2">
                <Button asChild size="sm" variant="outline" className="w-fit transition-all duration-200 hover:scale-105">
                  <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-110 flex items-center gap-2"
                  onClick={e => {
                    e.preventDefault();
                    const link = document.createElement('a');
                    link.href = mat.fileUrl;
                    link.download = mat.title || 'material';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
