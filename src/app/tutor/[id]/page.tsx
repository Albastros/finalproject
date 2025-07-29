
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import BookSessionButton from "@/components/tutor/BookSessionButton";
import TutorRatingDisplay from "@/components/tutor/TutorRatingDisplay";
import { Calendar, Clock, NotebookPen, MapPin, Languages, Zap, UserCheck, UserX } from "lucide-react";

interface Tutor {
  _id: string;
  profileImage?: string;
  name: string;
  bio?: string;
  subjects?: string[];
  experience?: number;
  languages?: string[];
  phone?: string;
  resumeUrls?: string[];
  certificateUrls?: string[];
  price?: number;
  location?: string;
  availability?: any;
}

async function getTutor(id: string, baseUrl: string): Promise<Tutor | null> {
  try {
    const res = await fetch(`${baseUrl}/api/tutors/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.tutor || null;
  } catch (error) {
    console.error(`Failed to fetch tutor:`, error);
    return null;
  }
}

// const BookSessionButton = dynamic(() => import("@/components/tutor/BookSessionButton"), {
//   ssr: false,
// });

export default async function TutorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: any;
}) {
  // Await params before using
  const { id } = await params;

  // Get base URL for SSR fetch
  let baseUrl = "";
  if (typeof window === "undefined") {
    // @ts-ignore
    const headers = globalThis?.headers;
    if (headers) {
      const proto = headers.get("x-forwarded-proto") || "http";
      const host = headers.get("host");
      baseUrl = `${proto}://${host}`;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    }
  } else {
    baseUrl = window.location.origin;
  }

  const tutor = await getTutor(id, baseUrl);

  if (!tutor) {
    return (
      <div className="p-8 text-center text-red-600">Tutor not found or failed to load profile.</div>
    );
  }
  return (
    <div className="flex justify-center py-10 min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100/80 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-2xl shadow-2xl rounded-3xl border-2 border-blue-200/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-500">
        <CardHeader className="flex flex-col items-center gap-2 relative">
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-10">
            <Avatar className="h-28 w-28 shadow-lg border-4 border-white">
              {tutor.profileImage ? (
                <AvatarImage src={tutor.profileImage} alt={tutor.name} />
              ) : (
                <AvatarFallback>{tutor.name?.[0]}</AvatarFallback>
              )}
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-extrabold mt-20 text-center bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tight drop-shadow-md">
            {tutor.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-base text-slate-500 dark:text-slate-300 font-semibold">
              {tutor.experience ? `${tutor.experience} yrs experience` : "New tutor"}
            </span>
          </div>
          <div className="text-muted-foreground text-center text-base mt-2 px-2">
            {tutor.bio || "No bio provided."}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 mt-2 px-6 pb-6">
          {/* Subjects */}
          <div className="flex flex-wrap justify-center gap-2">
            {tutor.subjects?.length ? (
              tutor.subjects.map((subj) => (
                <Badge key={subj} variant="outline" className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                  <NotebookPen className="w-3 h-3 text-orange-400" /> {subj}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No subjects listed</span>
            )}
          </div>
          {/* Languages & Location */}
          <div className="flex flex-wrap justify-center gap-2">
            {tutor.languages?.length ? (
              tutor.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Languages className="w-3 h-3 text-blue-400" /> {lang}
                </Badge>
              ))
            ) : null}
            {tutor.location && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <MapPin className="w-3 h-3 text-green-400" /> {tutor.location}
              </Badge>
            )}
          </div>
          {/* Price */}
          <div className="flex justify-center items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-white/80 text-blue-700 font-bold text-base px-4 py-2 shadow-md">
              {tutor.price ?? 100} birr/hr
            </Badge>
          </div>
          {/* Availability */}
          <div className="w-full mt-2">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-500 font-semibold">Availability</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tutor.availability
                ? Object.entries(tutor.availability)
                    .filter(([, v]: any) => v.available)
                    .map(([day, v]: any) => {
                      function formatTime(time: string) {
                        if (!time) return "";
                        const [h, m] = time.split(":");
                        let hour = parseInt(h, 10);
                        const minute = m ? m.padStart(2, "0") : "00";
                        const ampm = hour >= 12 ? "PM" : "AM";
                        hour = hour % 12 || 12;
                        return `${hour}:${minute} ${ampm}`;
                      }
                      return (
                        <Badge key={day} variant="outline" className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white/80 text-blue-700 border-blue-200 shadow hover:bg-blue-50 transition-all duration-200">
                          <Clock className="w-3 h-3 text-blue-400" />
                          {day.charAt(0).toUpperCase() + day.slice(1)}: {formatTime(v.from)} - {formatTime(v.to)}
                        </Badge>
                      );
                    })
                : <span className="text-xs text-gray-400 italic">Not set</span>}
            </div>
          </div>
          {/* Book Session Button */}
          <div className="w-full mt-4">
            <BookSessionButton tutor={tutor} price={tutor.price ?? 100} />
          </div>
          {/* Rating */}
          <div className="flex flex-col items-center mt-2">
            <TutorRatingDisplay tutorId={tutor._id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
