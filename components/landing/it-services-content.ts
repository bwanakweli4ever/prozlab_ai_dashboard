import type { LucideIcon } from "lucide-react"
import { Bot, CloudUpload, Code, Globe, Headset, Network, Printer, Server, ShieldCheck } from "lucide-react"

export type ServiceItem = { icon: LucideIcon; title: string; note: string }

export const SERVICES: ServiceItem[] = [
  { icon: Headset, title: "Help desk", note: "Fast remote fixes" },
  { icon: Server, title: "System admin", note: "Microsoft 365 & Google" },
  { icon: Network, title: "Networks & Wi-Fi", note: "Firewalls, VPN, coverage" },
  { icon: ShieldCheck, title: "Security & backup", note: "MFA, protection, restores" },
  { icon: Printer, title: "Hardware & installs", note: "Set up on site" },
  { icon: CloudUpload, title: "Cloud & migrations", note: "Move without downtime" },
  { icon: Globe, title: "Websites & web apps", note: "Fast and mobile-ready" },
  { icon: Code, title: "Custom software", note: "Platforms, APIs and mobile apps" },
  { icon: Bot, title: "AI agents", note: "Answer, sort and draft" },
]

export type CaseStudy = { client: string; url: string; domain: string; about: string; built: string[]; tags: string[] }

/** Client work shown on the homepage. Facts only: add a client quote here once the client provides one. */
export const CASE_STUDIES: CaseStudy[] = [
  {
    client: "Fidloy",
    url: "https://fidloy.com",
    domain: "fidloy.com",
    about: "An AI customer-success agent that helps SaaS companies win back inactive users and failed payments by email, SMS or WhatsApp.",
    built: [
      "Product website, SEO and launch videos",
      "Point-of-sale app for Windows",
      "Waiter mobile app",
      "Merchant accounts and sign-in",
    ],
    tags: ["Website", "Software", "Mobile app"],
  },
  {
    client: "Mista",
    url: "https://mista.io",
    domain: "mista.io",
    about: "Messaging, verification and voice APIs that businesses use to reach their customers.",
    built: [
      "Official SDKs for Go, Python and Node.js",
      "API documentation site",
      "Mista Call Assist, a mobile softphone app",
      "Developer examples for phone verification",
    ],
    tags: ["Software", "APIs", "Mobile app"],
  },
]

export const PROCESS_STEPS = [
  { title: "Book a 30-minute call", desc: "Tell us how your office works and what's slowing you down." },
  { title: "Get a fixed proposal", desc: "We review your setup and put the scope and price in writing." },
  { title: "We take it from there", desc: "Your named engineer handles requests. Experts go on site when needed." },
]
