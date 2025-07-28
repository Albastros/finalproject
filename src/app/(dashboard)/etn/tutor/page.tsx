"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Award, 
  FileText, 
  IdCard,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Languages,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  subjects?: string[];
  experience?: number;
  languages?: string[];
  resumeUrls?: string[];
  certificateUrls?: string[];
  profileImage?: string;
  nationalIdUrl?: string;
  price?: number;
  location?: string;
  gender?: string;
  tutoringType?: string;
  availability?: any;
  createdAt?: string;
}

export default function ETNTutorPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [detailedTutor, setDetailedTutor] = useState<Tutor | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleViewDetails = async (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setDetailedTutor(tutor);
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setSelectedTutor(null);
    setDetailedTutor(null);
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      console.log("Fetching tutors...");
      let response;
      try {
        response = await axios.get("/api/etn/tutors");
      } catch (etnError) {
        console.log("ETN endpoint failed, trying admin endpoint");
        response = await axios.get("/api/admin/tutors");
      }
      console.log("Tutors response:", response.data);
      const tutorsData = response.data.tutors || [];
      console.log("Tutors data:", tutorsData);
      setTutors(tutorsData);
    } catch (error) {
      console.error("Failed to fetch tutors:", error);
      toast.error("Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  async function handleApprove(email: string) {
    setActionLoading("approve-" + email);
    try {
      // Try ETN endpoint first, then admin endpoint as fallback
      let response;
      try {
        response = await axios.patch("/api/etn/tutors/verify", { email });
      } catch (etnError) {
        console.log("ETN endpoint failed, trying admin endpoint");
        response = await axios.patch("/api/admin/tutors/verify", { email });
      }
      
      setTutors((prev) => prev.filter((t) => t.email !== email));
      setSelectedTutor(null);
      toast.success("Tutor approved successfully");
    } catch (err: any) {
      console.error("Approval error:", err);
      toast.error(err.response?.data?.error || "Failed to approve");
    }
    setActionLoading(null);
  }

  async function handleReject(email: string) {
    setActionLoading("reject-" + email);
    try {
      // Try ETN endpoint first, then admin endpoint as fallback
      let response;
      try {
        response = await axios.patch("/api/etn/tutors/reject", { email });
      } catch (etnError) {
        console.log("ETN endpoint failed, trying admin endpoint");
        response = await axios.patch("/api/admin/tutors/reject", { email });
      }
      
      setTutors((prev) => prev.filter((t) => t.email !== email));
      setSelectedTutor(null);
      toast.success("Tutor application rejected");
    } catch (err: any) {
      console.error("Rejection error:", err);
      toast.error(err.response?.data?.error || "Failed to reject");
    }
    setActionLoading(null);
  }

  function getDocumentCompleteness(tutor: Tutor) {
    const total = 3;
    let completed = 0;
    if (tutor.resumeUrls?.length > 0) completed++;
    if (tutor.certificateUrls?.length > 0) completed++;
    if (tutor.nationalIdUrl) completed++;
    return { completed, total, percentage: (completed / total) * 100 };
  }

  function getApplicationScore(tutor: Tutor) {
    let score = 0;
    
    // All tutors will have these since they're required by API
    score += 40; // Base score for required fields (name, email, phone, bio, subjects, experience, languages)
    
    // Additional quality indicators
    if (tutor.bio && tutor.bio.length > 100) score += 15; // Detailed bio
    if (tutor.experience && tutor.experience >= 2) score += 15; // Experienced tutor
    if (tutor.resumeUrls && tutor.resumeUrls.length > 0) score += 15;
    if (tutor.certificateUrls && tutor.certificateUrls.length > 0) score += 10;
    if (tutor.nationalIdUrl) score += 5;
    
    console.log(`Tutor ${tutor.name} score:`, score); // Debug log
    return Math.min(score, 100);
  }

  function hasRequiredFields(tutor: Tutor) {
    return !!(
      tutor.name?.trim() &&
      tutor.email?.trim() &&
      tutor.phone?.trim() &&
      tutor.nationalIdUrl
    );
  }

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTutors.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTutors = filteredTutors.slice(startIndex, startIndex + limit);

  const stats = {
    total: tutors.length,
    highScore: tutors.filter(t => getApplicationScore(t) >= 80).length,
    mediumScore: tutors.filter(t => getApplicationScore(t) >= 60 && getApplicationScore(t) < 80).length,
    lowScore: tutors.filter(t => getApplicationScore(t) < 60).length,
  };

  // Store applicants by quality first
  const highQualityApplicants = tutors.filter(t => getApplicationScore(t) >= 80);
  const mediumQualityApplicants = tutors.filter(t => getApplicationScore(t) >= 60 && getApplicationScore(t) < 80);
  const needsReviewApplicants = tutors.filter(t => getApplicationScore(t) < 60);

  console.log('Total tutors:', tutors.length);
  console.log('High quality applicants:', highQualityApplicants.length);
  console.log('Medium quality applicants:', mediumQualityApplicants.length);
  console.log('Needs review applicants:', needsReviewApplicants.length);

  // Debug: Log some sample scores
  if (tutors.length > 0) {
    console.log('Sample tutor scores:');
    tutors.slice(0, 3).forEach(tutor => {
      console.log(`${tutor.name}: ${getApplicationScore(tutor)}%`);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </Card>
              ))}
            </div>
          </div>
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Pending Tutors
              </h1>
              <p className="text-muted-foreground mt-1">
                Review and approve tutor applications
              </p>
            </div>
            <Button
              onClick={fetchTutors}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">High Quality</p>
                    <p className="text-3xl font-bold">{highQualityApplicants.length}</p>
                    <p className="text-xs text-green-200">80%+ Score</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Medium Quality</p>
                    <p className="text-3xl font-bold">{mediumQualityApplicants.length}</p>
                    <p className="text-xs text-blue-200">60-79% Score</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Needs Review</p>
                    <p className="text-3xl font-bold">{needsReviewApplicants.length}</p>
                    <p className="text-xs text-red-200">&lt;60% Score</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>
          </div>

          {/* Tutors Grid */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Users className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground">
                    All tutor applications have been processed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedTutors.map((tutor) => {
                    const docStats = getDocumentCompleteness(tutor);
                    const appScore = getApplicationScore(tutor);
                    const scoreColor = appScore >= 80 ? "text-green-600" : appScore >= 60 ? "text-orange-600" : "text-red-600";
                    const scoreBg = appScore >= 80 ? "bg-green-100" : appScore >= 60 ? "bg-orange-100" : "bg-red-100";

                    return (
                      <Card key={tutor._id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden relative">
                        {/* Score Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${scoreBg} ${scoreColor} z-10`}>
                          {appScore}% Match
                        </div>

                        {/* Header Gradient */}
                        <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                            <div className="relative">
                              <Image
                                src={tutor.profileImage || "/default-avatar.png"}
                                alt={tutor.name}
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <CardContent className="pt-12 pb-6 px-6 space-y-4">
                          {/* Profile Info */}
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                              {tutor.name}
                            </h3>
                            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                              <Mail className="w-3 h-3" />
                              {tutor.email}
                            </div>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                <Clock className="w-3 h-3" />
                              </div>
                              <div className="text-xs text-muted-foreground">Experience</div>
                              <div className="font-semibold">{tutor.experience || 0}y</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                <DollarSign className="w-3 h-3" />
                              </div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                              <div className="font-semibold">{tutor.price || 100} birr</div>
                            </div>
                          </div>

                          {/* Subjects Preview */}
                          {tutor.subjects?.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <BookOpen className="w-3 h-3" />
                                Subjects
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {tutor.subjects.slice(0, 2).map((subject) => (
                                  <Badge key={subject} variant="secondary" className="text-xs px-2 py-1">
                                    {subject}
                                  </Badge>
                                ))}
                                {tutor.subjects.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-2 py-1">
                                    +{tutor.subjects.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Document Progress */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Document Completion</span>
                              <span className="text-muted-foreground">{docStats.completed}/{docStats.total}</span>
                            </div>
                            <Progress value={docStats.percentage} className="h-2" />
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                {tutor.resumeUrls?.length > 0 ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                <span className="text-muted-foreground">Resume</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {tutor.certificateUrls?.length > 0 ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                <span className="text-muted-foreground">Certs</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {tutor.nationalIdUrl ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                <span className="text-muted-foreground">ID</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button 
                            onClick={() => setSelectedTutor(tutor)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Application
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + limit, filteredTutors.length)} of {filteredTutors.length} tutors
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <span className="text-sm px-3 py-1 bg-muted rounded">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review Modal */}
        <Dialog open={!!selectedTutor} onOpenChange={() => setSelectedTutor(null)}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">
            <DialogHeader className="border-b pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Application Review Dashboard
                </DialogTitle>
                {selectedTutor && (
                  <Badge className={`px-3 py-1 ${getApplicationScore(selectedTutor) >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {getApplicationScore(selectedTutor)}% Match Score
                  </Badge>
                )}
              </div>
            </DialogHeader>
            
            {selectedTutor && (
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 space-y-6">
                {/* Profile Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage 
                          src={selectedTutor.profileImage} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (selectedTutor.profileImage) {
                              setSelectedImage(selectedTutor.profileImage);
                              setImageModalOpen(true);
                            }
                          }}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl font-bold">
                          {selectedTutor.name?.charAt(0)?.toUpperCase() || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{selectedTutor.name}</h2>
                        <p className="text-muted-foreground">{selectedTutor.email}</p>
                        <p className="text-sm text-muted-foreground">{selectedTutor.phone}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Bio</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedTutor.bio || "No bio provided"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">{selectedTutor.experience || 0}</div>
                          <div className="text-xs text-muted-foreground">Years Experience</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl font-bold text-green-600">{selectedTutor.price || 100}</div>
                          <div className="text-xs text-muted-foreground">Birr/Hour</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs Section */}
                <Tabs defaultValue="documents" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Resume Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-sm">Resume</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedTutor.resumeUrls && selectedTutor.resumeUrls.length > 0 ? (
                            <div className="space-y-2">
                              {selectedTutor.resumeUrls.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Download className="w-3 h-3" />
                                  Resume {selectedTutor.resumeUrls && selectedTutor.resumeUrls.length > 1 ? index + 1 : ""}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No resume uploaded</div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Certificates Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-600" />
                            <CardTitle className="text-sm">Certificates</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedTutor.certificateUrls && selectedTutor.certificateUrls.length > 0 ? (
                            <div className="space-y-2">
                              {selectedTutor.certificateUrls.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                                >
                                  <Download className="w-3 h-3" />
                                  Certificate {selectedTutor.certificateUrls && selectedTutor.certificateUrls.length > 1 ? index + 1 : ""}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No certificates uploaded</div>
                          )}
                        </CardContent>
                      </Card>

                      {/* National ID Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <IdCard className="w-4 h-4 text-purple-600" />
                            <CardTitle className="text-sm">National ID</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedTutor.nationalIdUrl ? (
                            <a
                              href={selectedTutor.nationalIdUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm"
                            >
                              <Download className="w-3 h-3" />
                              View National ID
                            </a>
                          ) : (
                            <div className="text-sm text-muted-foreground">No national ID uploaded</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Subjects Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-sm">Subjects</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {selectedTutor.subjects && selectedTutor.subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedTutor.subjects.map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No subjects listed</div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Languages Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-green-600" />
                            <CardTitle className="text-sm">Languages</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedTutor.languages && selectedTutor.languages.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedTutor.languages.map((lang, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No languages specified</div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Location & Type Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <CardTitle className="text-sm">Location & Type</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {loadingDetails ? (
                            <Skeleton className="h-16 w-full" />
                          ) : (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Location:</span>
                                <span>{selectedTutor?.location || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gender:</span>
                                <span>{selectedTutor?.gender || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{selectedTutor?.tutoringType || "Not specified"}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      {/* Registration Date Card */}
                      <Card className="border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <CardTitle className="text-sm">Registration</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Applied on:</span>
                            <br />
                            <span>{selectedTutor.createdAt ? new Date(selectedTutor.createdAt).toLocaleDateString() : "Unknown"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 mt-4">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <CardTitle className="text-sm">Tutor Availability</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedTutor.availability ? (
                          (() => {
                            const availableDays = Object.entries(selectedTutor.availability)
                              .filter(([, schedule]: [string, any]) => schedule.available);
                            
                            return availableDays.length > 0 ? (
                              <div className="space-y-3">
                                {availableDays.map(([day, schedule]: [string, any]) => (
                                  <div key={day} className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <span className="font-medium capitalize text-green-800 dark:text-green-200 text-base">{day}</span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {schedule.from} - {schedule.to}
                                      </div>
                                      {schedule.from > schedule.to && (
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                          (next day)
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Clock className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                                  No Availability Set
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Tutor has not configured their schedule
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Clock className="w-8 h-8 text-gray-500" />
                            </div>
                            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Schedule Not Available
                            </div>
                            <div className="text-sm text-muted-foreground">
                              No availability information provided
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons - Fixed at bottom */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedTutor.email)}
                      disabled={!!actionLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-9"
                    >
                      {actionLoading === `approve-${selectedTutor.email}` ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedTutor.email)}
                      disabled={!!actionLoading}
                      className="flex-1 h-9"
                    >
                      {actionLoading === `reject-${selectedTutor.email}` ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Profile Image</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="flex justify-center">
                <Image
                  src={selectedImage}
                  alt="Profile Image"
                  width={400}
                  height={400}
                  className="max-w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
