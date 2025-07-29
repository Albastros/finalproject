"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Slider } from "../ui/slider";
import { motion } from "framer-motion";
import { Search, Filter, Star, Clock, Users, Globe, BookOpen, DollarSign } from "lucide-react";

interface TutorFilterProps {
  onFilterChange?: (filters: any) => void;
}

const subjects = [
  "Math",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Computer Science",
];
const languages = ["English", "Amharic"];
const genders = ["Male", "Female"];
const tutoringTypes = [
  { value: "in-person", label: "In Person" },
  { value: "online", label: "Online" },
  { value: "both", label: "Both" },
];

const initialFilters = {
  keyword: "",
  subject: "none",
  language: "none",
  gender: "none",
  tutoringType: "none",
  rating: 0,
  hourlyRate: [0, 1000],
  experience: 0,
};

export function TutorFilter({ onFilterChange }: TutorFilterProps) {
  const [filters, setFilters] = useState(initialFilters);

  function handleChange(key: string, value: any) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }

  function handleReset() {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 w-full max-w-xs mx-auto flex flex-col gap-6 shadow-xl border border-slate-200/50 backdrop-blur-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Filters</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
        >
          Reset
        </Button>
      </div>
      
      {/* Search Input */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <Input
          placeholder="Search by language, subject"
          value={filters.keyword}
          onChange={(e) => handleChange("keyword", e.target.value)}
          className="pl-10 h-12 border-2 border-slate-200 focus:border-blue-400 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300"
        />
      </motion.div>
      {/* Subjects Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-gray-800">Subjects</span>
        </div>
        <Select value={filters.subject} onValueChange={(v) => handleChange("subject", v)}>
          <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-blue-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="none" className="rounded-lg">All</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s} className="rounded-lg hover:bg-blue-50">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      {/* Language Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-gray-800">Language</span>
        </div>
        <Select value={filters.language} onValueChange={(v) => handleChange("language", v)}>
          <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-purple-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="none" className="rounded-lg">All</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l} className="rounded-lg hover:bg-purple-50">
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      {/* Gender Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-800">Gender</span>
        </div>
        <Select value={filters.gender} onValueChange={(v) => handleChange("gender", v)}>
          <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-orange-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="none" className="rounded-lg">All</SelectItem>
            {genders.map((g) => (
              <SelectItem key={g} value={g} className="rounded-lg hover:bg-orange-50">
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      {/* Tutoring Type Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-gray-800">Tutoring Type</span>
        </div>
        <Select value={filters.tutoringType} onValueChange={(v) => handleChange("tutoringType", v)}>
          <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-indigo-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="none" className="rounded-lg">All</SelectItem>
            {tutoringTypes.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="rounded-lg hover:bg-indigo-50">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      {/* Rating Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-gray-800">Rating</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-600 min-w-[20px]">{filters.rating}</span>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[filters.rating]}
              onValueChange={([v]) => handleChange("rating", v)}
              className="flex-1"
            />
            <span className="text-sm font-medium text-yellow-600 flex items-center gap-1">
              5<Star className="w-3 h-3 fill-current" />
            </span>
          </div>
        </div>
      </motion.div>
      {/* Hourly Rate Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-gray-800">Hourly Rate ($)</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={1000}
              value={filters.hourlyRate[0]}
              onChange={(e) =>
                handleChange("hourlyRate", [Number(e.target.value), filters.hourlyRate[1]])
              }
              className="w-20 h-10 text-center border-slate-300 rounded-lg"
            />
            <span className="text-gray-500 font-medium">to</span>
            <Input
              type="number"
              min={0}
              max={1000}
              value={filters.hourlyRate[1]}
              onChange={(e) =>
                handleChange("hourlyRate", [filters.hourlyRate[0], Number(e.target.value)])
              }
              className="w-20 h-10 text-center border-slate-300 rounded-lg"
            />
            <span className="text-green-600 font-semibold">USD</span>
          </div>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={filters.hourlyRate}
            onValueChange={(v) => handleChange("hourlyRate", v)}
            className="w-full"
          />
        </div>
      </motion.div>
      {/* Experience Filter */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-gray-800">Experience (years)</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-600 min-w-[20px]">{filters.experience}</span>
            <Slider
              min={0}
              max={30}
              step={1}
              value={[filters.experience]}
              onValueChange={([v]) => handleChange("experience", v)}
              className="flex-1"
            />
            <span className="text-sm font-medium text-blue-600">30+</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TutorFilter;
