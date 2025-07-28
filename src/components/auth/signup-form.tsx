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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only letters and spaces
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        setFullname(value);
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
                        showInvalidCharacterTooltip();
                      }
                    }}
                    value={fullname}
                    id="name"
                    type="text"
                    placeholder="Achour Meguenni"
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
                  <p className="text-sm text-red-600">{nameError}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(""); // Clear error when user types
                  }}
                  value={email}
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  required
                />
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}

              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    setPasswordError(""); // Clear error when user types
                  }}
                  value={password}
                  id="password"
                  type="password"
                  placeholder={`At least ${settings.passwordMinLength} characters`}
                  required
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}

              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <PasswordInput
                  onChange={(e: any) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError(""); // Clear error when user types
                  }}
                  value={confirmPassword}
                  id="confirmPassword"
                  type="password"
                  required
                />
                {confirmPasswordError && (
                  <p className="text-sm text-red-600">{confirmPasswordError}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? <Loader2 className="animate-spin" strokeWidth={2} /> : "Sign Up"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
