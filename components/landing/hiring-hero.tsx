"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  BarChart3,
  FileText,
  FolderOpen,
  HelpCircle,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const HERO_LEAD =
  "Hire proven professionals, not just qualified applicants. Prozlab uses verified work history, performance signals, and intelligent matching to predict who will succeed on the job—not just pass the interview."

const HERO_SUB =
  "Prozlab predicts hiring success using verified skills, real-world assessments, and performance data."

const TRADITIONAL_STEPS = [
  { label: "Resume", icon: FileText },
  { label: "Interview", icon: Users },
  { label: "Gut Feeling", icon: HelpCircle },
]

const PROZLAB_PROOF = [
  { label: "Real Projects", icon: FolderOpen },
  { label: "Design & Prototypes", icon: Layers },
  { label: "Performance Data", icon: BarChart3 },
  { label: "Peer & Client Feedback", icon: UserPlus },
]

const FEATURE_BAR = [
  { label: "Real Work", sub: "Verified projects", icon: FolderOpen },
  { label: "Performance Signals", sub: "Data that matters", icon: TrendingUp },
  { label: "AI Matching", sub: "Predictive success", icon: Sparkles },
  { label: "Better Hires", sub: "Stronger teams", icon: Users },
]

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function HiringHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white pb-8 pt-10 sm:pb-12 sm:pt-14 lg:pb-16 lg:pt-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-[480px] w-[480px] rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 xl:gap-12">
          {/* Left — copy + comparison */}
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand shadow-sm sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              Talent Intelligence Platform
            </div>

            <h1 className="max-w-[640px] text-[1.875rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.35rem] lg:text-[3rem]">
              Skills Proven by{" "}
              <span className="text-brand">Real Work,</span>
              <br className="hidden sm:block" /> Not Interviews.
            </h1>

            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {HERO_LEAD}
            </p>
            <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-slate-500">
              {HERO_SUB}
            </p>

            {/* Traditional vs Prozlab */}
            <div className="mt-8 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_12px_40px_-20px_rgba(99,102,241,0.35)] backdrop-blur-sm sm:p-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-4">
                {/* Traditional */}
                <div>
                  <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Traditional Hiring
                  </p>
                  <div className="space-y-2">
                    {TRADITIONAL_STEPS.map((step, index) => (
                      <div key={step.label}>
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                            <step.icon className="h-4 w-4" />
                          </div>
                          <span className="text-[12px] font-semibold text-slate-700 sm:text-[13px]">{step.label}</span>
                        </div>
                        {index < TRADITIONAL_STEPS.length - 1 && (
                          <div className="flex justify-center py-1 text-slate-300">
                            <ArrowDown className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center pt-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-violet-500 text-[11px] font-extrabold text-white shadow-lg shadow-indigo-300/50">
                    VS
                  </div>
                </div>

                {/* Prozlab */}
                <div>
                  <div className="mb-3 flex justify-center">
                    <span className="rounded-full bg-gradient-to-r from-brand to-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                      Prozlab Hiring
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm">
                    <div className="space-y-0 divide-y divide-indigo-50">
                      {PROZLAB_PROOF.map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-brand">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-semibold leading-tight text-slate-800 sm:text-[12px]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-3">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <div>
                          <p className="text-[12px] font-bold text-slate-900 sm:text-[13px]">96% Predicted Success</p>
                          <p className="text-[10px] text-slate-500 sm:text-[11px]">Hire with confidence</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button
                className="h-11 w-full rounded-xl bg-brand px-6 text-[14px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]"
                asChild
              >
                <Link href="/request-service">Hire Proven Professionals</Link>
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-300 bg-white px-6 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]"
                asChild
              >
                <Link href="/register">I&apos;m a Professional</Link>
              </Button>
            </div>
          </div>

          {/* Right — hero visual */}
          <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <div className="pointer-events-none absolute -inset-3 rounded-[28px] bg-gradient-to-br from-indigo-200/40 via-transparent to-violet-200/30 blur-xl" />
            <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/50 shadow-[0_24px_60px_-20px_rgba(79,70,229,0.35)] backdrop-blur-sm">
              <Image
                src="/images/hero/professional-workspace.png"
                alt="Professional verified through real work — GitHub, Figma, performance data, and client feedback"
                width={1120}
                height={900}
                priority
                className="h-auto w-full object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating badges echoing mockup integrations */}
            <div className="pointer-events-none absolute left-2 top-6 hidden rounded-full bg-[#24292f] p-2 text-white shadow-lg sm:block">
              <GitHubMark className="h-4 w-4" />
            </div>
            <div className="pointer-events-none absolute right-4 top-10 hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg sm:block">
              <p className="text-[10px] font-bold text-emerald-600">+22% User Engagement</p>
            </div>
            <div className="pointer-events-none absolute bottom-16 left-4 hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg sm:block">
              <p className="text-[10px] font-semibold text-slate-700">4.9/5 client rating</p>
            </div>
          </div>
        </div>

        {/* Bottom feature bar */}
        <div className="mt-10 rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md sm:mt-12 sm:px-6 sm:py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {FEATURE_BAR.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-brand">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-900 sm:text-[13px]">{item.label}</p>
                  <p className="text-[10px] text-slate-500 sm:text-[11px]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
