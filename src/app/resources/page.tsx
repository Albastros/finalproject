"use client";

import { useSession } from "@/hooks/use-session";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Material {
  _id: string;
  sessionId: string;
  tutorId: string;
  fileUrl: string;
  title?: string;
  uploadedAt: string;
}

interface Booking {
  _id: string;
  tutorId: string;
  studentId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
}

function MaterialList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <div className="p-4 text-center text-gray-500">No materials found.</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      {materials.map((m) => (
        <Card
          key={m._id}
          className="flex flex-col md:flex-row items-start md:items-center gap-2 p-4"
        >
          <div className="flex-1">
            <div className="font-medium text-sm">{m.title || "Untitled Material"}</div>
            <div className="text-xs text-gray-400">Session: {m.sessionId}</div>
            <div className="text-xs text-gray-400">
              Uploaded: {new Date(m.uploadedAt).toLocaleString()}
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
              View
            </a>
          </Button>
        </Card>
      ))}
    </div>
  );
}

function MaterialsClient() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      if (!session?.user?.id || !session?.user?.role) return;
      // Fetch bookings for this user
      const bookingsRes = await axios.get("/api/bookings", {
        params:
          session.user.role === "tutor"
            ? { tutorId: session.user.id }
            : { studentId: session.user.id },
      });
      const bookings: Booking[] = bookingsRes.data.bookings;
      // Fetch materials for each session
      const allMaterials: Material[] = [];
      for (const booking of bookings) {
        try {
          const matRes = await axios.get("/api/materials", { params: { sessionId: booking._id } });
          if (matRes.data.materials) {
            allMaterials.push(...matRes.data.materials);
          }
        } catch {}
      }
      setMaterials(allMaterials);
      setLoading(false);
    }
    fetchMaterials();
  }, [session]);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading materials...</div>;
  return <MaterialList materials={materials} />;
}

export default function MaterialsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={<div className="p-4 text-center text-gray-500">Loading materials...</div>}
          >
            <MaterialsClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
