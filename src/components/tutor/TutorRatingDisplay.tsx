"use client";
import { useEffect, useState } from "react";
import { StarRating } from "@/components/ui/star-rating";

export default function TutorRatingDisplay({ tutorId }: { tutorId: string }) {
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  useEffect(() => {
    if (!tutorId) return;
    fetch(`/api/ratings/summary?tutorId=${tutorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.rows && data.rows.length > 0) {
          const scores = data.rows.map((r: any) => r.score);
          const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          setRating({ avg, count: scores.length });
        } else {
          setRating({ avg: 0, count: 0 });
        }
      });
  }, [tutorId]);

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="flex items-center gap-2">
        <StarRating value={rating.avg || 0} onChange={() => {}} disabled />
        <span className="text-sm text-muted-foreground">
          {rating.avg ? rating.avg.toFixed(1) : "No rating yet"}
        </span>
      </div>
      {rating.count ? (
        <span className="text-xs text-gray-500">
          {rating.count} rating{rating.count > 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}
