"use client";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

export default function StudentRatingsPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatings() {
      if (!session?.user?.id) return;
      const res = await axios.get("/api/ratings/summary", {
        params: { studentId: session.user.id },
      });
      setRows(res.data.rows || []);
      setLoading(false);
    }
    fetchRatings();
  }, [session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p>No ratings yet.</p>
          ) : (
            <div className="space-y-4">
              {rows.map((rating: any) => (
                <div key={rating._id} className="border p-4 rounded">
                  <p><strong>Tutor:</strong> {rating.tutorName}</p>
                  <p><strong>Score:</strong> {rating.score}/5</p>
                  <p><strong>Comment:</strong> {rating.comment}</p>
                  <p><strong>Date:</strong> {new Date(rating.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
