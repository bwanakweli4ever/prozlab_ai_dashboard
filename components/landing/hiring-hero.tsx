"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

const HERO_SUB =
  "We verify real projects, performance signals, and work history to predict who will succeed—so you can hire with confidence."

export function HiringHero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEF2FF] via-[#F3F0FF] to-white">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative w-full">
          {/* Ambient gradient — sinks into the mockup illustration */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background: [
                "radial-gradient(ellipse 90% 70% at 72% 38%, rgba(165, 180, 252, 0.28) 0%, transparent 68%)",
                "radial-gradient(ellipse 70% 55% at 18% 22%, rgba(238, 242, 255, 0.95) 0%, transparent 72%)",
                "radial-gradient(ellipse 80% 45% at 50% 100%, rgba(255, 255, 255, 0.92) 0%, transparent 70%)",
                "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 42%, #F8F7FF 100%)",
              ].join(", "),
            }}
          />

          <img
            src="/images/hero/prozlab_hero_exact_image.svg"
            alt=""
            className="relative z-[1] block h-auto w-full max-h-[min(74vh,780px)] object-contain object-center"
            width={1672}
            height={941}
            decoding="async"
            fetchPriority="high"
            aria-hidden
          />

          {/* Edge fades — blend image into page gradient */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[10%] bg-gradient-to-r from-[#EEF2FF]/90 to-transparent sm:w-[8%]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[8%] bg-gradient-to-l from-[#F3F0FF]/85 to-transparent sm:w-[6%]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[18%] bg-gradient-to-t from-white via-white/70 to-transparent" />

          {/* Soft headline wash — matches image lavender, not a hard block */}
          <div className="pointer-events-none absolute left-0 top-0 z-[2] h-[30%] w-[52%] bg-gradient-to-br from-[#EEF2FF]/75 via-[#EEF2FF]/35 to-transparent sm:w-[46%] lg:w-[40%]" />

          <div className="absolute inset-0 z-[3] flex flex-col justify-between">
            <div className="w-full max-w-[48%] px-[2%] pt-[2.5%] sm:max-w-[46%] sm:pt-[3%] lg:max-w-[44%] lg:pt-[3.5%]">
              <h1 className="text-[clamp(1.35rem,2.2vw,2.85rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Skills Proven by{" "}
                <span className="text-brand">Real Work,</span>
                <br />
                Not Interviews.
              </h1>

              <p className="mt-[2%] max-w-[95%] text-[clamp(12px,1.05vw,16px)] leading-relaxed text-slate-600">
                {HERO_SUB}
              </p>
            </div>

            <div className="w-full max-w-[48%] px-[2%] pb-[1.5%] sm:max-w-[46%] sm:pb-[2%] lg:max-w-[44%] lg:pb-[2.5%]">
              <div className="rounded-2xl border border-white/90 bg-white/95 p-2 shadow-[0_12px_40px_-12px_rgba(99,102,241,0.45)] backdrop-blur-md ring-1 ring-indigo-100/80 sm:p-2.5 lg:p-3">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                  <Button
                    className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#5B5FE8] via-[#6B5CF6] to-[#7C4DFF] px-5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/40 transition-all hover:from-[#4F46E5] hover:via-[#5B4AE8] hover:to-[#6D3FE8] hover:shadow-xl hover:shadow-indigo-500/50 sm:h-12 sm:w-auto sm:px-6 sm:text-[14px] lg:px-7 lg:text-[15px]"
                    asChild
                  >
                    <Link href="/request-service">Hire Proven Professionals</Link>
                  </Button>
                  <Button
                    className="h-11 w-full rounded-xl border-2 border-[#C7D2FE] bg-white px-5 text-[13px] font-bold text-slate-800 shadow-md shadow-slate-200/80 transition-all hover:border-[#A5B4FC] hover:bg-[#F5F3FF] sm:h-12 sm:w-auto sm:px-6 sm:text-[14px] lg:px-7 lg:text-[15px]"
                    asChild
                  >
                    <Link href="/register">I&apos;m a Professional</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
