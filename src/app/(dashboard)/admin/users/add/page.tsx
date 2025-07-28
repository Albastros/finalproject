"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { ArrowLeft, Users, GraduationCap, Mail, UserCheck, Globe, Shield, User, Clock, Star, MapPin, Upload, FileText, Phone, Lock, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AddUserPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    bio: "",
    gender: "",
    subjects: [] as string[],
    experience: "",
    languages: [] as string[],
    price: "",
    location: "",
    tutoringType: "online"
  });
  
  const [files, setFiles] = useState({
    resume: [] as File[],
    certificate: [] as File[],
    profileImage: null as File | null,
    nationalId: null as File | null
  });

  const [availability, setAvailability] = useState({
    monday: { available: false, from: "", to: "" },
    tuesday: { available: false, from: "", to: "" },
    wednesday: { available: false, from: "", to: "" },
    thursday: { available: false, from: "", to: "" },
    friday: { available: false, from: "", to: "" },
    saturday: { available: false, from: "", to: "" },
    sunday: { available: false, from: "", to: "" }
  });

  const [settings, setSettings] = useState({ passwordMinLength: 8 });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < settings.passwordMinLength) {
      return `Password must be at least ${settings.passwordMinLength} characters`;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pwd)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return null;
  };

  const subjectOptions = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", 
    "Geography", "Computer Science", "Economics", "Accounting", "Art", "Music"
  ];

  const languageOptions = [
    "English", "Amharic", "Oromo", "Tigrinya", "Somali", "Arabic", "French", "Spanish"
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  };

  const resetForm = () => {
    setSelectedRole("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      phone: "",
      bio: "",
      gender: "",
      subjects: [],
      experience: "",
      languages: [],
      price: "",
      location: "",
      tutoringType: "online"
    });
    setFiles({
      resume: [],
      certificate: [],
      profileImage: null,
      nationalId: null
    });
    setError("");
    setSuccess("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    
    if (type === "file" && files) {
      if (name === "resume") {
        setFiles(prev => ({ ...prev, resume: Array.from(files) }));
      } else if (name === "certificate") {
        setFiles(prev => ({ ...prev, certificate: Array.from(files) }));
      } else if (name === "profileImage" || name === "nationalId") {
        setFiles(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate password
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare role-specific data
      let userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Add role-specific fields only
      if (formData.role === 'user') {
        // Student - only basic info (no tutoring preference)
        // No additional fields needed
      } else if (formData.role === 'tutor') {
        // Tutor - all professional fields
        userData = {
          ...userData,
          phone: formData.phone,
          bio: formData.bio,
          gender: formData.gender,
          subjects: formData.subjects,
          experience: formData.experience ? parseInt(formData.experience) : 0,
          languages: formData.languages,
          price: formData.price ? parseFloat(formData.price) : 0,
          location: formData.location,
          tutoringType: formData.tutoringType
        };
      }
      // For 'etn' and 'admin' roles, only basic fields (name, email, password, role) are sent

      const response = await axios.post("/api/admin/users", userData, {
        headers: { 
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        setSuccess("User created successfully!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      } else {
        throw new Error(response.data.error || "Failed to create user");
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Step
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="gap-2 hover:bg-white/80">
                <ArrowLeft className="w-4 h-4" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Create New Account
              </h1>
              <p className="text-muted-foreground text-lg mt-1">Choose the type of account to create</p>
            </div>
          </div>

          {/* Role Selection Cards */}
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                Select Account Type
              </CardTitle>
              <p className="text-muted-foreground">Choose the role for the new user account</p>
            </CardHeader>
            <CardContent className="p-12">
              <div className="grid grid-cols-4 gap-8">
                {/* Student Card */}
                <div 
                  onClick={() => handleRoleSelect('user')}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <Card className="h-full border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-indigo-900/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Student</h3>
                      <p className="text-muted-foreground text-xs mb-2 leading-relaxed">Create a student account for learning and accessing tutoring services</p>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 px-2 py-0.5 text-xs font-medium">
                        Basic Account
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Tutor Card */}
                <div 
                  onClick={() => handleRoleSelect('tutor')}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <Card className="h-full border-2 border-transparent hover:border-green-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-900/30 dark:via-green-800/20 dark:to-emerald-900/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-3">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">Tutor</h3>
                      <p className="text-muted-foreground text-xs mb-2 leading-relaxed">Create a tutor account for teaching and providing educational services</p>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 px-2 py-0.5 text-xs font-medium">
                        Professional
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* ETN Card */}
                <div 
                  onClick={() => handleRoleSelect('etn')}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <Card className="h-full border-2 border-transparent hover:border-orange-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 dark:from-orange-900/30 dark:via-orange-800/20 dark:to-amber-900/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-3">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">ETN</h3>
                      <p className="text-muted-foreground text-xs mb-2 leading-relaxed">Create an ETN account for educational technology management</p>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 px-2 py-0.5 text-xs font-medium">
                        ETN Access
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Card */}
                <div 
                  onClick={() => handleRoleSelect('admin')}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <Card className="h-full border-2 border-transparent hover:border-purple-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-violet-900/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-3">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">Admin</h3>
                      <p className="text-muted-foreground text-xs mb-2 leading-relaxed">Create an admin account with full platform management access</p>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 px-2 py-0.5 text-xs font-medium">
                        Full Access
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={resetForm} className="gap-2 hover:bg-white/80">
            <ArrowLeft className="w-4 h-4" />
            Back to Role Selection
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Create {selectedRole === 'user' ? 'Student' : 
                     selectedRole === 'admin' ? 'Admin' : 
                     selectedRole.toUpperCase()} Account
            </h1>
            <p className="text-muted-foreground text-lg mt-1">Fill in the details to create the account</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              {selectedRole === 'tutor' ? 'Tutor Registration Form' : 
               selectedRole === 'etn' ? 'ETN Registration Form' : 
               selectedRole === 'admin' ? 'Admin Registration Form' :
               'Student Registration Form'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                      className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                      className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Password *
                    </label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={`At least ${settings.passwordMinLength} characters`}
                      required
                      className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
                
                {/* Tutor-specific fields for phone, gender, and bio */}
                {selectedRole === 'tutor' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          Phone Number
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gender</label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Tutor-specific fields */}
              {selectedRole === 'tutor' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Professional Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Experience (years)
                      </label>
                      <Input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years of experience"
                        className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        Hourly Rate (Birr)
                      </label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Rate per hour"
                        className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Location
                      </label>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Your location"
                        className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        Tutoring Type
                      </label>
                      <Select value={formData.tutoringType} onValueChange={(value) => setFormData(prev => ({ ...prev, tutoringType: value }))}>
                        <SelectTrigger className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* File Uploads Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">Documents & Media</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          Resume/CV
                        </label>
                        <Input
                          type="file"
                          name="resume"
                          multiple
                          accept=".pdf,.doc,.docx"
                          onChange={handleChange}
                          className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {files.resume.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {files.resume.length} file(s) selected
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          Certificates (Multiple allowed)
                        </label>
                        <Input
                          type="file"
                          name="certificate"
                          multiple
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleChange}
                          className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {files.certificate.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {files.certificate.length} certificate(s) selected
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Profile Photo
                        </label>
                        <Input
                          type="file"
                          name="profileImage"
                          accept="image/*"
                          onChange={handleChange}
                          className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {files.profileImage && (
                          <div className="text-xs text-muted-foreground">
                            {files.profileImage.name}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          National ID
                        </label>
                        <Input
                          type="file"
                          name="nationalId"
                          accept="image/*,.pdf"
                          onChange={handleChange}
                          className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {files.nationalId && (
                          <div className="text-xs text-muted-foreground">
                            {files.nationalId.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Availability */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">Weekly Availability</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(availability).map(([day, schedule]) => (
                        <div key={day} className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700">
                          <div className="w-24">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={schedule.available}
                                onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm font-medium capitalize">{day}</span>
                            </label>
                          </div>
                          {schedule.available && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={schedule.from}
                                onChange={(e) => handleAvailabilityChange(day, 'from', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-sm text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={schedule.to}
                                onChange={(e) => handleAvailabilityChange(day, 'to', e.target.value)}
                                className="w-32"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subjects Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      Subjects to Teach
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700">
                      {subjectOptions.map((subject) => (
                        <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject)}
                            onChange={() => handleSubjectChange(subject)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Languages</label>
                    <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700">
                      {languageOptions.map((language) => (
                        <label key={language} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.languages.includes(language)}
                            onChange={() => handleLanguageChange(language)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Create {selectedRole === 'user' ? 'Student' : selectedRole.toUpperCase()} Account
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                  className="flex-1 h-12 gap-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






















