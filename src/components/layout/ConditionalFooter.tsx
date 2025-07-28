"use client";

import { usePathname } from "next/navigation";
import Footer from "../landing/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Define routes where footer should be hidden
  const hideFooterRoutes = [
    '/login',
    '/signup',
    '/admin',
    '/etn',
    '/student',
    '/student/past',
    '/student/all',
    '/student/attendance',
    '/student/materials',
    '/student/quizzes'
  ];
  
  // Hide footer on specified routes
  const shouldHideFooter = hideFooterRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
}






