"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const featured = {
  name: "Abebe K.",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80", // Young adult Ethiopian male
  title: "University Student",
  content:
    "This platform has been a game-changer for my studies. The tutors are excellent and the booking system is so easy to use! I've improved my grades significantly and gained confidence in subjects I used to struggle with. Highly recommended!",
};

const testimonials = [
  {
    name: "Kebede T.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    title: "High School Student",
    content:
      "I love that I can learn in Amharic. It makes complex subjects so much easier to understand. My math grades have improved from C to A!",
  },
  {
    name: "Fatuma A.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c6b0b8c3?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    title: "Parent",
    content:
      "Finding a reliable tutor for my child was difficult until I found this platform. The quality of teaching is top-notch and my daughter loves her sessions.",
  },
  {
    name: "Mulugeta S.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    title: "Professional Tutor",
    content:
      "TutorMatch makes it easy to connect with motivated students and manage my schedule efficiently. The platform's tools are excellent!",
  },
];

export default function TestimonialPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-20 px-4 relative overflow-hidden">
      {/* Ultra Advanced Background Elements */}
      <div className="absolute inset-0">
        {/* Large animated blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-purple-200/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-pink-200/15 to-cyan-200/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-200/10 to-purple-200/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
        
        {/* Additional decorative elements */}
        <div className="absolute top-32 right-32 w-64 h-64 bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}} />
        <div className="absolute bottom-32 left-32 w-56 h-56 bg-gradient-to-tr from-orange-200/10 to-yellow-200/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}} />
        
        {/* Floating particles with more variety */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-300/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-300/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-pink-300/30 rounded-full animate-bounce" style={{animationDelay: '2.5s'}} />
        <div className="absolute top-1/6 right-1/6 w-2.5 h-2.5 bg-emerald-300/30 rounded-full animate-bounce" style={{animationDelay: '3.5s'}} />
        <div className="absolute bottom-1/6 left-1/6 w-2 h-2 bg-orange-300/30 rounded-full animate-bounce" style={{animationDelay: '4.5s'}} />
        <div className="absolute top-2/3 left-1/5 w-1 h-1 bg-cyan-300/30 rounded-full animate-bounce" style={{animationDelay: '5.5s'}} />
        
        {/* Geometric shapes */}
        <div className="absolute top-16 left-1/3 w-4 h-4 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rotate-45 animate-spin" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-16 right-1/3 w-3 h-3 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rotate-45 animate-spin" style={{animationDuration: '6s', animationDelay: '2s'}} />
      </div>

      {/* Enhanced Hero Section */}
      <section className="flex flex-col items-center text-center mb-16 relative z-10">
        <motion.div 
          className="inline-block bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-purple-800 rounded-full px-8 py-3 text-lg font-bold mb-8 shadow-xl border border-purple-200/50 backdrop-blur-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="animate-spin-slow">⭐</span> 
            Testimonials
            <span className="animate-pulse">✨</span>
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-500 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block hover:animate-pulse cursor-default">
            What Our Users Say
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-medium leading-relaxed mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Real stories from students, parents, and tutors who trust TutorMatch for their learning journey.
        </motion.p>
        
        <motion.div 
          className="flex justify-center items-center gap-6 mb-12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div 
            className="w-20 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div 
            className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      </section>
      {/* Enhanced Featured Testimonial */}
      <motion.section 
        className="flex justify-center mb-16 relative z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.div
          className="relative max-w-4xl w-full"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="p-12 flex flex-col items-center text-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-2 border-purple-200/50 shadow-2xl rounded-3xl backdrop-blur-sm relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-xl translate-y-16 -translate-x-16" />
            
            {/* Quote Icon */}
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8 shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Quote className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-sm" />
              <Avatar className="relative mx-auto w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={featured.avatar} alt={featured.name} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {featured.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              {featured.name}
            </CardTitle>
            <div className="text-purple-600 font-semibold mb-6 px-4 py-1 bg-purple-100/50 rounded-full">
              {featured.title}
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </div>
            
            <CardContent className="text-xl font-medium text-gray-700 leading-relaxed italic relative z-10">
              "{featured.content}"
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
      {/* Enhanced Testimonial Grid */}
      <motion.section 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        {testimonials.map((t, index) => {
          const cardColors = [
            { bg: "from-rose-50/60 to-pink-50/40", border: "border-rose-200/50", accent: "from-rose-500 to-pink-500" },
            { bg: "from-blue-50/60 to-cyan-50/40", border: "border-blue-200/50", accent: "from-blue-500 to-cyan-500" },
            { bg: "from-emerald-50/60 to-green-50/40", border: "border-emerald-200/50", accent: "from-emerald-500 to-green-500" }
          ];
          const colors = cardColors[index % 3];
          
          return (
            <motion.div
              key={t.name}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className={`p-8 flex flex-col items-center text-center bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl backdrop-blur-sm relative overflow-hidden h-full`}>
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/15 to-transparent rounded-full blur-lg translate-y-10 -translate-x-10 group-hover:scale-125 transition-transform duration-700" />
                
                <CardHeader className="relative z-10">
                  <motion.div
                    className="relative mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300`} />
                    <Avatar className="relative mx-auto w-16 h-16 border-3 border-white shadow-lg">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback className={`text-lg font-bold bg-gradient-to-br ${colors.accent} text-white`}>
                        {t.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-purple-700 transition-colors duration-300">
                    {t.name}
                  </CardTitle>
                  <div className={`text-sm font-semibold px-3 py-1 bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`}>
                    {t.title}
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 flex-1 flex items-center">
                  <p className="text-gray-700 leading-relaxed italic group-hover:text-gray-800 transition-colors duration-300">
                    "{t.content}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.section>
    </main>
  );
}
