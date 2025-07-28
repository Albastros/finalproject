"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, CreditCard, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import axios from "axios";
import { Label } from "@/components/ui/label";

interface ETNUser {
  _id: string;
  name: string;
  email: string;
  totalPaid: number;
  profileImage?: string;
}

export default function ETNAdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [etns, setEtns] = useState<ETNUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ETNUser | null>(null);
  const [paying, setPaying] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [settings, setSettings] = useState({ minimumPayout: 50 });
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    fetchEtns();
    fetchSettings();
  }, [session, isPending, router]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/admin/settings");
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  async function fetchEtns() {
    setLoading(true);
    try {
      const res = await fetch("/api/etn/list");
      const data = await res.json();
      setEtns(data.etns || []);
    } catch (error) {
      toast.error("Failed to fetch ETN users");
    }
    setLoading(false);
  }

  async function handlePay() {
    if (!selected || !customAmount) return;

    const amount = Number(customAmount);
    if (amount < settings.minimumPayout) {
      toast.error(`Minimum payout amount is ${settings.minimumPayout} birr`);
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/etn/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etnId: selected._id, amount }),
      });

      if (res.ok) {
        toast.success("Payout successful.");
        setSelected(null);
        setCustomAmount("");
        fetchEtns();
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to process payout.");
      }
    } catch (error) {
      toast.error("Failed to process payout.");
    }
    setPaying(false);
  }

  const filteredEtns = etns.filter(
    (etn) =>
      etn.name.toLowerCase().includes(search.toLowerCase()) ||
      etn.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEtns.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedEtns = filteredEtns.slice(startIndex, startIndex + limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ETN Management</h1>
          <p className="text-muted-foreground">Manage ETN users and payouts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEtns} className="gap-2">
          <Loader2 className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>ETN Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">User</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Total Earned</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : paginatedEtns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                      {search ? "No ETN users match your search" : "No ETN users found"}
                    </td>
                  </tr>
                ) : (
                  paginatedEtns.map((etn) => (
                    <tr key={etn._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            {etn.profileImage ? (
                              <AvatarImage
                                src={etn.profileImage}
                                className="cursor-pointer hover:opacity-80 transition-opacity object-cover"
                                onClick={() => {
                                  setSelectedImage(etn.profileImage);
                                  setImageModalOpen(true);
                                }}
                              />
                            ) : (
                              <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                                {etn.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">{etn.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{etn.email}</td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600">
                          {etn.totalPaid.toLocaleString()} birr
                        </span>
                      </td>
                      <td className="p-4">
                        <Button size="sm" onClick={() => setSelected(etn)} className="gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payout
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + limit, filteredEtns.length)} of{" "}
                {filteredEtns.length} results
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

      {/* Payout Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar>
                  <AvatarImage src={selected.profileImage} />
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  <p className="text-sm">Current: {selected.totalPaid} birr</p>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Payout Amount (Birr)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={settings.minimumPayout}
                  placeholder={`Minimum: ${settings.minimumPayout} birr`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum payout amount: {settings.minimumPayout} birr
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePay}
                  disabled={
                    paying || !customAmount || Number(customAmount) < settings.minimumPayout
                  }
                  className="flex-1"
                >
                  {paying ? "Processing..." : "Confirm Payout"}
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">
                  Cancel
                </Button>
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
  );
}
