"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  UserPlus, 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  Shield, 
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface UserTableRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  avgRating?: number | null;
  phone?: string;
  bio?: string;
  subjects?: string[];
  languages?: string[];
  experience?: number;
  price?: number;
  location?: string;
  gender?: string;
  tutoringType?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  profileImage?: string;
}

const roleOptions = [
  { label: "All Users", value: "all", icon: Users },
  { label: "Tutors", value: "tutor", icon: GraduationCap },
  { label: "Students", value: "user", icon: Users },
  { label: "Admins", value: "admin", icon: Shield },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserTableRow[]>([]);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [role, search, page, limit]);

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/api/admin/users", {
        params: { role, search, page, limit },
      })
      .then((res) => {
        console.log("Users data:", res.data.users); // Debug log
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      console.log('Starting export with params:', { role, search });
      
      const response = await axios.get("/api/admin/users/export", {
        params: { role, search }
      });
      
      console.log('Export response received:', response.status);
      
      // Create a blob with HTML content
      const htmlContent = response.data;
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print dialog for PDF save
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Close the window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 500);
        };
      } else {
        // Fallback: download as HTML file if popup blocked
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('Popup blocked. HTML file downloaded instead. Open it and use browser print to save as PDF.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        alert(`Export failed: ${error.response?.data?.error || error.message}`);
      } else {
        alert('Export failed. Please try again.');
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-muted-foreground text-lg">Manage and monitor all platform users</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleExportUsers}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link href="/admin/users/add">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Users Directory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">User</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Rating</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr 
                        key={user._id} 
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => handleUserClick(user._id)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              {(user.profileImage || user.image) ? (
                                <AvatarImage 
                                  src={user.profileImage || user.image} 
                                  alt={user.name}
                                  className="cursor-pointer hover:opacity-80 transition-opacity object-cover"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(user.profileImage || user.image);
                                    setImageModalOpen(true);
                                  }}
                                />
                              ) : (
                                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">{user.name || "-"}</div>
                              <div className="text-sm text-muted-foreground">{user.email || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={`capitalize ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'tutor' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'etn' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role || "-"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={
                            user.role === 'tutor' 
                              ? (user.isVerified ? 'default' : 'destructive')
                              : 'default'
                          } className={`capitalize ${
                            user.role === 'tutor'
                              ? (user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.role === 'tutor' 
                              ? (user.isVerified ? 'Active' : 'Not Active')
                              : 'Active'
                            }
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-4 px-4">
                          {user.role === "tutor" && user.avgRating ? (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">{user.avgRating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <UserActions user={user} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
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
  );
}

type UserActionsProps = { user: UserTableRow };

type ActionType = "delete" | null;

function UserActions({ user }: UserActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);
  const [transactionModal, setTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await axios.delete(`/api/admin/users/${user._id}`);
    setLoading(false);
    setDialogOpen(false);
    window.location.reload();
  };

  const handleViewTransactions = async () => {
    setTransactionLoading(true);
    setTransactionModal(true);
    
    try {
      if (user.role === "user") {
        const response = await axios.get(`/api/admin/transactions?studentId=${user._id}`);
        setTransactions(response.data.transactions || []);
      } else if (user.role === "etn") {
        const response = await axios.get(`/api/admin/transactions?etnId=${user._id}`);
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {(user.role === "user" || user.role === "etn" || user.role === "tutor" || user.role === "admin") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewTransactions}
          className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          Transactions
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setAction("delete");
          setDialogOpen(true);
        }}
        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Transaction Modal */}
      {transactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.role === "user" ? "Student Transactions" : "ETN Transactions"}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {user.name} • {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTransactionModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {transactionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No transactions found</h3>
                  <p className="text-slate-600 dark:text-slate-400">This user hasn't made any transactions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        {user.role === "user" ? (
                          <>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Tutor</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Subject</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Payment</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Reference</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          {user.role === "user" ? (
                            <>
                              <td className="py-3 px-4 text-sm">{transaction.sessionDate}</td>
                              <td className="py-3 px-4 text-sm font-medium">{transaction.tutorName || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm">{transaction.subject}</td>
                              <td className="py-3 px-4 text-sm font-semibold">{transaction.amount} Birr</td>
                              <td className="py-3 px-4">
                                <Badge variant={transaction.status === 'confirmed' ? 'default' : transaction.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                  {transaction.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={transaction.paymentStatus === 'completed' ? 'default' : transaction.paymentStatus === 'failed' ? 'destructive' : 'secondary'}>
                                  {transaction.paymentStatus || 'pending'}
                                </Badge>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm font-semibold">{transaction.amount} Birr</td>
                              <td className="py-3 px-4 text-sm">{transaction.type}</td>
                              <td className="py-3 px-4 text-sm font-mono text-xs">{transaction._id}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {dialogOpen && action === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Delete User</h2>
                  <p className="text-red-700 dark:text-red-300 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete <strong>{user.name}</strong>? This will permanently remove their account and all associated data.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
