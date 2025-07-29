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
            <div className="grid gap-8 md:grid-cols-2">
              {materials.map((mat) => {
                // Icon by file type
                let icon = null;
                if (mat.fileUrl.endsWith('.pdf')) {
                  icon = (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-200 via-pink-200 to-purple-200 text-red-700 shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M6 2h9a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path strokeWidth="2" d="M9 12h6"/></svg>
                    </span>
                  );
                } else if (mat.fileUrl.endsWith('.png') || mat.fileUrl.endsWith('.jpg') || mat.fileUrl.endsWith('.jpeg')) {
                  icon = (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 text-blue-700 shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="2.5" strokeWidth="2"/><path strokeWidth="2" d="M21 15l-5-5-4 4-5-5"/></svg>
                    </span>
                  );
                } else {
                  icon = (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 via-slate-200 to-purple-200 text-gray-700 shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/></svg>
                    </span>
                  );
                }
                return (
                  <Card
                    key={mat._id}
                    className="relative flex flex-col gap-4 p-6 rounded-3xl shadow-2xl border border-indigo-200/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-indigo-300/40 group"
                    style={{ boxShadow: '0 4px 24px 0 rgba(112, 80, 255, 0.10)' }}
                  >
                    {/* Decorative gradient accent */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 opacity-30 rounded-full blur-xl group-hover:opacity-50 transition-all duration-500" />
                    <div className="flex items-center gap-4">
                      {icon}
                      <div className="font-bold text-lg truncate text-indigo-700 group-hover:text-purple-700 transition-colors duration-300" title={mat.title || mat.fileUrl}>
                        {mat.title || "Untitled Material"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 mt-1">
                      {mat.subject && <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 shadow">Subject: {mat.subject}</span>}
                      <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 text-purple-700 shadow">{mat.sessionDate} {mat.sessionTime}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Uploaded: <span className="font-semibold text-gray-600">{new Date(mat.uploadedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Button asChild size="sm" variant="outline" className="w-fit font-semibold text-indigo-700 border-indigo-300 rounded-xl shadow hover:bg-indigo-50 hover:scale-105 transition-all duration-300">
                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l4-4m-4 4l4 4" /></svg>
                            View
                          </span>
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-fit font-semibold text-green-700 border-green-300 rounded-xl shadow hover:bg-green-50 hover:scale-105 transition-all duration-300"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = mat.fileUrl;
                          link.download = mat.title || 'material';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-400 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" /></svg>
                          Download
                        </span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
