"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, School, MessageCircle } from "lucide-react";
import { SignOut } from "../auth/sign-out";
import { useSession } from "@/hooks/use-session";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
// import { Suspense } from "react";

export default function LandingNavbar() {
  const { data: session, isPending } = useSession();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/tutors", label: "Tutors" },
    { href: "/testimonial", label: "Testimonial" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full mx-auto backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-lg">
      <div className="container flex h-20 items-center justify-between mx-auto px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <School className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
              TutorMatch
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-50/80 group"
            >
              <span className="relative z-10">{link.label}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <>
              {session.user?.role !== "admin" && session.user?.role !== "etn" && (
                <Link href="/chat">
                  <Button variant="ghost" className="relative p-2">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                </Link>
              )}
              <NotificationBell />
              <SignOut />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 rounded-lg border border-transparent hover:border-blue-200/50">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold">
                  <span className="flex items-center gap-2">
                    Sign Up
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center border-b pb-4">
                <Link href="/" className="flex items-center space-x-2">
                  <School className="h-6 w-6 text-purple-600" />
                  <span className="font-bold">TutorMatch</span>
                </Link>
              </div>
              <div className="flex flex-col mt-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto border-t pt-4 flex flex-col gap-2">
                <ThemeToggle />
                <Button variant="ghost" className="hover:bg-blue-100">
                  Log In
                </Button>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full">
                  Sign Up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
