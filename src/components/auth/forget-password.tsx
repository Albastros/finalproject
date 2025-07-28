/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Terminal } from "lucide-react";

import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export function ForgetPassword({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
        fetchOptions: {
          onSuccess: (ctx: any) => {
            console.log("success on call: ", ctx);
            toast.success("We have successfully sent your a verification email to your account.");
          },
          onError: (ctx: any) => {
            console.log("Error on call: ", ctx);
            alert(ctx.error.message);
          },
          onResponse: () => {
            setLoading(false);
            setIsSubmitting(false);
          },
        },
      });
    } catch (err) {
      console.log("Error on call: ", err);
      setError("An error occurred");
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forget your password</CardTitle>
          <CardDescription>Enter your email and get a reset link to your inbox</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button disabled={isSubmitting} type="submit" className="w-full">
                {isSubmitting ? (
                  <Loader2 className="animate-spin" strokeWidth={2} />
                ) : (
                  "Send a reset link"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
