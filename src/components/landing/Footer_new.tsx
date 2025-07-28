"use client";
import { School, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white border-t border-slate-800 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-slate-600/20 to-blue-500/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-slate-600/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative container mx-auto px-6 py-16">
        <motion.div 
          className="grid gap-12 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Enhanced Brand Section */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <Link href="/" className="group flex items-center space-x-3">
              <motion.div
                className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                transition={{ duration: 0.2 }}
              >
                <School className="h-8 w-8 text-blue-500" />
              </motion.div>
              <span className="font-bold text-2xl group-hover:text-blue-400 transition-colors duration-300">
                Tutoring Platform
              </span>
            </Link>
            <p className="text-slate-400 text-3xl leading-relaxed">
              Connecting students with the best tutors in Ethiopia. Quality education made accessible for everyone.
            </p>
            <div className="flex space-x-4">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" }
              ].map(({ Icon, href }, index) => (
                <motion.div key={index}>
                  <Link 
                    href={href} 
                    className="group flex items-center justify-center w-10 h-10 bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Quick Links */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <h3 className="font-bold text-3xl text-white relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500/60 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/tutors", label: "Find Tutors" },
                { href: "/start-tutoring", label: "Become a Tutor" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" }
              ].map((link, index) => (
                <motion.li key={index}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center space-x-2 text-slate-400 hover:text-white transition-all duration-300 text-xl"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-blue-500 transition-colors duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Contact Info */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <h3 className="font-bold text-3xl text-white relative">
              Contact Info
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500/60 rounded-full"></div>
            </h3>
            <div className="space-y-4">
              {[
                { Icon: Mail, text: "support@tutoringplatform.com", href: "mailto:support@tutoringplatform.com" },
                { Icon: Phone, text: "+251 911 123 456", href: "tel:+251911123456" },
                { Icon: MapPin, text: "Addis Ababa, Ethiopia", href: "#" }
              ].map(({ Icon, text, href }, index) => (
                <motion.div key={index}>
                  <Link 
                    href={href} 
                    className="group flex items-center space-x-4 text-slate-400 hover:text-white transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                      <Icon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <span className="text-3xl group-hover:translate-x-1 transition-transform duration-300">
                      {text}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Bottom Section */}
        <motion.div 
          className="mt-16 pt-8 border-t border-slate-800/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <motion.p 
              className="text-slate-400 text-2xl flex items-center space-x-2"
              whileHover={{ color: "rgb(226 232 240)" }}
              transition={{ duration: 0.2 }}
            >
              <span>&copy; {new Date().getFullYear()} Tutoring Platform.</span>
              <span className="hidden sm:inline">All rights reserved.</span>
            </motion.p>
            
            <div className="flex items-center space-x-8">
              {[
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/cookies", label: "Cookies" }
              ].map((link, index) => (
                <motion.div key={index}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-all duration-300 text-2xl relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Subtle Bottom Border */}
          <div className="mt-8 w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
        </motion.div>
      </div>
    </footer>
  );
}
