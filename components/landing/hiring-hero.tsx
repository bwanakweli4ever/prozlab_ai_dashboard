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

export function HiringHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F5F3FF]">
      {/* Right illustration — full opacity on desktop (GitHub, Figma, workflow icons) */}
      <div className="pointer-events-none absolute inset-y-0 left-[38%] right-0 hidden lg:block">
        <Image
          src="/images/hero/professional-workspace.png"
          alt=""
          fill
          priority
          className="object-cover object-[42%_50%]"
          sizes="62vw"
          aria-hidden
        />
      </div>

      {/* Solid lavender left panel — text area only, does not cover illustration */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-[58%] bg-[#F5F3FF] max-lg:hidden" />

      {/* Soft seam blend between panels */}
      <div className="pointer-events-none absolute inset-y-0 left-[34%] hidden w-[10%] bg-gradient-to-r from-[#F5F3FF] to-transparent lg:block" />

      <div className="relative mx-auto flex min-h-[700px] max-w-[1240px] flex-col px-4 pb-8 pt-10 sm:min-h-[740px] sm:px-6 sm:pb-10 sm:pt-12 lg:min-h-[780px] lg:px-8 lg:pb-12 lg:pt-14">
        <div className="flex flex-1 flex-col justify-center">
          <div className="w-full max-w-[540px] lg:max-w-[560px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand shadow-sm sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
              Talent Intelligence Platform
            </div>

            <h1 className="text-[1.875rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-[2.35rem] lg:text-[2.85rem] xl:text-[3rem]">
              Skills Proven by{" "}
              <span className="text-brand">Real Work,</span>
              <br />
              Not Interviews.
            </h1>

            <p className="mt-4 text-[14px] leading-relaxed text-slate-600 sm:text-[15px] lg:text-[16px]">
              {HERO_LEAD}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500 sm:text-[14px]">
              {HERO_SUB}
            </p>

            <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_12px_40px_-20px_rgba(99,102,241,0.25)] sm:mt-8 sm:p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2.5 sm:gap-3">
                <div>
                  <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-[11px]">
                    Traditional Hiring
                  </p>
                  <div className="space-y-1.5">
                    {TRADITIONAL_STEPS.map((step, index) => (
                      <div key={step.label}>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 sm:px-3 sm:py-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-600 sm:h-8 sm:w-8">
                            <step.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 sm:text-[12px]">{step.label}</span>
                        </div>
                        {index < TRADITIONAL_STEPS.length - 1 && (
                          <div className="flex justify-center py-0.5 text-slate-400">
                            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.25} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center pt-7 sm:pt-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-violet-500 text-[10px] font-extrabold text-white shadow-lg shadow-indigo-300/50 sm:h-10 sm:w-10 sm:text-[11px]">
                    VS
                  </div>
                </div>

                <div>
                  <div className="mb-2.5 flex justify-center">
                    <span className="rounded-full bg-gradient-to-r from-brand to-violet-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md sm:px-3 sm:py-1 sm:text-[10px]">
                      Prozlab Hiring
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm">
                    <div className="divide-y divide-indigo-50">
                      {PROZLAB_PROOF.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-brand sm:h-8 sm:w-8">
                            <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                          </div>
                          <span className="text-[10px] font-semibold leading-tight text-slate-800 sm:text-[11px]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-2.5 py-2.5 sm:px-3 sm:py-3">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand sm:h-4 sm:w-4" strokeWidth={2.25} />
                        <div>
                          <p className="text-[11px] font-bold text-slate-900 sm:text-[12px]">96% Predicted Success</p>
                          <p className="text-[9px] text-slate-600 sm:text-[10px]">Hire with confidence</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <Button
                className="h-11 w-full rounded-xl bg-brand px-6 text-[14px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark sm:h-12 sm:w-auto sm:px-7"
                asChild
              >
                <Link href="/request-service">Hire Proven Professionals</Link>
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-300 bg-white px-6 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 sm:h-12 sm:w-auto sm:px-7"
                asChild
              >
                <Link href="/register">I&apos;m a Professional</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mt-6 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:mt-8 sm:px-6 sm:py-5 lg:ml-auto lg:max-w-[62%]">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {FEATURE_BAR.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-brand sm:h-10 sm:w-10">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 sm:text-[12px]">{item.label}</p>
                  <p className="text-[9px] text-slate-600 sm:text-[10px]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
