"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const categories = [
  {
    name: "Mathematics",
    courses: 85,
    students: "2.5K+",
    icon: "📊",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    description: "Master algebra, calculus, geometry and more with expert guidance"
  },
  {
    name: "Science",
    courses: 72,
    students: "3.2K+",
    icon: "🔬",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    description: "Explore physics, chemistry, biology with hands-on experiments"
  },
  {
    name: "Languages",
    courses: 64,
    students: "1.8K+",
    icon: "🌍",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    description: "Learn English, French, Spanish and other world languages"
  },
  {
    name: "Computer Science",
    courses: 91,
    students: "4.1K+",
    icon: "💻",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80",
    description: "Programming, algorithms, web development and software engineering"
  },
  {
    name: "Business Studies",
    courses: 58,
    students: "2.1K+",
    icon: "📈",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    description: "Economics, finance, marketing and entrepreneurship fundamentals"
  },
  {
    name: "Arts & Literature",
    courses: 43,
    students: "1.5K+",
    icon: "🎨",
    color: "from-slate-600 to-slate-700",
    bgColor: "from-slate-50 to-slate-100",
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
    description: "Creative writing, art history, literature analysis and more"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
};

export default function CourseCategoriesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="absolute inset-0">
          {/* Floating Geometric Shapes */}
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, 80, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, -60, 0],
              y: [0, 50, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      <div className="relative container mx-auto px-6">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-6 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-2xl">📚</span>
            Course Categories
            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore Our
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Learning Subjects
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover comprehensive courses across various subjects taught by expert tutors
          </motion.p>
        </motion.div>

        {/* Enhanced Categories Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              className="group relative"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href={`/courses?category=${category.name.toLowerCase()}`}>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 cursor-pointer">
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={category.img} 
                      alt={category.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                    
                    {/* Floating Icon */}
                    <motion.div 
                      className={`absolute top-4 right-4 w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -10, 10, 0],
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {category.icon}
                    </motion.div>
                    
                    {/* Course Count Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-sm font-semibold text-gray-800">{category.courses} Courses</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="relative p-6">
                    <motion.h3 
                      className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {category.name}
                    </motion.h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      {category.description}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-semibold shadow-md`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {category.students} Students
                      </motion.div>
                      
                      <motion.div
                        className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300"
                        animate={hoveredIndex === index ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                    initial={false}
                    animate={hoveredIndex === index ? { opacity: 1 } : { opacity: 0 }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link 
              href="/tutors" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Courses
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
