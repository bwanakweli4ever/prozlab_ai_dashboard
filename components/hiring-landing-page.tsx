"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  MapPin,
  Star,
  Clock,
  FileText,
  Users,
  DollarSign,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Quote,
  Check,
  TrendingUp,
  Timer,
  Target,
  HeartHandshake,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Phone,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProzLabLogo } from "@/components/prozlab-logo"

const HERO_LEAD =
  "Hire proven professionals, not just qualified applicants. Prozlab uses verified work history, performance signals, and intelligent matching to predict who will succeed on the job—not just pass the interview."

const HERO_SUB =
  "Prozlab predicts hiring success using verified skills, real-world assessments, and performance data."

const navLinks = [
  { label: "For Employers", href: "#employers" },
  { label: "For Professionals", href: "#candidates" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Prozlab", href: "#why-prozlab" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
      <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  )
}

function SuccessGauge() {
  return (
    <div className="relative mx-auto flex h-[88px] w-[88px] items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#E0E7FF" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#6366F1"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="251"
          strokeDashoffset="10"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-brand">96%</div>
      </div>
    </div>
  )
}

export function HiringLandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <ProzLabLogo size="md" />
          </Link>

          <nav className="hidden items-center gap-6 xl:gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap text-[13px] font-medium text-slate-600 transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-[13px] font-medium text-slate-700 hover:text-brand md:inline-block"
            >
              Log in
            </Link>
            <Button
              className="h-9 rounded-lg bg-brand px-3 text-[12px] font-semibold text-white shadow-sm hover:bg-brand-dark sm:h-10 sm:px-5 sm:text-[13px]"
              asChild
            >
              <Link href="/register">Get Started</Link>
            </Button>
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="mt-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-brand md:hidden"
                  >
                    Log in
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
            {/* Left */}
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand sm:mb-5 sm:px-4 sm:text-[11px] sm:tracking-[0.12em]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Talent Intelligence Platform</span>
              </div>
              <h1 className="text-[1.875rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.5rem] lg:text-[3.25rem] lg:leading-[1.08]">
                Skills Proven by{" "}
                <span className="text-brand">Real Work,</span>{" "}
                Not Interviews.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:mt-5 sm:max-w-[480px] sm:text-[17px]">
                {HERO_LEAD}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500 sm:mt-3 sm:max-w-[480px]">
                {HERO_SUB}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                <Button className="h-11 w-full rounded-lg bg-brand px-6 text-[14px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]" asChild>
                  <Link href="/request-service">Hire Proven Professionals</Link>
                </Button>
                <Button variant="outline" className="h-11 w-full rounded-lg border-slate-300 bg-white px-6 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]" asChild>
                  <Link href="/register">I&apos;m a Professional</Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex -space-x-2.5">
                  {["#6366F1", "#818CF8", "#4F46E5", "#A5B4FC"].map((color, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white ring-1 ring-slate-100"
                      style={{ backgroundColor: color, zIndex: 4 - i }}
                    >
                      {["A", "B", "C", "D"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[13px] text-slate-600">
                    <span className="font-bold text-slate-900">4.9/5</span> from 1,200+ hiring teams
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Candidate card */}
            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-12px_rgba(99,102,241,0.18)]">
              <div className="flex flex-col lg:flex-row">
                {/* Main content */}
                <div className="flex-1 p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 ring-2 ring-indigo-100">
                      <span className="text-lg font-bold text-white">SM</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-200">
                        Top Match
                      </div>
                      <h3 className="text-[17px] font-bold text-slate-900">Sophia Martinez</h3>
                      <p className="text-[13px] text-slate-500">Senior Product Designer</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[12px] text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>San Francisco, CA · 8+ years</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Product Design", "UI/UX", "Figma", "Design Systems"].map((skill) => (
                      <span key={skill} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-brand">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Proven by Real Work
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {[
                      { title: "Redesign Dashboard", metric: "+22% user engagement", color: "from-indigo-400 to-violet-500" },
                      { title: "Mobile App Design", metric: "4.8★ app store rating", color: "from-violet-400 to-purple-500" },
                    ].map((p) => (
                      <div key={p.title} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        <div className={`h-[72px] bg-gradient-to-br ${p.color}`} />
                        <div className="p-2.5">
                          <p className="text-[11px] font-semibold text-slate-800">{p.title}</p>
                          <p className="text-[10px] font-medium text-brand">{p.metric}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4 sm:gap-3">
                    {[
                      { v: "24", l: "Projects Completed" },
                      { v: "18", l: "Clients/Teams Worked With" },
                      { v: "4.9/5", l: "Avg. Performance Rating" },
                      { v: "98%", l: "On-Time Delivery" },
                    ].map((s) => (
                      <div key={s.l} className="text-center">
                        <div className="text-[17px] font-bold text-slate-900">{s.v}</div>
                        <div className="mt-0.5 text-[9px] leading-tight text-slate-500">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted Success sidebar */}
                <div className="border-t border-slate-100 bg-indigo-50/60 p-5 lg:w-[200px] lg:border-l lg:border-t-0 lg:p-5">
                  <p className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Predicted Success
                  </p>
                  <div className="my-3">
                    <SuccessGauge />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Skills Match", value: 98 },
                      { label: "Experience Match", value: 93 },
                      { label: "Delivery Track Record", value: 97 },
                      { label: "Verified Work History", value: 95 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-bold text-brand">{item.value}%</span>
                        </div>
                        <ProgressBar value={item.value} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section id="why-prozlab" className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-[1.625rem] font-bold tracking-tight text-slate-900 sm:text-[2rem] lg:text-[2.25rem]">
              The problem with traditional hiring
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[16px] text-slate-600">
              Most platforms claim they vet talent. Employers still complain that candidates perform
              differently on the job. Resumes and interviews weren&apos;t built for how modern teams work.
            </p>
            <div className="relative mt-16">
              <div className="landing-dashed-line absolute left-[12%] right-[12%] top-8 hidden h-0.5 lg:block" />
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {[
                  { icon: Clock, title: "Long time to hire", desc: "Weeks of screening and interviews slow down your team." },
                  { icon: FileText, title: "Resumes don't tell the truth", desc: "Polished CVs hide gaps between claimed and actual skills." },
                  { icon: Users, title: "Interview performance isn't real performance", desc: "Great talkers aren't always great doers on the job." },
                  { icon: DollarSign, title: "Bad hires are expensive", desc: "A wrong hire costs time, morale, and real money." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-5 flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-brand bg-white shadow-sm">
                      <Icon className="h-6 w-6 text-brand" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-2 text-[15px] font-semibold text-slate-900">{title}</h3>
                    <p className="mx-auto max-w-[200px] text-[13px] leading-relaxed text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="bg-slate-50 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-[1.625rem] font-bold tracking-tight text-slate-900 sm:text-[2rem] lg:text-[2.25rem]">
              How Prozlab ensures better hiring outcomes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[16px] text-slate-600">
              A four-step process that replaces guesswork with evidence.
            </p>
            <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[
                { n: "01", icon: ClipboardList, title: "Work-Based Evaluation", desc: "Professionals are evaluated on real deliverables and project outcomes—not hypothetical scenarios." },
                { n: "02", icon: ShieldCheck, title: "Verified Skills & Experience", desc: "Every profile is backed by verified work history, client feedback, and performance data." },
                { n: "03", icon: BarChart3, title: "Talent Intelligence Matching", desc: "Our platform predicts hiring success by matching proven skills and track record to each role." },
                { n: "04", icon: Sparkles, title: "Ongoing Performance Signals", desc: "Continuous tracking of delivery metrics and client satisfaction." },
              ].map(({ n, icon: Icon, title, desc }) => (
                <div key={n} className="text-center">
                  <div className="relative mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand/10">
                    <Icon className="h-8 w-8 text-brand" strokeWidth={1.75} />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow">
                      {n}
                    </span>
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-slate-900">{title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Professionals ── */}
        <section id="candidates" className="border-y border-slate-100 bg-white py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">For Professionals</p>
              <h2 className="mt-3 text-[1.625rem] font-bold tracking-tight text-slate-900 sm:text-[2rem] lg:text-[2.25rem]">
                Get hired for real work—not interview performance
              </h2>
              <p className="mt-3 text-[16px] text-slate-600">
                Build a work-verified profile and let your track record speak for itself. Prozlab
                matches you to roles where your proven skills predict on-the-job success.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { title: "Show proof, not polish", desc: "Employers see verified deliverables, work history, and performance signals before they hire." },
                { title: "Skip the interview theater", desc: "Your real-world work speaks louder than rehearsed answers or keyword-stuffed resumes." },
                { title: "Matched to roles you'll succeed in", desc: "Talent intelligence surfaces opportunities aligned with your proven strengths." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button className="h-11 rounded-lg bg-brand px-7 font-semibold hover:bg-brand-dark" asChild>
                <Link href="/register">Build Your Work-Verified Profile</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats (dark) ── */}
        <section id="employers" className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl bg-navy p-6 sm:rounded-3xl sm:p-10 lg:p-14">
              <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left */}
                <div className="min-w-0">
                  <h2 className="text-[1.5rem] font-bold leading-tight text-white sm:text-[2rem] lg:text-[2.25rem]">
                    Talent intelligence that predicts on-the-job success
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                    Not another job board. Hire based on verified work, performance signals, and proof.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                    <Button className="h-11 w-full rounded-lg bg-brand px-6 font-semibold hover:bg-brand-dark sm:h-11 sm:w-auto" asChild>
                      <Link href="/request-service">Hire Proven Professionals</Link>
                    </Button>
                    <Button variant="outline" className="h-11 w-full rounded-lg border-white/25 bg-transparent px-6 font-semibold text-white hover:bg-white/10 sm:h-11 sm:w-auto" asChild>
                      <Link href="#contact">Book a Demo</Link>
                    </Button>
                  </div>
                </div>
                {/* Right — 2×2 stat cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: Target, value: "87%", label: "90-day success rate for matched hires" },
                    { icon: Timer, value: "2.5x", label: "Faster time to hire vs. traditional methods" },
                    { icon: TrendingUp, value: "67%", label: "Reduction in mis-hires" },
                    { icon: HeartHandshake, value: "98%", label: "Client satisfaction score" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="rounded-2xl bg-[#1a1040]/80 p-5 ring-1 ring-white/10">
                      <Icon className="mb-3 h-5 w-5 text-brand-muted" />
                      <div className="text-[2rem] font-extrabold leading-none text-white">{value}</div>
                      <p className="mt-2 text-[11px] leading-snug text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="resources" className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-[1.625rem] font-bold tracking-tight text-slate-900 sm:text-[2rem] lg:text-[2.25rem]">
              What our customers are saying
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { quote: "We cut our hiring timeline by 70% and every hire has exceeded expectations. Prozlab's work-based vetting is the real deal.", name: "David Lee", role: "Head of Engineering", company: "Brex", color: "bg-indigo-100 text-indigo-700" },
                { quote: "Seeing actual work samples before making an offer changed everything. It's a game changer for building high-performing teams.", name: "Jessica Wu", role: "VP of Product", company: "Ramp", color: "bg-violet-100 text-violet-700" },
                { quote: "We've built an entire team of proven performers through Prozlab. The predictive matching saves us months of trial and error.", name: "Michael Carter", role: "Talent Director", company: "Deel", color: "bg-purple-100 text-purple-700" },
              ].map((t) => (
                <div key={t.name} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
                  <Quote className="mb-4 h-8 w-8 text-brand/30" fill="currentColor" />
                  <p className="flex-1 text-[14px] leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold ${t.color}`}>
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">{t.name}</p>
                      <p className="text-[12px] text-slate-500">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-2">
              <span className="h-2 w-6 rounded-full bg-brand" />
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              <span className="h-2 w-2 rounded-full bg-slate-200" />
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section id="contact" className="pb-14 sm:pb-20 lg:pb-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 rounded-2xl bg-slate-50 px-5 py-10 sm:rounded-3xl sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-14 lg:py-14">
              <div className="min-w-0">
                <h2 className="text-[1.5rem] font-bold leading-tight text-slate-900 sm:text-[1.75rem] lg:text-[2rem]">
                  Hire proven professionals—not just qualified applicants
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
                  {HERO_SUB}
                </p>
                <ul className="mt-6 space-y-3">
                  {["Work-verified professionals", "Predictive success matching", "Real-world performance data"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px] text-slate-600">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10">
                        <Check className="h-3 w-3 text-brand" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row lg:justify-end">
                <Button className="h-11 w-full rounded-lg bg-brand px-6 text-[14px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark sm:h-12 sm:px-8 sm:text-[15px] lg:w-full xl:w-auto" asChild>
                  <Link href="/request-service">
                    Hire Proven Professionals
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="h-11 w-full rounded-lg border-slate-300 bg-white px-6 text-[14px] font-semibold sm:h-12 sm:px-8 sm:text-[15px] lg:w-full xl:w-auto" asChild>
                  <Link href="#contact">Book a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/"><ProzLabLogo size="md" /></Link>
              <p className="mt-3 text-[14px] font-medium text-brand">Skills Proven by Real Work, Not Interviews</p>
              <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-slate-500">
                {HERO_SUB}
              </p>
              <div className="mt-5 flex gap-3">
                {[Linkedin, Twitter, Youtube, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 ring-1 ring-slate-200 transition-colors hover:text-brand hover:ring-brand/30">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {Object.entries({
              Company: [
                { l: "About Us", h: "/about" },
                { l: "Features", h: "#how-it-works" },
                { l: "Professionals", h: "/proz" },
                { l: "Testimonials", h: "#resources" },
              ],
              Support: [
                { l: "Help Center", h: "#" },
                { l: "Safety", h: "#" },
                { l: "Community Guidelines", h: "#" },
                { l: "Report Issue", h: "#" },
              ],
              Legal: [
                { l: "Privacy Policy", h: "/privacy" },
                { l: "Terms of Service", h: "/terms" },
                { l: "Cookie Policy", h: "#" },
                { l: "GDPR", h: "#" },
              ],
            }).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-[13px] font-semibold text-slate-900">{title}</h3>
                <ul className="space-y-2.5">
                  {links.map(({ l, h }) => (
                    <li key={l}>
                      <Link href={h} className="text-[13px] text-slate-500 transition-colors hover:text-brand">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 sm:mt-12 sm:pt-8 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2 text-[12px] text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> info@prozlab.com</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> (800) 555-1234</span>
            </div>
            <p className="text-[12px] text-slate-400">&copy; {new Date().getFullYear()} Prozlab. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">GDPR</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">SSL Secured</span>
              <span className="text-[12px] text-slate-400">Made with ❤️ for professionals</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
