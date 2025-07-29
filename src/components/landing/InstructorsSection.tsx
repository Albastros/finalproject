"use client";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter } from "@tabler/icons-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const instructors = [
  {
    name: "Dr. Mesfin",
    designation: "Mathematics Professor",
    specialization: "Calculus & Algebra",
    experience: "8+ Years",
    rating: "4.9",
    students: "2.3K+",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Ms. Lily",
    designation: "Computer Science Expert",
    specialization: "Programming & AI",
    experience: "12+ Years",
    // rating: "4.8",
    students: "3.1K+",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Ms. Hana",
    designation: "Science Specialist",
    specialization: "Physics & Chemistry",
    experience: "10+ Years",
    rating: "4.9",
    students: "1.8K+",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Dr. Zeleke",
    designation: "Language Arts Teacher",
    specialization: "English & Literature",
    experience: "15+ Years",
    rating: "4.7",
    students: "2.7K+",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
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
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
};

export default function InstructorsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl"></div>
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
            <span className="text-2xl">👨‍🏫</span>
            Expert Instructors
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Meet Our
            <br />
            <span className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Distinguished Faculty
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Learn from experienced educators who are passionate about helping you succeed
          </motion.p>
        </motion.div>

        {/* Enhanced Instructors Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {instructors.map((instructor, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-visible shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50">
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden">
                  <Image 
                    src={instructor.img} 
                    alt={instructor.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-semibold text-gray-800">{instructor.rating}</span>
                    </div>
                  </div>
                  
                  {/* Social Media Links - Floating */}
                  <motion.div 
                    className="absolute left-1/2 -bottom-4 -translate-x-1/2 z-20"
                    initial={{ y: 10, opacity: 0 }}
                    animate={hoveredIndex === index ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 gap-3 shadow-xl border border-white/50">
                      <motion.a 
                        href="#" 
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconBrandFacebook size={18} />
                      </motion.a>
                      <motion.a 
                        href="#" 
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconBrandTwitter size={18} />
                      </motion.a>
                      <motion.a 
                        href="#" 
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconBrandInstagram size={18} />
                      </motion.a>
                    </div>
                  </motion.div>
                </div>
                
                {/* Content Section */}
                <div className="relative p-6 pt-10">
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {instructor.name}
                  </motion.h3>
                  
                  <p className="text-gray-600 font-medium mb-2 group-hover:text-gray-700 transition-colors duration-300">
                    {instructor.designation}
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {instructor.specialization}
                  </p>
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="text-gray-600 font-medium">{instructor.experience}</span>
                    </div>
                    <div className="text-gray-500">
                      {instructor.students} students
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  initial={false}
                  animate={hoveredIndex === index ? { opacity: 1 } : { opacity: 0 }}
                />
              </div>
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
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-gray-600">Years Average Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Student Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
