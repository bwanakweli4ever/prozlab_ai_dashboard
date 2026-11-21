import type { LucideIcon } from "lucide-react"
import { Bot, CloudUpload, Globe, Headset, Network, Printer, Server, ShieldCheck } from "lucide-react"

export type ServiceItem = { icon: LucideIcon; title: string; note: string }

export const SERVICES: ServiceItem[] = [
  { icon: Headset, title: "Help desk", note: "Fast remote fixes" },
  { icon: Server, title: "System admin", note: "Microsoft 365 & Google" },
  { icon: Network, title: "Networks & Wi-Fi", note: "Firewalls, VPN, coverage" },
  { icon: ShieldCheck, title: "Security & backup", note: "MFA, protection, restores" },
  { icon: Printer, title: "Hardware & installs", note: "Set up on site" },
  { icon: CloudUpload, title: "Cloud & migrations", note: "Move without downtime" },
  { icon: Globe, title: "Websites", note: "Fast and mobile-ready" },
  { icon: Bot, title: "AI agents", note: "Answer, sort and draft" },
]

export const PROCESS_STEPS = [
  { title: "Book a 30-minute call", desc: "Tell us how your office works and what's slowing you down." },
  { title: "Get a fixed proposal", desc: "We review your setup and put the scope and price in writing." },
  { title: "We take it from there", desc: "Your named engineer handles requests. Experts go on site when needed." },
]
