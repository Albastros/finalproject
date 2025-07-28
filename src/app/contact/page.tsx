"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showNameTooltip, setShowNameTooltip] = useState(false);

  const showInvalidCharacterTooltip = () => {
    setShowNameTooltip(true);
    // Auto-hide tooltip after 2.5 seconds
    setTimeout(() => {
      setShowNameTooltip(false);
    }, 2500);
  };

  const validateName = (name: string) => {
    if (!name || name.trim() === "") {
      return "Name is required";
    }
    // Only allow letters (a-z, A-Z) and spaces
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Name can only contain letters and spaces";
    }
    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "Name cannot contain multiple consecutive spaces";
    }
    // Check if name starts or ends with space
    if (name.startsWith(' ') || name.endsWith(' ')) {
      return "Name cannot start or end with spaces";
    }
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }

    // Check for leading or trailing whitespace
    if (email !== email.trim()) {
      return "Email cannot have leading or trailing spaces";
    }

    // Check if email has exactly one @ symbol
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      return "Email must contain exactly one @ symbol";
    }

    const [localPart, domain] = email.split('@');

    // Validate local part
    if (!localPart || localPart.length === 0) {
      return "Email must have content before @ symbol";
    }

    if (localPart.length > 64) {
      return "Email local part must not exceed 64 characters";
    }

    // Local part allowed characters: letters, digits, and . _ % + -
    if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
      return "Email local part contains invalid characters";
    }

    // Local part cannot start or end with dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return "Email cannot start or end with a dot";
    }

    // No consecutive dots in local part
    if (localPart.includes('..')) {
      return "Email cannot contain consecutive dots";
    }

    // Validate domain
    if (!domain || domain.length === 0) {
      return "Email must have content after @ symbol";
    }

    if (domain.length > 255) {
      return "Email domain must not exceed 255 characters";
    }

    // Domain must contain at least one dot
    if (!domain.includes('.')) {
      return "Email domain must contain at least one dot";
    }

    // Domain allowed characters: letters, digits, hyphens, dots
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return "Email domain contains invalid characters";
    }

    // Domain cannot start or end with dot or hyphen
    if (domain.startsWith('.') || domain.endsWith('.') ||
        domain.startsWith('-') || domain.endsWith('-')) {
      return "Email domain cannot start or end with dot or hyphen";
    }

    // No consecutive dots in domain
    if (domain.includes('..')) {
      return "Email domain cannot contain consecutive dots";
    }

    // Validate domain parts (split by dots)
    const domainParts = domain.split('.');
    for (const part of domainParts) {
      if (part.length === 0) {
        return "Email domain parts cannot be empty";
      }
      if (part.startsWith('-') || part.endsWith('-')) {
        return "Email domain parts cannot start or end with hyphen";
      }
    }

    // Validate TLD (last part)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Email top-level domain must be at least 2 characters";
    }

    // TLD can only contain letters
    if (!/^[a-zA-Z]+$/.test(tld)) {
      return "Email top-level domain can only contain letters";
    }

    return null;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess("");
    setError("");
    setNameError("");
    setEmailError("");

    // Validate name
    const nameValidationError = validateName(name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      setIsLoading(false);
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Thank you for your feedback!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to send feedback.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-10">
        <span className="inline-block bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full px-8 py-3 text-lg font-bold mb-4 shadow-lg border border-blue-200">
          📞 Contact Us
        </span>
      </section>
      
      {/* Contact Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Have questions or feedback? Fill out the form below or reach out to us directly.
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left Side - Map and Contact Info */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Interactive Map */}
              <Card className="overflow-hidden shadow-xl border-0 bg-white">
                <div className="relative h-80">
                  {/* Embedded Google Maps */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6176939417!2d38.7577605!3d9.0054496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2s4%20Kilo%2C%20Addis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1642000000000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-t-lg"
                  />
                  
                  {/* Location Overlay */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>4 Kilo, Addis Ababa</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Contact Information Cards */}
              <div className="grid gap-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 mb-3">Send us an email anytime!</p>
                        <a 
                          href="mailto:support@tutormatch.com" 
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          support@tutormatch.com
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-gray-600 mb-3">Mon-Fri from 8am to 5pm</p>
                        <a 
                          href="tel:+251911123456" 
                          className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                        >
                          +251 911 123 456
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                

              </div>
            </motion.div>
            
            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-500">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
                  <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only letters and spaces
                        if (/^[a-zA-Z\s]*$/.test(value)) {
                          setName(value);
                          setNameError(""); // Clear error when user types valid characters
                          // Hide tooltip when valid character is typed
                          if (showNameTooltip) {
                            setShowNameTooltip(false);
                          }
                        }
                      }}
                      onKeyPress={(e) => {
                        // Check if the key is invalid (numbers or symbols)
                        if (!/[a-zA-Z\s]/.test(e.key)) {
                          e.preventDefault();
                          // Show tooltip for invalid character attempt
                          showInvalidCharacterTooltip();
                        }
                      }}
                      className={`h-12 bg-white/80 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300 ${nameError ? "border-red-500" : ""}`}
                    />
                    {/* Tooltip for invalid character feedback */}
                    {showNameTooltip && (
                      <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                        Numbers and symbols are not allowed in the name field
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </div>
                  {nameError && (
                    <p className="text-sm text-red-600 mt-1">{nameError}</p>
                  )}
                  
                  <Input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(""); // Clear error when user types
                    }}
                    className={`h-12 bg-white/80 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300 ${emailError ? "border-red-500" : ""}`}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 mt-1">{emailError}</p>
                  )}
                  
                  <textarea
                    className="w-full h-32 rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-3 text-base focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 resize-none"
                    placeholder="Your Message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </motion.div>
                  
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 text-center font-medium bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      {success}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-center font-medium bg-red-50 p-3 rounded-lg border border-red-200"
                    >
                      {error}
                    </motion.div>
                  )}
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
