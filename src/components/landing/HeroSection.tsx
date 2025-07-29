"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Star, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Slide {
  image: string;
  alt: string;
  label: string;
  title: string;
  subtitle: string;
  supporting: string;
  cta1: { label: string; href: string; variant?: "default" | "outline" };
  cta2: { label: string; href: string; variant?: "default" | "outline" };
}

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    alt: "Beautiful stack of colorful books and learning materials",
    label: "BEST ONLINE COURSES",
    title: "The Best Online Learning Platform",
    subtitle:
      "Experience world-class education with our comprehensive online learning platform. Connect with expert tutors, access quality courses, and achieve your academic goals from anywhere.",
    supporting: "Join thousands of students and tutors. Start your journey today!",
    cta1: { label: "Read More", href: "/about", variant: "default" },
    cta2: { label: "Join Now", href: "/signup", variant: "outline" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    alt: "Open book with laptop showcasing digital learning",
    label: "LEARN ANYWHERE",
    title: "Flexible, Modern, Effective Tutoring",
    subtitle:
      "Learn from anywhere with our flexible tutoring platform. Book sessions with qualified tutors, study at your own pace, and access educational resources 24/7.",
    supporting: "Mobile-friendly, 24/7 access, and real-time support.",
    cta1: { label: "Browse Tutors", href: "/tutors", variant: "default" },
    cta2: { label: "Get Started", href: "/signup", variant: "outline" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80",
    alt: "Online video conference learning session with multiple participants",
    label: "MODERN LEARNING",
    title: "Interactive Online Classes",
    subtitle:
      "Engage in interactive online classes with live video sessions, real-time quizzes, collaborative tools, and instant feedback from experienced tutors.",
    supporting: "Engage with interactive tools and track your progress easily.",
    cta1: { label: "See Features", href: "#features", variant: "default" },
    cta2: { label: "Sign Up Free", href: "/signup", variant: "outline" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    alt: "Organized study materials and educational resources on desk",
    label: "EXPERT TUTORS",
    title: "Personalized Tutor Support",
    subtitle:
      "Connect with qualified, experienced tutors who provide personalized guidance tailored to your learning style. Get one-on-one support to accelerate your academic progress.",
    supporting: "Our tutors are vetted, experienced, and passionate about teaching.",
    cta1: { label: "Meet Tutors", href: "/tutors", variant: "default" },
    cta2: { label: "Become a Tutor", href: "/start-tutoring", variant: "outline" },
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextSlide, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <Image
          src={currentSlideData.image}
          alt={currentSlideData.alt}
          fill
          className="object-cover opacity-30 transition-all duration-1000 ease-in-out"
          priority
        />
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 z-5">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="text-white space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.span
                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-300/30 rounded-full text-cyan-200 text-sm font-medium uppercase tracking-wider shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {'✨'} {currentSlideData.label}
              </motion.span>
              
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {currentSlideData.title}
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentSlideData.subtitle}
              </motion.p>
              
              <motion.p
                className="text-base text-cyan-200 font-medium flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {currentSlideData.supporting}
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                asChild
              >
                <Link href={currentSlideData.cta1.href} className="flex items-center gap-2">
                  {currentSlideData.cta1.label}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {'→'}
                  </motion.div>
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
                asChild
              >
                <Link href={currentSlideData.cta2.href} className="flex items-center gap-2">
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {currentSlideData.cta2.label}
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[
                { icon: Users, value: "10K+", label: "Students", color: "cyan" },
                { icon: BookOpen, value: "500+", label: "Courses", color: "blue" },
                // { icon: Star, value: "4.8", label: "Rating", color: "yellow" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-3 group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`p-3 bg-gradient-to-r from-${stat.color}-500/20 to-${stat.color}-600/20 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-300`} />
                  </div>
                  <div>
                    <motion.div
                      className="text-2xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Video/Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Students learning"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  className="p-6 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </motion.button>
              </motion.div>
            </div>
            
            {/* Enhanced Floating Elements */}
            <motion.div
              className="absolute -top-6 -right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-medium text-white">Live Classes</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-6 -left-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-white">Top Rated</span>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute top-1/2 -left-8 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl shadow-lg border border-white/20"
              animate={{ x: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-white">98%</div>
                <div className="text-xs text-gray-300">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-lg">
          <motion.button
            onClick={prevSlide}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125 shadow-lg shadow-white/50"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          <motion.button
            onClick={nextSlide}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 right-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/70 cursor-pointer group"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-wider group-hover:text-white transition-colors">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"></div>
          <motion.div
            className="w-2 h-2 bg-white/70 rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
