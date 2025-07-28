"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pen, X, Share2, Copy, Facebook, Twitter, Linkedin, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TUTORING_TYPES = ["online", "in-person", "both"];

export default function ProfileView({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [tutoringType, setTutoringType] = useState(user?.tutoringType || "online");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.image || null);
  const [saving, setSaving] = useState(false);
  // Tutor-specific fields
  const [experience, setExperience] = useState(user?.experience || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [about, setAbout] = useState(user?.bio || "");
  const [hourlyRate, setHourlyRate] = useState(user?.price || "");
  const [location, setLocation] = useState(user?.location || "");
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [existingCertificates, setExistingCertificates] = useState(user?.certificateUrls || []);

  const profileUrl =
    typeof window !== "undefined" ? `${window.location.origin}/tutor/${user?.id || user?._id}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const text = `Check out ${user?.name}'s profile`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  // Handle certificate file selection
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertificateFiles(prev => [...prev, ...files]);
  };

  // Remove certificate from new uploads (not existing ones)
  const removeCertificateFile = (index: number) => {
    setCertificateFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSheetOpen = (open: boolean) => {
    setOpen(open);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("tutoringType", tutoringType);
      
      // Add location for all users
      formData.append("location", location);
      
      // Add tutor-specific fields
      if (user?.role === "tutor") {
        formData.append("about", about);
        formData.append("phone", phone);
        formData.append("experience", experience.toString());
        formData.append("hourlyRate", hourlyRate.toString());
        
        // Add certificate files
        certificateFiles.forEach((file, index) => {
          formData.append(`certificates`, file);
        });
      }
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setOpen(false);
        // Reset certificate files
        setCertificateFiles([]);
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh] bg-muted/50 py-8">
      {/* Cover Gradient */}
      <div className="w-full max-w-3xl rounded-t-2xl bg-gradient-to-r from-orange-100 to-pink-100 h-40 relative flex items-end justify-center">
        <div className="absolute -bottom-12">
          <Image
            src={imagePreview || "/profile-mock.jpg"}
            alt="Profile picture"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
        <Sheet open={open} onOpenChange={handleSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              title="Edit Profile"
            >
              <Pen className="w-5 h-5 text-gray-600" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="max-w-full w-full sm:max-w-4xl mx-auto rounded-t-2xl p-6 overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
            </SheetHeader>

            <div className="flex flex-row gap-8 mt-4 h-full">
              {/* Left Column - Profile Preview */}
              <div className="flex-shrink-0 w-80 space-y-6">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-32 h-32">
                    <img
                      src={imagePreview || "/profile-mock.jpg"}
                      alt="Profile Preview"
                      className="object-cover w-full h-full rounded-full border-4 border-gray-200"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg border"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(user?.image || null);
                        }}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{name || user?.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                {/* Share Profile Section */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Share Profile</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input value={profileUrl} readOnly className="text-xs" />
                      <Button size="sm" variant="outline" onClick={handleCopyLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareFacebook}
                        className="flex-1"
                      >
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareTwitter}
                        className="flex-1"
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareLinkedIn}
                        className="flex-1"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Edit Form */}
              <div className="flex-1 min-w-0">
                <form className="space-y-6" onSubmit={handleSave}>
                  {/* Basic Information Section */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Pen className="w-5 h-5" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)} 
                          placeholder="Your location (e.g., New York, NY)"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Profile Image</label>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                      </div>
                    </div>
                  </Card>

                  {/* Role-specific Information */}
                  {user?.role !== "admin" && user?.role !== "etn" && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Profile Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bio</label>
                          <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tutoring Type</label>
                          <select
                            className="w-full border rounded-md px-3 py-2 bg-background"
                            value={tutoringType}
                            onChange={(e) => setTutoringType(e.target.value)}
                            required
                          >
                            {TUTORING_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Tutor-specific Information */}
                  {user?.role === "tutor" && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Tutor Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">About</label>
                          <Textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            rows={4}
                            className="resize-none"
                            placeholder="Tell students about yourself..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone Number</label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Experience (Years)</label>
                          <Input
                            type="number"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="Years of experience"
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Hourly Rate ($)</label>
                          <Input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="Your hourly rate"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Certificates Section */}
                      <div className="mt-6">
                        <h4 className="text-md font-semibold mb-3">Certificates</h4>
                        
                        {/* Existing Certificates */}
                        {existingCertificates.length > 0 && (
                          <div className="mb-4">
                            <label className="text-sm font-medium text-muted-foreground">Current Certificates</label>
                            <div className="mt-2 space-y-2">
                              {existingCertificates.map((cert: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <span className="text-sm flex-1">Certificate {index + 1}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(cert, '_blank')}
                                  >
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Certificate Upload */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Upload Additional Certificates</label>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={handleCertificateChange}
                          />
                          {certificateFiles.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {certificateFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <span className="text-sm flex-1">{file.name}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeCertificateFile(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}



                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </SheetClose>
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Card className="w-full max-w-3xl mt-16">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-2xl font-bold">{user?.name || "Unknown User"}</CardTitle>
          {user?.role !== "admin" && user?.role !== "etn" && user?.location && (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <span role="img" aria-label="flag">
                🇺🇸
              </span>
              {user.location}
            </div>
          )}
          <div className="text-muted-foreground text-sm">{user?.email}</div>
          <div className="text-muted-foreground text-xs font-medium mt-1">
            Role: {user?.role || "student"}
          </div>
          {user?.role !== "admin" && (
            <div className="text-sm mt-2 text-center max-w-md">{user?.bio}</div>
          )}
          <div className="flex gap-2 mt-4">
            {user?.role === "user" && (
              <Link href="/start-tutoring">
                <button className="px-4 py-2 rounded border text-sm font-medium">
                  Start Tutoring
                </button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="px-4 py-2 rounded bg-primary text-white text-sm font-medium gap-2">
                  <Share2 className="w-4 h-4" />
                  Share profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareFacebook} className="gap-2">
                  <Facebook className="w-4 h-4" />
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTwitter} className="gap-2">
                  <Twitter className="w-4 h-4" />
                  Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareLinkedIn} className="gap-2">
                  <Linkedin className="w-4 h-4" />
                  Share on LinkedIn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>{/* Add more profile details here if needed */}</CardContent>
      </Card>
    </div>
  );
}
