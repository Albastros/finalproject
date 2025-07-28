"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign, 
  BookOpen, 
  CheckCircle,
  Search,
  Users,
  Star,
  Calendar,
  Eye,
  Download,
  FileText,
  Award,
  IdCard,
  Languages,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  subjects?: string[];
  experience?: number;
  languages?: string[];
  profileImage?: string;
  price?: number;
  location?: string;
  gender?: string;
  tutoringType?: string;
  createdAt?: string;
  avgRating?: number;
}

export default function AcceptedTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    fetchAcceptedTutors();
  }, []);

  const fetchAcceptedTutors = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/etn/tutors?verified=true");
      const tutorsData = response.data.tutors || [];
      setTutors(tutorsData);
    } catch (error) {
      console.error("Failed to fetch accepted tutors:", error);
      toast.error("Failed to load accepted tutors");
    } finally {
      setLoading(false);
    }
  };

  function getDocumentCompleteness(tutor: Tutor) {
    const total = 3;
    let completed = 0;
    if (tutor.resumeUrls?.length > 0) completed++;
    if (tutor.certificateUrls?.length > 0) completed++;
    if (tutor.nationalIdUrl) completed++;
    return { completed, total, percentage: (completed / total) * 100 };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-20 w-full" />
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
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Accepted Tutors
                  </h1>
                  <p className="text-muted-foreground text-lg">Approved and active tutors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutors Grid */}
        {filteredTutors.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Accepted Tutors Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "No tutors have been accepted yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTutors.map((tutor) => (
                <Card key={tutor._id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start">
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                      {tutor.avgRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tutor.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-green-200 dark:ring-green-800">
                        <AvatarImage src={tutor.profileImage} alt={tutor.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
                          {tutor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{tutor.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{tutor.email}</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
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

                    {/* View Details Button */}
                    <Button 
                      onClick={() => setSelectedTutor(tutor)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

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
          </>
        )}

        {/* Detailed View Modal */}
        <Dialog open={!!selectedTutor} onOpenChange={() => setSelectedTutor(null)}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">
            <DialogHeader className="border-b pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 -m-6 mb-0 p-6">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Accepted Tutor Details
              </DialogTitle>
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
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl font-bold">
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
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl font-bold text-green-600">{selectedTutor.experience || 0}</div>
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
                              National ID
                            </a>
                          ) : (
                            <div className="text-sm text-muted-foreground">No ID uploaded</div>
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
                        <CardContent>
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
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 mt-4">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <CardTitle className="text-sm">Availability Schedule</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedTutor.availability ? (
                          <div className="space-y-3">
                            {Object.entries(selectedTutor.availability).map(([day, schedule]: [string, any]) => (
                              <div key={day} className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <span className="font-medium capitalize text-green-800 dark:text-green-200 text-base">{day}</span>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                                    {schedule.from} - {schedule.to}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="text-sm text-muted-foreground">
                              No availability schedule set
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
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







