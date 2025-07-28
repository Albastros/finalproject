"use client";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, ShieldCheck, Globe2, Search, UserCheck, BookOpen, Video, Star, ArrowRight, CheckCircle, Clock, Award, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const features = [
  {
    icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
    title: "Expert Tutors",
    desc: "Learn from experienced, vetted professionals across a wide range of subjects.",
    color: "from-blue-500/10 to-blue-600/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Personalized Learning",
    desc: "Tailored sessions and resources to fit every student's unique needs.",
    color: "from-purple-500/10 to-purple-600/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    title: "Secure & Trusted",
    desc: "Your data and payments are protected with industry-leading security.",
    color: "from-green-500/10 to-green-600/10",
    borderColor: "border-green-500/20"
  },
  {
    icon: <Clock className="w-8 h-8 text-orange-500" />,
    title: "Flexible Scheduling",
    desc: "Book sessions at your convenience with 24/7 availability and easy rescheduling options.",
    color: "from-orange-500/10 to-orange-600/10",
    borderColor: "border-orange-500/20"
  },
];

const howItWorksSteps = [
  {
    step: "01",
    icon: <Search className="w-8 h-8 text-white" />,
    title: "Find Your Tutor",
    description: "Browse through our extensive database of qualified tutors and filter by subject, experience, and availability.",
    color: "from-blue-500 to-blue-600",
    bgPattern: "bg-gradient-to-br from-blue-50 to-blue-100"
  },
  {
    step: "02",
    icon: <UserCheck className="w-8 h-8 text-white" />,
    title: "Book a Session",
    description: "Schedule your preferred time slot and choose between one-on-one or group sessions based on your learning style.",
    color: "from-purple-500 to-purple-600",
    bgPattern: "bg-gradient-to-br from-purple-50 to-purple-100"
  },
  {
    step: "03",
    icon: <Video className="w-8 h-8 text-white" />,
    title: "Start Learning",
    description: "Join your virtual classroom with integrated video chat and resource sharing capabilities.",
    color: "from-green-500 to-green-600",
    bgPattern: "bg-gradient-to-br from-green-50 to-green-100"
  },
  {
    step: "04",
    icon: <Star className="w-8 h-8 text-white" />,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed progress reports, assignments, and personalized feedback.",
    color: "from-orange-500 to-orange-600",
    bgPattern: "bg-gradient-to-br from-orange-50 to-orange-100"
  }
];

const stats = [
  { number: "10,000+", label: "Students Taught", icon: <Users className="w-6 h-6" /> },
  { number: "500+", label: "Expert Tutors", icon: <GraduationCap className="w-6 h-6" /> },
  { number: "50+", label: "Subjects Covered", icon: <BookOpen className="w-6 h-6" /> },
  { number: "98%", label: "Success Rate", icon: <Award className="w-6 h-6" /> }
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

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function AboutPage() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <motion.div 
            className="max-w-6xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-3 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-2xl">🎓</span>
              <span className="text-blue-700 font-semibold">About Our Platform</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Empowering Learning,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connecting Futures
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              TutorMatch is Ethiopia's premier both in-person and online tutoring platform, connecting students with top-tier educators 
              for personalized, flexible, and effective learning experiences. Our mission is to make quality education 
              accessible to everyone, everywhere in Ethiopia and beyond.
            </motion.p>

            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-6 py-3 mb-6">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-semibold">How It Works</span>
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
                Your Learning Journey
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with our platform in just four easy steps and begin your personalized learning experience today.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onHoverStart={() => setHoveredStep(index)}
                  onHoverEnd={() => setHoveredStep(null)}
                >
                  {/* Connection Line */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
                  )}
                  
                  <motion.div
                    className={`relative ${step.bgPattern} rounded-3xl p-8 border border-white/50 shadow-xl backdrop-blur-sm group-hover:shadow-2xl transition-all duration-500`}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-100">
                      <span className="text-lg font-bold text-gray-700">{step.step}</span>
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mb-6 shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {step.icon}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Hover Effect */}
                    <motion.div
                      className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300"
                      animate={hoveredStep === index ? { x: 5 } : { x: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="mr-2">Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                Excellence in Every
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Learning Experience
                </span>
              </h2>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className={`relative overflow-hidden bg-gradient-to-br ${feature.color} backdrop-blur-sm border ${feature.borderColor} p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 group`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <motion.div
                      className="relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.desc}
                      </p>
                    </motion.div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24 px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Ready to Start?</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Begin Your Learning
                  <br />
                  Journey Today
                </h2>
                
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have transformed their academic journey with our expert tutors and personalized learning approach.
                </p>
                
                <motion.a
                  href="/signup"
                  className="inline-flex items-center gap-3 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
