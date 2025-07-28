import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import axios from "axios";
import { useSession } from "@/hooks/use-session";
// import { useRouter } from "next/navigation";
import { initializePayment } from "@/lib/chapa";
import getUserSession from "@/hooks/use-get-user-session";
import dynamic from "next/dynamic";
import BookSessionButton from "@/components/tutor/BookSessionButton";
import TutorRatingDisplay from "@/components/tutor/TutorRatingDisplay";

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
    <div className="flex justify-center py-10 min-h-[80vh] bg-muted/50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2">
          <Image
            src={tutor.profileImage || "/profile-mock.jpg"}
            alt={tutor.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-white -mt-12"
          />
          <CardTitle className="text-2xl font-bold mt-2">{tutor.name}</CardTitle>
          <div className="text-muted-foreground text-center text-sm mt-1">
            {tutor.bio || "No bio provided."}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-2 px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {tutor.subjects?.length ? (
              tutor.subjects.map((subj) => (
                <span
                  key={subj}
                  className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
                >
                  {subj}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No subjects listed</span>
            )}
          </div>
          <div className="flex gap-4 flex-wrap text-sm">
            <span className="inline-block px-2 py-0.5 rounded bg-pink-100 text-pink-700 font-semibold">
              {tutor.experience ? `${tutor.experience} yrs experience` : "-"}
            </span>
            {tutor.languages?.length ? (
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                {tutor.languages.join(", ")}
              </span>
            ) : null}
            {tutor.location && (
              <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 font-semibold">
                {tutor.location}
              </span>
            )}
          </div>
          {/* <div className="flex gap-4 flex-wrap text-sm"> */}
          {/* {tutor.resumeUrls &&
              tutor.resumeUrls.length > 0 &&
              tutor.resumeUrls.map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Resume {tutor.resumeUrls && tutor.resumeUrls.length > 1 ? i + 1 : ""}
                </a>
              ))} */}
          {/* {tutor.certificateUrls &&
              tutor.certificateUrls.length > 0 &&
              tutor.certificateUrls.map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Certificate{" "}
                  {tutor.certificateUrls && tutor.certificateUrls.length > 1 ? i + 1 : ""}
                </a>
              ))} */}
          {/* </div> */}
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold">Availability:</span>{" "}
            {tutor.availability
              ? Object.entries(tutor.availability)
                  .filter(([, v]: any) => v.available)
                  .map(
                    ([day, v]: any) =>
                      `${day.charAt(0).toUpperCase() + day.slice(1)}: ${v.from} - ${v.to}`
                  )
                  .join(" | ") || "Not set"
              : "Not set"}
          </div>
          <BookSessionButton tutor={tutor} price={tutor.price ?? 100} />
          <TutorRatingDisplay tutorId={tutor._id} />
        </CardContent>
      </Card>
    </div>
  );
}
