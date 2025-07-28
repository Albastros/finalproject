"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { X } from "lucide-react";

const SUBJECTS = ["Math", "Science", "English", "Programming", "History"];
const LANGUAGES = ["Amharic", "English"];

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  gender: string;
  subjects: string[];
  experience: string;
  languages: string[];
  resume: File[];
  certificate: File[];
  profileImage: File | null;
  price: string;
  tutoringType: string;
  nationalId: File | null;
};

const defaultAvailability = {
  monday: { available: false, from: "", to: "" },
  tuesday: { available: false, from: "", to: "" },
  wednesday: { available: false, from: "", to: "" },
  thursday: { available: false, from: "", to: "" },
  friday: { available: false, from: "", to: "" },
  saturday: { available: false, from: "", to: "" },
  sunday: { available: false, from: "", to: "" },
};

export default function StartTutoringPage() {
  const { data: session, isPending } = useSession();

  console.log("session", session);
  useEffect(() => {
    if (!isPending && session?.user?.email) {
      console.log("DONE LOADING");
      setForm((prevForm) => ({
        ...prevForm,
        email: session.user.email,
        name: session.user.name,
      }));
    }
  }, [session]);

  const [form, setForm] = useState<FormState>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    location: "",
    bio: "",
    gender: "",
    subjects: [],
    experience: "",
    languages: [],
    resume: [],
    certificate: [],
    profileImage: null,
    price: "100",
    tutoringType: "online",
    nationalId: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);
  const [resumePreview, setResumePreview] = useState<string[]>([]);

  const showNameInvalidTooltip = () => {
    setShowNameTooltip(true);
    setTimeout(() => setShowNameTooltip(false), 2500);
  };

  const showPhoneInvalidTooltip = () => {
    setShowPhoneTooltip(true);
    setTimeout(() => setShowPhoneTooltip(false), 2500);
  };

  const showLocationInvalidTooltip = () => {
    setShowLocationTooltip(true);
    setTimeout(() => setShowLocationTooltip(false), 2500);
  };

  const validateName = (name: string) => {
    if (!name || name.trim() === "") {
      return "Name is required";
    }
    // Only allow letters (a-z, A-Z) and spaces
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Name can only contain letters and spaces";
    }
    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "Name cannot contain multiple consecutive spaces";
    }
    // Check if name starts or ends with space
    if (name.startsWith(' ') || name.endsWith(' ')) {
      return "Name cannot start or end with spaces";
    }
    return null;
  };

  const validateLocation = (location: string) => {
    if (!location || location.trim() === "") {
      return "Location is required";
    }
    if (location.length > 100) {
      return "Location must not exceed 100 characters";
    }
    // Allow letters, numbers, spaces, and commas
    if (!/^[A-Za-z0-9\s,]+$/.test(location)) {
      return "Location can only contain letters, numbers, spaces, and commas";
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required";
    }
    // Ethiopian phone number format: +251912345678 or 0912345678
    if (!/^(\+251|0)?[1-9][0-9]{8}$/.test(phone)) {
      return "Enter a valid phone number";
    }
    return null;
  };

  const removeCertificate = (index: number) => {
    setForm((f) => ({
      ...f,
      certificate: f.certificate.filter((_, i) => i !== index),
    }));
  };

  const [certificatePreview, setCertificatePreview] = useState<string[]>([]);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
  const [availability, setAvailability] = useState(defaultAvailability);

  useEffect(() => {
    if (form.resume && form.resume.length) {
      setResumePreview(form.resume.map((f) => URL.createObjectURL(f)));
    } else {
      setResumePreview([]);
    }
  }, [form.resume]);

  useEffect(() => {
    if (form.certificate && form.certificate.length) {
      setCertificatePreview(form.certificate.map((f) => URL.createObjectURL(f)));
    } else {
      setCertificatePreview([]);
    }
  }, [form.certificate]);

  useEffect(() => {
    if (form.profileImage) {
      setProfileImagePreview(URL.createObjectURL(form.profileImage));
    } else {
      setProfileImagePreview(null);
    }
  }, [form.profileImage]);

  useEffect(() => {
    if (form.nationalId) {
      setNationalIdPreview(URL.createObjectURL(form.nationalId));
    } else {
      setNationalIdPreview(null);
    }
  }, [form.nationalId]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type, files, checked } = e.target as HTMLInputElement;
    if (type === "file" && files) {
      if (name === "resume" || name === "certificate") {
        setForm((f) => ({ ...f, [name]: Array.from(files) }));
      } else if (name === "profileImage" || name === "nationalId") {
        setForm((f) => ({ ...f, [name]: files[0] }));
      }
    } else if (type === "checkbox" && name === "languages") {
      setForm((f) => ({
        ...f,
        languages: checked ? [...f.languages, value] : f.languages.filter((l) => l !== value),
      }));
    } else if (type === "checkbox" && name === "subjects") {
      setForm((f) => ({
        ...f,
        subjects: checked ? [...f.subjects, value] : f.subjects.filter((s) => s !== value),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNameError("");
    setLocationError("");
    setPhoneError("");

    // Validate name
    const nameValidationError = validateName(form.name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      setLoading(false);
      return;
    }

    // Validate location
    const locationValidationError = validateLocation(form.location);
    if (locationValidationError) {
      setLocationError(locationValidationError);
      setLoading(false);
      return;
    }

    // Validate phone
    const phoneValidationError = validatePhone(form.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value && key !== "nationalId") {
        formData.append(key, value as any);
      }
    });
    formData.append("availability", JSON.stringify(availability));
    if (form.resume && form.resume.length) {
      form.resume.forEach((file) => formData.append("resume", file));
    }
    if (form.certificate && form.certificate.length) {
      form.certificate.forEach((file) => formData.append("certificate", file));
    }
    if (form.nationalId) {
      formData.append("nationalId", form.nationalId);
    }
    try {
      await axios.post("/api/tutor/apply", formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 text-center">
          <CardTitle>Application Submitted!</CardTitle>
          <p className="mt-4">
            Your application is under review. You will be notified once verified.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 min-h-[80vh] bg-muted/50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Start Tutoring: Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <Input
                    name="name"
                    value={form.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only letters and spaces
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        setForm((f) => ({ ...f, name: value }));
                        setNameError(""); // Clear error when user types valid characters
                        // Hide tooltip when valid character is typed
                        if (showNameTooltip) {
                          setShowNameTooltip(false);
                        }
                      }
                    }}
                    onKeyPress={(e) => {
                      // Check if the key is invalid (numbers or symbols)
                      if (!/[a-zA-Z\s]/.test(e.key)) {
                        e.preventDefault();
                        // Show tooltip for invalid character attempt
                        showNameInvalidTooltip();
                      }
                    }}
                    className={nameError ? "border-red-500" : ""}
                    required
                  />
                  {/* Tooltip for invalid character feedback */}
                  {showNameTooltip && (
                    <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Numbers and symbols are not allowed in the name field
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </div>
                {nameError && (
                  <p className="text-sm text-red-600 mt-1">{nameError}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-gray-100"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="relative">
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits, +, and specific patterns
                    if (/^[\d+]*$/.test(value)) {
                      setForm((f) => ({ ...f, phone: value }));
                      setPhoneError(""); // Clear error when user types
                      // Hide tooltip when valid character is typed
                      if (showPhoneTooltip) {
                        setShowPhoneTooltip(false);
                      }
                    }
                  }}
                  onKeyPress={(e) => {
                    // Check if the key is invalid (letters or symbols except +)
                    if (!/[\d+]/.test(e.key)) {
                      e.preventDefault();
                      // Show tooltip for invalid character attempt
                      showPhoneInvalidTooltip();
                    }
                  }}
                  className={phoneError ? "border-red-500" : ""}
                  placeholder="0912345678 or +251912345678"
                  required
                />
                {/* Tooltip for invalid character feedback */}
                {showPhoneTooltip && (
                  <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    Letters and symbols except + are not allowed
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
              {phoneError && (
                <p className="text-sm text-red-600 mt-1">{phoneError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <div className="relative">
                <Input
                  name="location"
                  value={form.location}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow letters, numbers, spaces, and commas
                    if (/^[A-Za-z0-9\s,]*$/.test(value) && value.length <= 100) {
                      setForm((f) => ({ ...f, location: value }));
                      setLocationError(""); // Clear error when user types valid characters
                      // Hide tooltip when valid character is typed
                      if (showLocationTooltip) {
                        setShowLocationTooltip(false);
                      }
                    }
                  }}
                  onKeyPress={(e) => {
                    // Check if the key is invalid (symbols except commas)
                    if (!/[A-Za-z0-9\s,]/.test(e.key)) {
                      e.preventDefault();
                      // Show tooltip for invalid character attempt
                      showLocationInvalidTooltip();
                    }
                  }}
                  className={locationError ? "border-red-500" : ""}
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  maxLength={100}
                  required
                />
                {/* Tooltip for invalid character feedback */}
                {showLocationTooltip && (
                  <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    Symbols are not allowed in this field
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
              {locationError && (
                <p className="text-sm text-red-600 mt-1">{locationError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio / About Me</label>
              <Textarea name="bio" value={form.bio} onChange={handleChange} required rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subjects to Teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <label key={subject} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="subjects"
                      value={subject}
                      checked={form.subjects.includes(subject)}
                      onChange={handleChange}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <Input
                name="experience"
                type="number"
                min="0"
                step="1"
                value={form.experience}
                onChange={handleChange}
                placeholder="Enter 0 for no prior experience"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Languages Spoken</label>
              <div className="flex gap-4">
                {LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="languages"
                      value={lang}
                      checked={form.languages.includes(lang)}
                      onChange={handleChange}
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tutoring Type</label>
              <select
                name="tutoringType"
                value={form.tutoringType}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload National ID (Image)</label>
              <Input name="nationalId" type="file" accept="image/*" onChange={handleChange} />
              {nationalIdPreview && (
                <div className="relative w-32 h-32 mt-2">
                  <img
                    src={nationalIdPreview}
                    alt="National ID Preview"
                    className="object-cover w-full h-full rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                    onClick={() => setForm((f) => ({ ...f, nationalId: null }))}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Resume / CV (PDF)</label>
              <Input
                name="resume"
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleChange}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {resumePreview.map((url, i) => (
                  <div key={i} className="relative">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-xs"
                    >
                      Resume {i + 1}
                    </a>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          resume: f.resume.filter((_, idx) => idx !== i),
                        }));
                      }}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Educational Certificates (PDF or Image) - Multiple files allowed
              </label>
              <Input
                name="certificate"
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {form.certificate.map((file, i) => (
                  <div key={i} className="relative border rounded p-2">
                    <div className="text-xs truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => removeCertificate(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {form.certificate.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No certificates uploaded yet</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Profile Photo (optional)
              </label>
              <Input name="profileImage" type="file" accept="image/*" onChange={handleChange} />
              {profileImagePreview && (
                <div className="relative w-32 h-32 mt-2">
                  <img
                    src={profileImagePreview}
                    alt="Profile Preview"
                    className="object-cover w-full h-full rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                    onClick={() => setForm((f) => ({ ...f, profileImage: null }))}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate (Birr)</label>
              <Input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Weekly Availability</h2>
              <p className="text-sm text-gray-600 mb-3">
                Set your available hours. You can set times across midnight (e.g., 10:00 PM to 2:00 AM)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(availability).map(([day, val]) => (
                  <div key={day} className="border rounded p-3 flex flex-col gap-2">
                    <label className="flex items-center gap-2 font-semibold capitalize">
                      <input
                        type="checkbox"
                        checked={val.available}
                        onChange={(e) =>
                          setAvailability((a) => ({
                            ...a,
                            [day as keyof typeof a]: {
                              ...a[day as keyof typeof a],
                              available: e.target.checked,
                            },
                          }))
                        }
                      />
                      {day}
                    </label>
                    {val.available && (
                      <div className="flex gap-2 items-center flex-wrap">
                        <div className="flex items-center gap-1">
                          <label className="text-sm">From:</label>
                          <input
                            type="time"
                            value={val.from}
                            onChange={(e) =>
                              setAvailability((a) => ({
                                ...a,
                                [day as keyof typeof a]: {
                                  ...a[day as keyof typeof a],
                                  from: e.target.value,
                                },
                              }))
                            }
                            className="input input-bordered text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-sm">To:</label>
                          <input
                            type="time"
                            value={val.to}
                            onChange={(e) =>
                              setAvailability((a) => ({
                                ...a,
                                [day as keyof typeof a]: {
                                  ...a[day as keyof typeof a],
                                  to: e.target.value,
                                },
                              }))
                            }
                            className="input input-bordered text-sm"
                          />
                        </div>
                        {val.from && val.to && (
                          <div className="text-xs text-gray-500">
                            {val.from > val.to ? 
                              `${val.from} - ${val.to} (next day)` : 
                              `${val.from} - ${val.to}`
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
