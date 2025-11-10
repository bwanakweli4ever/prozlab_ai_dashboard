// Shared constants across the application

import { 
  Laptop, 
  Wifi, 
  HardDrive, 
  Smartphone, 
  Wrench, 
  Zap, 
  Globe, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Target 
} from "lucide-react"

// Professional Specialties/Skills
export const TECH_SKILLS = [
  { name: "Computer Repair", icon: Laptop, color: "bg-blue-500", category: "Hardware" },
  { name: "Network Setup", icon: Wifi, color: "bg-green-500", category: "Networking" },
  { name: "Data Recovery", icon: HardDrive, color: "bg-purple-500", category: "Data" },
  { name: "Mobile Repair", icon: Smartphone, color: "bg-orange-500", category: "Mobile" },
  { name: "Hardware Install", icon: Wrench, color: "bg-red-500", category: "Hardware" },
  { name: "Software Support", icon: Zap, color: "bg-indigo-500", category: "Software" },
  { name: "Web Development", icon: Globe, color: "bg-cyan-500", category: "Development" },
  { name: "Digital Marketing", icon: TrendingUp, color: "bg-pink-500", category: "Marketing" },
  { name: "Graphic Design", icon: FileText, color: "bg-yellow-500", category: "Design" },
  { name: "Business Consulting", icon: Briefcase, color: "bg-teal-500", category: "Consulting" },
  { name: "Content Writing", icon: FileText, color: "bg-emerald-500", category: "Writing" },
  { name: "Data Analysis", icon: Target, color: "bg-violet-500", category: "Analytics" },
] as const

// Specialties as simple array (for filtering, API calls, etc.)
export const SPECIALTIES = TECH_SKILLS.map(skill => skill.name)

// Availability options
export const AVAILABILITY_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Not available"
] as const

// Experience levels
export const EXPERIENCE_LEVELS = [
  {
    level: "0-1 years",
    icon: "👨‍💻",
    title: "Getting Started",
    description: "New to tech support",
  },
  {
    level: "1-3 years",
    icon: "👔",
    title: "Building Skills",
    description: "Some experience under your belt",
  },
  {
    level: "3-5 years",
    icon: "💼",
    title: "Experienced Pro",
    description: "Solid track record",
  },
  {
    level: "5+ years",
    icon: "👑",
    title: "Expert Level",
    description: "Seasoned professional",
  },
] as const

// Specialty synonyms for better matching
export const SPECIALTY_SYNONYMS: Record<string, string[]> = {
  "computer repair": ["pc repair", "laptop repair", "desktop repair"],
  "network setup": ["network installation", "networking", "wifi setup", "router setup"],
  "data recovery": ["data restore", "restore data", "disk recovery"],
  "mobile repair": ["phone repair", "smartphone repair", "mobile"],
  "hardware install": ["hardware installation", "hardware"],
  "software support": ["software", "application support", "app support"],
  "web development": ["development", "website", "frontend", "backend", "full stack"],
  "digital marketing": ["marketing", "seo", "social media", "ads"],
  "graphic design": ["design", "branding", "ui", "visual design"],
  "business consulting": ["consulting", "strategy", "management consulting"],
  "content writing": ["writing", "copywriting", "blog", "content"],
  "data analysis": ["analytics", "data analytics", "data analyst"],
}

// Categories for grouping specialties
export const SPECIALTY_CATEGORIES = [
  "Hardware",
  "Networking",
  "Data",
  "Mobile",
  "Software",
  "Development",
  "Marketing",
  "Design",
  "Consulting",
  "Writing",
  "Analytics"
] as const

