"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Booking {
  _id: string;
  studentId: string;
  tutorId: string;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  dispute: {
    filed: boolean;
    reason?: string;
    resolved: boolean;
    outcome?: "refunded" | "rejected";
    filedAt?: string;
    resolvedAt?: string;
  };
}

interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

export default function DisputesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [tutor, setTutor] = useState<any>(null);
  const [resolving, setResolving] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    setLoading(true);
    try {
      // Fetch all disputes (including resolved ones) for stats
      const res = await fetch("/api/disputes?includeResolved=true");
      const data = await res.json();
      setBookings(data.bookings || []);
      setUserMap(data.userMap || {});
    } catch (error) {
      toast.error("Failed to fetch disputes");
    }
    setLoading(false);
  }

  async function openReview(booking: Booking) {
    setSelected(booking);
    setStudent(null);
    setTutor(null);
    
    try {
      const [studentRes, tutorRes] = await Promise.all([
        fetch(`/api/users?id=${booking.studentId}`),
        fetch(`/api/users?id=${booking.tutorId}`),
      ]);
      setStudent((await studentRes.json()).user);
      setTutor((await tutorRes.json()).user);
    } catch (error) {
      toast.error("Failed to load user details");
    }
  }

  async function handleResolve(outcome: "refunded" | "rejected") {
    if (!selected) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/disputes/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });
      
      if (res.ok) {
        toast.success(`Dispute ${outcome === "refunded" ? "refunded" : "rejected"} successfully.`);
        // Update the booking in the list instead of removing it
        setBookings((prev) => prev.map((b) => 
          b._id === selected._id 
            ? { ...b, dispute: { ...b.dispute, resolved: true, outcome, resolvedAt: new Date().toISOString() } }
            : b
        ));
        setSelected(null);
        setStudent(null);
        setTutor(null);
      } else {
        const data = await res.json();
        const errorMsg = data?.error || "Failed to resolve dispute.";
        if (errorMsg.includes("Automated refund is not available for your Chapa account")) {
          toast.error(
            "Automated refund is not available for your Chapa account. Please process the refund manually via the Chapa dashboard."
          );
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      toast.error("Failed to resolve dispute");
    }
    setResolving(false);
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = search === "" || 
      booking.subject?.toLowerCase().includes(search.toLowerCase()) ||
      userMap[booking.studentId]?.toLowerCase().includes(search.toLowerCase()) ||
      userMap[booking.tutorId]?.toLowerCase().includes(search.toLowerCase()) ||
      booking._id.toLowerCase().includes(search.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === "pending" && !booking.dispute.resolved ||
      statusFilter === "approved" && booking.dispute.resolved && booking.dispute.outcome === "refunded" ||
      statusFilter === "rejected" && booking.dispute.resolved && booking.dispute.outcome === "rejected";
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + limit);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => !b.dispute.resolved).length,
    resolved: bookings.filter(b => b.dispute.resolved).length,
    refunded: bookings.filter(b => b.dispute.resolved && b.dispute.outcome === "refunded").length,
    rejected: bookings.filter(b => b.dispute.resolved && b.dispute.outcome === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </Card>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
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
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Dispute Management
                  </h1>
                  <p className="text-muted-foreground text-lg">Review and resolve session disputes</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchDisputes} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Disputes</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending Review</p>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Refunded</p>
                    <p className="text-3xl font-bold">{stats.refunded}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold">{stats.rejected}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Resolved</p>
                    <p className="text-3xl font-bold">{stats.resolved}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by student, tutor, subject, or booking ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => {
                      setStatusFilter("pending");
                      setPage(1);
                    }}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === "approved" ? "default" : "outline"}
                    onClick={() => {
                      setStatusFilter("approved");
                      setPage(1);
                    }}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === "rejected" ? "default" : "outline"}
                    onClick={() => {
                      setStatusFilter("rejected");
                      setPage(1);
                    }}
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disputes Grid */}
        {paginatedBookings.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Disputes Found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search criteria" : `No ${statusFilter} disputes found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBookings.map((booking) => (
                <Card key={booking._id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={booking.dispute.resolved ? "secondary" : "destructive"} 
                        className="gap-1"
                      >
                        {booking.dispute.resolved ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            {booking.dispute.outcome === "refunded" ? "Refunded" : "Rejected"}
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Pending Review
                          </>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(booking.dispute.filedAt || '').toLocaleDateString()}
                      </span>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Student:</span>
                        <span className="text-sm text-muted-foreground">
                          {userMap[booking.studentId] || booking.studentId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Tutor:</span>
                        <span className="text-sm text-muted-foreground">
                          {userMap[booking.tutorId] || booking.tutorId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Subject:</span>
                        <span className="text-sm text-muted-foreground">{booking.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm text-muted-foreground">
                          {booking.sessionDate} at {booking.sessionTime}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Reason:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {booking.dispute.reason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="text-xs text-muted-foreground">
                      ID: {booking._id}
                    </div>

                    {/* Action Button */}
                    {!booking.dispute.resolved ? (
                      <Button 
                        onClick={() => openReview(booking)}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Dispute
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => openReview(booking)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + limit, filteredBookings.length)} of {filteredBookings.length} disputes
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

        {/* Review Modal */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Dispute Review
              </DialogTitle>
            </DialogHeader>
            
            {selected && (
              <div className="space-y-6 py-4">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={student?.profileImage} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (student?.profileImage) {
                              setSelectedImage(student.profileImage);
                              setImageModalOpen(true);
                            }
                          }}
                        />
                        <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                          {student?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Student</p>
                        <p className="text-sm text-muted-foreground">
                          {student?.name || selected.studentId}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={tutor?.profileImage} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (tutor?.profileImage) {
                              setSelectedImage(tutor.profileImage);
                              setImageModalOpen(true);
                            }
                          }}
                        />
                        <AvatarFallback className="bg-green-500 text-white text-sm font-semibold">
                          {tutor?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Tutor</p>
                        <p className="text-sm text-muted-foreground">
                          {tutor?.name || selected.tutorId}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Session Details */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Session Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span>
                      <p className="text-muted-foreground">{selected.subject}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date & Time:</span>
                      <p className="text-muted-foreground">
                        {selected.sessionDate} at {selected.sessionTime}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Booking ID:</span>
                      <p className="text-muted-foreground font-mono text-xs">{selected._id}</p>
                    </div>
                  </div>
                </Card>

                {/* Dispute Reason */}
                <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
                  <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">Dispute Reason</h3>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {selected.dispute?.reason || "No reason provided"}
                  </p>
                </Card>

                {/* Action Buttons */}
                {!selected.dispute.resolved && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleResolve("refunded")}
                      disabled={resolving}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {resolving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Refund Student
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleResolve("rejected")}
                      disabled={resolving}
                      variant="destructive"
                      className="flex-1"
                    >
                      {resolving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Dispute
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
