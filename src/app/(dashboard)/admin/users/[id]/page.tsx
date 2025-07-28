"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Star, Clock, Download, FileText, Globe, Users, GraduationCap, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  profileImage?: string;
  bio?: string;
  subjects?: string[];
  languages?: string[];
  experience?: number;
  price?: number;
  location?: string;
  avgRating?: number;
  gender?: string;
  tutoringType?: string;
  resumeUrls?: string[];
  certificateUrls?: string[];
  nationalIdUrl?: string;
  availability?: any;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users?id=${params.id}`);
      setUser(response.data.user);
    } catch (err) {
      setError("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading user profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error || "User not found"}</div>
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                    {user.role.toUpperCase()}
                  </Badge>
                  {user.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.gender}</span>
                  </div>
                )}
                {user.tutoringType && (user.role === 'tutor' || user.role === 'user') && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Type: {user.tutoringType}</span>
                  </div>
                )}
                {user.experience !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Experience: {user.experience} years</span>
                  </div>
                )}
                {user.avgRating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Rating: {user.avgRating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>
            </div>

            {user.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Bio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Tutor Specific Information */}
            {user.role === 'tutor' && (
              <>
                {/* Subjects and Languages */}
                <div className="space-y-4">
                  {user.subjects && user.subjects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-sm">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.languages && user.languages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.languages.map((language) => (
                          <Badge key={language} variant="outline" className="text-sm">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  {user.resumeUrls && user.resumeUrls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Resume</h3>
                      <div className="space-y-2">
                        {user.resumeUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm flex-1">Resume {index + 1}</span>
                            <Button size="sm" variant="outline" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.certificateUrls && user.certificateUrls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Certificates</h3>
                      <div className="space-y-2">
                        {user.certificateUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm flex-1">Certificate {index + 1}</span>
                            <Button size="sm" variant="outline" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.nationalIdUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">National ID</h3>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm flex-1">National ID Document</span>
                        <Button size="sm" variant="outline" asChild>
                          <a href={user.nationalIdUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability Schedule */}
                {user.availability && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Availability Schedule</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(user.availability).map(([day, schedule]: [string, any]) => (
                        <div key={day} className={`flex justify-between items-center p-2 rounded border ${
                          schedule.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <span className="font-medium capitalize text-sm">{day}</span>
                          {schedule.available ? (
                            <span className="text-xs text-green-700">
                              {schedule.from} - {schedule.to}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Not available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email Verified:</span>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Yes" : "No"}
                </Badge>
              </div>
              {user.role === 'tutor' && (
                <div className="flex justify-between text-sm">
                  <span>Account Verified:</span>
                  <Badge variant={user.isVerified ? "default" : "secondary"}>
                    {user.isVerified ? "Yes" : "Pending"}
                  </Badge>
                </div>
              )}
              {(user.role === 'user' || user.role === 'tutor') && (
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={user.role === 'user' ? "outline" : "default"}>
                    {user.role === 'user' ? 'Active' : (user.isVerified ? 'Approved' : 'Pending')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
















