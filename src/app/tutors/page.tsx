"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TutorFilter from "@/components/tutor/TutorFilter";

const SUBJECTS = ["Math", "Science", "English", "Programming", "History"];
const LANGUAGES = ["Amharic", "English"];

interface Filters {
  keyword: string;
  subject: string;
  availability: string;
  language: string;
  gender: string;
  tutoringType: string;
  rating: number;
  hourlyRate: [number, number];
  experience: number;
}

interface Tutor {
  _id: string;
  image?: string;
  name: string;
  subjects?: string[];
  experience?: number;
  bio?: string;
  availabilityStatus?: string;
  isFullyBookedIndividually?: boolean;
  hasIndividualBookings?: boolean;
  hasGroupBookings?: boolean;
}

interface SidebarFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

function SidebarFilters({ filters, setFilters }: SidebarFiltersProps) {
  return (
    <aside className="w-64 p-4 border-r bg-muted/50">
      <div className="mb-4">
        <div className="font-semibold mb-2">Subjects</div>
        <select
          className="w-full p-2 rounded border"
          value={filters.subject}
          onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-2">Languages</div>
        <select
          className="w-full p-2 rounded border"
          value={filters.language}
          onChange={e => setFilters(f => ({ ...f, language: e.target.value }))}
        >
          <option value="">All Languages</option>
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-2">Experience (years)</div>
        <Input
          type="number"
          min={0}
          placeholder="Experience"
          value={filters.experience}
          onChange={e => setFilters(f => ({ ...f, experience: Number(e.target.value) }))}
          className="w-full"
        />
      </div>
    </aside>
  );
}

function TutorCard({ _id, image, name, subjects, experience, bio, availabilityStatus, isFullyBookedIndividually }: Tutor) {
  const hasImage = image && image !== "/profile-mock.jpg";
  
  // Professional and appealing color palette with better contrast
  const cardColors = [
    {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-100/80",
      header: "bg-gradient-to-r from-blue-500 to-indigo-600",
      accent: "from-blue-400 to-indigo-500",
      border: "border-blue-200",
      tagBg: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      badgeBg: "bg-blue-200 text-blue-900 hover:bg-blue-300"
    },
    {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-100/80",
      header: "bg-gradient-to-r from-emerald-500 to-teal-600",
      accent: "from-emerald-400 to-teal-500",
      border: "border-emerald-200",
      tagBg: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      badgeBg: "bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
    },
    {
      bg: "bg-gradient-to-br from-purple-50 to-violet-100/80",
      header: "bg-gradient-to-r from-purple-500 to-violet-600",
      accent: "from-purple-400 to-violet-500",
      border: "border-purple-200",
      tagBg: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      badgeBg: "bg-purple-200 text-purple-900 hover:bg-purple-300"
    },
    {
      bg: "bg-gradient-to-br from-rose-50 to-pink-100/80",
      header: "bg-gradient-to-r from-rose-500 to-pink-600",
      accent: "from-rose-400 to-pink-500",
      border: "border-rose-200",
      tagBg: "bg-rose-100 text-rose-800 hover:bg-rose-200",
      badgeBg: "bg-rose-200 text-rose-900 hover:bg-rose-300"
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-orange-100/80",
      header: "bg-gradient-to-r from-amber-500 to-orange-600",
      accent: "from-amber-400 to-orange-500",
      border: "border-amber-200",
      tagBg: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      badgeBg: "bg-amber-200 text-amber-900 hover:bg-amber-300"
    },
    {
      bg: "bg-gradient-to-br from-cyan-50 to-sky-100/80",
      header: "bg-gradient-to-r from-cyan-500 to-sky-600",
      accent: "from-cyan-400 to-sky-500",
      border: "border-cyan-200",
      tagBg: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
      badgeBg: "bg-cyan-200 text-cyan-900 hover:bg-cyan-300"
    },
    {
      bg: "bg-gradient-to-br from-green-50 to-lime-100/80",
      header: "bg-gradient-to-r from-green-500 to-lime-600",
      accent: "from-green-400 to-lime-500",
      border: "border-green-200",
      tagBg: "bg-green-100 text-green-800 hover:bg-green-200",
      badgeBg: "bg-green-200 text-green-900 hover:bg-green-300"
    },
    {
      bg: "bg-gradient-to-br from-slate-50 to-gray-100/80",
      header: "bg-gradient-to-r from-slate-600 to-gray-700",
      accent: "from-slate-500 to-gray-600",
      border: "border-slate-200",
      tagBg: "bg-slate-100 text-slate-800 hover:bg-slate-200",
      badgeBg: "bg-slate-200 text-slate-900 hover:bg-slate-300"
    }
  ];
  
  const colorIndex = _id ? _id.length % cardColors.length : 0;
  const colors = cardColors[colorIndex];
  
  return (
    <Card className={`relative flex flex-col min-h-[520px] h-full overflow-hidden ${colors.bg} shadow-xl hover:shadow-2xl transition-all duration-700 group hover:scale-[1.05] hover:-translate-y-3 rounded-3xl border-2 ${colors.border} backdrop-blur-sm w-full max-w-[480px] mx-auto`}>
      {/* Ultra Enhanced Header with complex patterns */}
      <div className={`h-24 ${colors.header} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-white/20 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
        {/* Enhanced decorative elements */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/15 rounded-full transform rotate-45 group-hover:rotate-90 transition-transform duration-700" />
        <div className="absolute top-3 right-12 w-6 h-6 bg-white/20 rounded-full group-hover:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-2 left-6 w-8 h-8 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-600" />
        <div className="absolute top-1 left-1 w-4 h-4 bg-white/25 transform rotate-45 group-hover:rotate-180 transition-transform duration-800" />
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.accent} opacity-90 group-hover:h-2 transition-all duration-500`} />
      </div>
      
      {/* Avatar */}
      <div className="absolute left-1/2 top-14 -translate-x-1/2 z-10">
        {hasImage ? (
          <Image
            src={image}
            alt={name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg bg-white group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-16 w-16 rounded-full border-3 border-white shadow-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
          </div>
        )}
      </div>
      
      <CardHeader className="flex flex-col items-center mt-10 pb-2">
        <CardTitle className="text-lg text-center font-semibold text-slate-700 group-hover:text-blue-500 transition-colors duration-300">
          {name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col items-center gap-3 px-6 pb-6">
        {/* Subject Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {subjects && subjects.length ? (
            subjects.map((subj, index) => (
              <span
                key={subj}
                className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 ${colors.tagBg}`}
              >
                {subj}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">No subjects listed</span>
          )}
        </div>
        
        {/* Experience Badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full ${colors.badgeBg} text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {experience ? `${experience} years` : "New tutor"}
          </span>
        </div>
        
        {/* Bio */}
        <div className="text-sm text-slate-500 text-center line-clamp-3 mt-3 leading-relaxed px-2">
          {bio || "Passionate educator ready to help you achieve your learning goals."}
        </div>
        
        {/* Availability Status Badge removed as requested */}
        
        {/* Button */}
        <Button className={`mt-4 w-full h-11 font-semibold text-white bg-gradient-to-r ${colors.accent} hover:shadow-lg transition-all duration-300 rounded-xl shadow-md`} asChild>
          <a href={`/tutor/${_id}`} className="flex items-center justify-center gap-2">
            <span>View Profile</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TutorsPage() {
  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    subject: "",
    availability: "",
    language: "",
    gender: "",
    tutoringType: "none",
    rating: 0,
    hourlyRate: [0, 1000],
    experience: 0,
  });
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.subject && filters.subject !== "none") params.append("subject", filters.subject);
    if (filters.availability && filters.availability !== "none")
      params.append("availability", filters.availability);
    if (filters.language && filters.language !== "none")
      params.append("language", filters.language);
    if (filters.gender && filters.gender !== "none") params.append("gender", filters.gender);
    if (filters.tutoringType && filters.tutoringType !== "none")
      params.append("tutoringType", filters.tutoringType);
    if (filters.rating) params.append("rating", filters.rating.toString());
    if (filters.hourlyRate) {
      params.append("minRate", filters.hourlyRate[0].toString());
      params.append("maxRate", filters.hourlyRate[1].toString());
    }
    if (filters.experience) params.append("experience", filters.experience.toString());
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    setLoading(true);
    axios.get(`/api/tutors?${params.toString()}`).then((res) => {
      setTutors(res.data.tutors);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
      setLoading(false);
    });
  }, [filters, page]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="flex min-h-[80vh] bg-gray-900/5">
      <div className="w-80 p-4 border-r bg-muted/50">
        <TutorFilter onFilterChange={setFilters} />
      </div>
      <div className="flex-1 p-6">
        {loading ? (
          <div className="text-center py-12">Loading tutors...</div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-12">No tutors found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-10 justify-center" style={{gridAutoColumns:'minmax(340px, 1fr)'}}>
              {tutors.map((tutor) => (
                <TutorCard key={tutor._id} {...tutor} />
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-10">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="px-3 text-gray-700 dark:text-gray-200">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
