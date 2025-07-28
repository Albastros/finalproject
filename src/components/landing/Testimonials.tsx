"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";

const testimonials = [
  {
    name: "Abebe K.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=150&q=80",
    title: "Mathematics Student",
    subject: "Calculus & Algebra",
    rating: 5,
    duration: "6 months",
    description:
      "This platform has been a game-changer for my studies. The tutors are excellent and the booking system is so easy to use! My grades improved significantly.",
  },
  {
    name: "Kebede T.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=150&q=80",
    title: "Computer Science Student",
    subject: "Programming",
    rating: 5,
    duration: "1 year",
    description:
      "I love that I can learn in Amharic. It makes complex subjects so much easier to understand. The coding sessions are incredibly helpful!",
  },
  {
    name: "Fatuma A.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c9c8e8c2?auto=format&fit=facearea&w=150&q=80",
    title: "Parent",
    subject: "Child's Education",
    rating: 5,
    duration: "8 months",
    description:
      "Finding a reliable tutor for my child was difficult until I found this platform. The quality of teaching is top-notch and my daughter loves her sessions.",
  },
  {
    name: "Daniel M.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=150&q=80",
    title: "Science Student",
    subject: "Physics & Chemistry",
    rating: 5,
    duration: "4 months",
    description:
      "The interactive science lessons helped me understand complex concepts easily. My tutor uses real-world examples that make learning enjoyable.",
  },
  {
    name: "Sara H.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=150&q=80",
    title: "Language Student",
    subject: "English Literature",
    rating: 5,
    duration: "10 months",
    description:
      "The personalized approach to learning literature has been amazing. My writing skills have improved tremendously thanks to my dedicated tutor.",
  },
  {
    name: "Ahmed S.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&w=150&q=80",
    title: "Business Student",
    subject: "Economics",
    rating: 4,
    duration: "7 months",
    description:
      "Excellent platform for learning business concepts. The tutors are knowledgeable and the flexible scheduling fits perfectly with my work schedule.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  }
};

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-5 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-5 w-80 h-80 bg-gradient-to-tl from-pink-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/10 to-purple-200/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300/40 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-bounce" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-300/40 rounded-full animate-bounce" style={{animationDelay: '2.5s'}} />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-6 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-2xl">💬</span>
            Testimonials
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            What Our
            <br />
            <motion.div 
              className="inline-block bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-purple-800 rounded-full px-8 py-3 text-base font-bold mb-8 shadow-xl border border-purple-200/50 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin-slow">⭐</span> 
                Student Success Stories
                <span className="animate-pulse">✨</span>
              </span>
            </motion.div>
            <span>
              Students Say
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Real stories from satisfied learners and parents who transformed their education with us
          </motion.p>
        </motion.div>

        {/* Enhanced Testimonials Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -8 }}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-100"
            >
              {/* Minimized Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-xl -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full blur-lg translate-y-6 -translate-x-6 group-hover:scale-110 transition-transform duration-500"></div>
              
              {/* Smaller Quote Icon */}
              <div className="relative mb-3">
                <div className="text-3xl text-gray-200 leading-none">"</div>
              </div>
              
              {/* Compact Testimonial Content */}
              <div className="relative mb-3">
                <p className="text-gray-700 leading-relaxed text-sm group-hover:text-gray-800 transition-colors duration-300 line-clamp-3">
                  {testimonial.description}
                </p>
              </div>
              
              {/* Smaller Rating Stars */}
              <div className="relative flex items-center gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.span 
                    key={i}
                    className="text-yellow-400 text-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 400, damping: 10 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              
              {/* Compact User Info */}
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold text-xs">
                      {testimonial.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <motion.h4 
                    className="font-bold text-gray-900 text-sm group-hover:text-gray-800 transition-colors duration-300"
                    whileHover={{ x: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {testimonial.name}
                  </motion.h4>
                  <p className="text-gray-600 font-medium text-xs">{testimonial.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">{testimonial.subject}</span>
                    <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                    <span className="text-xs text-gray-500">{testimonial.duration}</span>
                  </div>
                </div>
              </div>
              
              {/* Subtle Hover Effect Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                initial={false}
                animate={hoveredIndex === index ? { opacity: 1 } : { opacity: 0 }}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom Stats */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
