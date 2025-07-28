/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Terminal } from "lucide-react";

import { toast } from "sonner";
import { PasswordInput } from "../ui/password-input";
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react";

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

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setError(emailValidationError);
      return;
    }

    const { data, error } = await authClient.signIn.email(
      {
        /**
         * The user email
         */
        email,
        /**
         * The user password
         */
        password,
        /**
         * a url to redirect to after the user verifies their email (optional)
         */
        callbackURL: "/dashboard",
        /**
         * remember the user session after the browser is closed.
         * @default true
         */
        rememberMe: false,
      },
      {
        onRequest: (ctx) => {
          setLoading(true);
        },
        onSuccess: (ctx) => {
          toast.success("Login success");
          router.replace("/dashboard");
        },
        onError: (ctx) => {
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
      {/* More colorful, vibrant background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-50 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-300 opacity-50 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-300 opacity-40 rounded-full blur-2xl animate-pulse z-0" style={{transform:'translate(-50%,-50%)'}} />
      <div className="w-full max-w-md z-10">
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-black/70 shadow-2xl rounded-3xl border-0 transition-transform duration-500 hover:scale-105 hover:shadow-3xl animate-fade-in">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x tracking-tight drop-shadow-lg">Login to your account</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border border-red-400/70 shadow-lg" variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3 relative">
                  <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-200">Email</Label>
                  <span className="absolute left-3 top-10 text-pink-400">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.5-.5a.5.5 0 0 0-.5.5v.217l8 5.333 8-5.333V6.5a.5.5 0 0 0-.5-.5h-15Zm16 2.383-7.62 5.076a1 1 0 0 1-1.16 0L3.5 8.383V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.383Z"/></svg>
                  </span>
                  <Input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="pl-10 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                  />
                </div>
                <div className="grid gap-3 relative">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-200">Password</Label>
                    <a
                      href="/forget-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <span className="absolute left-3 top-10 text-purple-400">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 1 1 6 0v3H9V7Zm-3 5h12v7H6v-7Z"/></svg>
                  </span>
                  <PasswordInput
                    onChange={(e: any) => setPassword(e.target.value)}
                    value={password}
                    id="password"
                    type="password"
                    required
                    className="pl-10 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all shadow-sm bg-white/80 dark:bg-gray-900/60"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 focus:ring-4 focus:ring-pink-300/40 focus:outline-none animate-glow"
                    style={{boxShadow:'0 0 16px 2px #e879f9, 0 2px 8px 0 #a5b4fc'}}
                  >
                    {loading ? <Loader2 className="animate-spin" strokeWidth={2} /> : "Login"}
                  </Button>
                </div>
              </div>
              {/* Footer removed for a cleaner look */}
            </form>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="mx-4 text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={async () => {
                  await authClient.signIn.social({
                    provider: "google",
                    fetchOptions: {
                      onRequest: (ctx: any) => {
                        toast.loading("Authenticating...");
                      },
                      onSuccess: (ctx: any) => {
                        toast.success("Authentication Redirecting...");
                      },
                      onError: (ctx: any) => {
                        setError(ctx.error.message);
                      },
                    },
                    callbackURL: "/dashboard",
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/80 dark:bg-gray-900/60 border-2 border-gray-200 hover:border-pink-400 shadow-md hover:shadow-xl transition-all font-semibold text-gray-700 dark:text-gray-200 hover:scale-105"
              >
                <IconBrandGoogle className="w-5 h-5 fill-current" />
                <span>Continue with Google</span>
              </button>
            </div>
          </CardContent>
          {/* Professional bottom link inside card */}
          <div className="pt-4 pb-2 px-6">
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-500 hover:underline font-semibold">Sign up</a>
            </div>
          </div>
        </Card>
      </div>
      {/* Animations (no footer) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 16px 2px #e879f9, 0 2px 8px 0 #a5b4fc; }
          50% { box-shadow: 0 0 32px 8px #a5b4fc, 0 2px 16px 0 #e879f9; }
        }
        .animate-glow { animation: glow 2.5s infinite alternate; }
        @keyframes gradient-x {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
