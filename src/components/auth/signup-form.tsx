"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Terminal, Apple } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "../ui/password-input";
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react";
import axios from "axios";

export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [settings, setSettings] = useState({ passwordMinLength: 8 });
  const router = useRouter();

  const showInvalidCharacterTooltip = () => {
    setShowNameTooltip(true);
    // Auto-hide tooltip after 2.5 seconds
    setTimeout(() => {
      setShowNameTooltip(false);
    }, 2500);
  };

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

  const validatePassword = (pwd: string) => {
    if (pwd.length < settings.passwordMinLength) {
      return `Password must be at least ${settings.passwordMinLength} characters`;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pwd)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") return "Email is required";
    if (email.length > 254) return "Email must not exceed 254 characters";
    
    // Check if email starts with @ or ends with @ or has no @ symbol
    if (email.startsWith('@') || email.endsWith('@') || !email.includes('@')) {
      return "Please enter a valid email address";
    }
    
    // Check if email has exactly one @ symbol
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return "Please enter a valid email address";
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    
    const [localPart, domain] = email.split('@');
    
    // Check if local part is empty
    if (!localPart || localPart.trim() === "") return "Please enter a valid email address";
    
    // Check if domain is empty or invalid
    if (!domain || domain.trim() === "" || domain === ".com" || !domain.includes('.')) {
      return "Please enter a valid email address";
    }
    
    if (localPart.length > 64) return "Email local part must not exceed 64 characters";
    if (localPart.startsWith('.') || localPart.endsWith('.')) return "Email cannot start or end with a dot";
    if (localPart.startsWith('-') || localPart.endsWith('-')) return "Email cannot start or end with a hyphen";
    if (localPart.includes('..')) return "Email cannot contain consecutive dots";
    
    if (domain.startsWith('-') || domain.endsWith('-')) return "Domain cannot start or end with a hyphen";
    if (domain.includes('..')) return "Domain cannot contain consecutive dots";
    if (domain.startsWith('.') || domain.endsWith('.')) return "Please enter a valid email address";
    
    return null;
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    setPasswordError("");
    setEmailError("");
    setConfirmPasswordError("");
    setNameError("");

    // Validate name
    const nameValidationError = validateName(fullname);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name: fullname,
      },
      {
        onRequest: (ctx: any) => {
          setLoading(true);
        },
        onSuccess: (ctx: any) => {
          toast.success("We have sent you an email. Please verify your email to continue!");
          // Don't redirect to dashboard, stay on signup page or redirect to login
          router.push("/login");
        },
        onError: (ctx: any) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3e7ef] via-[#fbe8ff] to-[#e0f2fe] dark:bg-[#23272f] p-4 overflow-hidden",
        className
      )}
      {...props}
    >
      {/* More colorful, vibrant background shapes (same as login) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-50 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-300 opacity-50 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-300 opacity-40 rounded-full blur-2xl animate-pulse z-0" style={{transform:'translate(-50%,-50%)'}} />
      <div className="w-full max-w-lg z-10">
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-black/70 shadow-2xl rounded-3xl border-0 transition-transform duration-500 hover:scale-105 hover:shadow-3xl animate-fade-in">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">Sign Up</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 border border-red-400/70 shadow-lg">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-200">Full Name</Label>
                  <div className="relative">
                    <Input
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          setFullname(value);
                          setNameError("");
                          if (showNameTooltip) {
                            setShowNameTooltip(false);
                          }
                        }
                      }}
                      onKeyPress={(e) => {
                        if (!/[a-zA-Z\s]/.test(e.key)) {
                          e.preventDefault();
                          showInvalidCharacterTooltip();
                        }
                      }}
                      value={fullname}
                      id="name"
                      type="text"
                      placeholder="Achour Meguenni"
                      required
                      className="rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                    />
                    {showNameTooltip && (
                      <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                        Numbers and symbols are not allowed in the name field
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </div>
                  {nameError && (
                    <p className="text-sm text-red-600">{nameError}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-200">Email</Label>
                  <Input
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    value={email}
                    id="email"
                    type="email"
                    placeholder="me@example.com"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                  />
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-200">Password</Label>
                  </div>
                  <PasswordInput
                    onChange={(e: any) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    value={password}
                    id="password"
                    type="password"
                    placeholder={`At least ${settings.passwordMinLength} characters`}
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="confirmPassword" className="font-semibold text-gray-700 dark:text-gray-200">Confirm Password</Label>
                  </div>
                  <PasswordInput
                    onChange={(e: any) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError("");
                    }}
                    value={confirmPassword}
                    id="confirmPassword"
                    type="password"
                    required
                    className="rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                  />
                  {confirmPasswordError && (
                    <p className="text-sm text-red-600">{confirmPasswordError}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
                  >
                    {loading ? <Loader2 className="animate-spin" strokeWidth={2} /> : "Sign Up"}
                  </Button>
                </div>
              </div>
              {/* Removed footer or extra bottom links for a cleaner look */}
            </form>
          </CardContent>
          {/* Professional bottom link inside card */}
          <div className="pt-4 pb-2 px-6">
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
              Already have an account?{' '}
              <a href="/login" className="text-pink-500 hover:underline font-semibold">Login</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
