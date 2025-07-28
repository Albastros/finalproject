"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const features = [
  {
    title: "Expert Tutors",
    description: "Connect with certified tutors who are passionate about teaching and helping you succeed in your academic journey.",
    icon: "👨‍🏫",
    stats: "500+ Tutors",
    color: "from-blue-400 to-slate-600",
    bgColor: "from-blue-50 to-slate-50",
    delay: 0.1
  },
  {
    title: "Rich Content",
    description: "Access thousands of learning materials, interactive exercises, and comprehensive study resources.",
    icon: "📚",
    stats: "10K+ Resources",
    color: "from-emerald-400 to-slate-600",
    bgColor: "from-emerald-50 to-slate-50",
    delay: 0.2
  },
  {
    title: "Proven Results",
    description: "Join thousands of successful students who have achieved their academic goals with our proven methodology.",
    icon: "🏆",
    stats: "98% Success Rate",
    color: "from-amber-400 to-slate-600",
    bgColor: "from-amber-50 to-slate-50",
    delay: 0.3
  },
  {
    title: "Flexible Schedule",
    description: "Book sessions that fit your schedule with our flexible timing options and instant booking system.",
    icon: "⏰",
    stats: "24/7 Available",
    color: "from-violet-400 to-slate-600",
    bgColor: "from-violet-50 to-slate-50",
    delay: 0.4
  },
  {
    title: "Safe Learning",
    description: "Learn in a secure, monitored environment with verified tutors and comprehensive safety measures.",
    icon: "🛡️",
    stats: "Secure",
    color: "from-cyan-400 to-slate-600",
    bgColor: "from-cyan-50 to-slate-50",
    delay: 0.5
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function FeatureGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50">
        <div className="absolute inset-0">
          {/* Floating Shapes */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-200/30 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-6 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></span>
            Why Choose Us
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Exceptional Learning
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
              Experience
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover what makes our tutoring platform the preferred choice for students worldwide
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Card Background with Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              <div className={`relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden`}>
                {/* Animated Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                
                {/* Optimized Icon Container */}
                <motion.div 
                  className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg`}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Content */}
                <div className="relative z-10">
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  {/* Enhanced Stats Badge */}
                  <motion.div 
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${feature.color} text-white rounded-full text-sm font-semibold mb-6 shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    {feature.stats}
                  </motion.div>
                  
                  <motion.p 
                    className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  initial={false}
                  animate={hoveredIndex === index ? { opacity: 1 } : { opacity: 0 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  );
}
