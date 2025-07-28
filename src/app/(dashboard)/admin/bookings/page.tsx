"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  DollarSign,
  Filter,
  Search,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface BookingTableRow {
  _id: string;
  student: { _id: string; name: string; email: string } | null;
  tutor: { _id: string; name: string; email: string } | null;
  sessionDate: string;
  sessionTime: string;
  subject: string;
  status: string;
  payment?: { status: string; amount: number } | null;
  price: number;
}

interface SessionDetails {
  materials: any[];
  ratings: any[];
  attendance: any[];
  quizResults: any[];
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingTableRow | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/bookings", {
        params: { page, limit }
      });
      setBookings(response.data.bookings || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (booking: BookingTableRow) => {
    setSelectedBooking(booking);
    setDetailsLoading(true);
    try {
      const response = await axios.get(`/api/bookings/${booking._id}/details`);
      setSessionDetails(response.data);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.tutor?.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.subject.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    active: bookings.filter(b => b.status === 'active').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Booking Management
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Monitor and manage all tutoring sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-sm text-green-100">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-sm text-blue-100">Active</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-yellow-100">Pending</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{stats.cancelled}</div>
              <div className="text-sm text-red-100">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by student, tutor, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 font-semibold">Student</th>
                    <th className="text-left p-4 font-semibold">Tutor</th>
                    <th className="text-left p-4 font-semibold">Session</th>
                    <th className="text-left p-4 font-semibold">Subject</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Payment</th>
                    <th className="text-left p-4 font-semibold">Amount</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <div className="text-muted-foreground">
                          {search || statusFilter !== "all" ? "No bookings match your filters" : "No bookings found"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{booking.student?.name || "-"}</div>
                              <div className="text-sm text-muted-foreground">{booking.student?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">{booking.tutor?.name || "-"}</div>
                              <div className="text-sm text-muted-foreground">{booking.tutor?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{booking.sessionDate}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.sessionTime}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{booking.subject}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(booking.status)} border`}>
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {booking.payment ? (
                            <Badge className={getPaymentStatusColor(booking.payment.status)}>
                              {booking.payment.status}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{booking.price}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(booking)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h3 className="font-semibold mb-2">Student Information</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Name:</strong> {selectedBooking.student?.name}</p>
                                        <p><strong>Email:</strong> {selectedBooking.student?.email}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold mb-2">Tutor Information</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Name:</strong> {selectedBooking.tutor?.name}</p>
                                        <p><strong>Email:</strong> {selectedBooking.tutor?.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-6">
                                    <div>
                                      <h3 className="font-semibold mb-2">Session Details</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Date:</strong> {selectedBooking.sessionDate}</p>
                                        <p><strong>Time:</strong> {selectedBooking.sessionTime}</p>
                                        <p><strong>Subject:</strong> {selectedBooking.subject}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold mb-2">Status</h3>
                                      <Badge className={getStatusColor(selectedBooking.status)}>
                                        {selectedBooking.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold mb-2">Payment</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Amount:</strong> ${selectedBooking.price}</p>
                                        {selectedBooking.payment && (
                                          <Badge className={getPaymentStatusColor(selectedBooking.payment.status)}>
                                            {selectedBooking.payment.status}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {Math.ceil(total / limit) > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} bookings
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
                    Previous
                  </Button>
                  <span className="text-sm px-3 py-1 bg-muted rounded">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === Math.ceil(total / limit)}
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
    </div>
  );
}
