"use client"

import { cn } from "@/lib/utils"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { Shield } from "lucide-react"
import Link from "next/link"

const TOTAL_STEPS = 7

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: number
  children: React.ReactNode
}) {
  const displayStep = Math.min(currentStep, TOTAL_STEPS)

  return (
    <div className="landing-page min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/">
            <ProzLabLogo size="md" />
          </Link>

          <div className="hidden flex-1 flex-col items-center px-8 md:flex">
            <p className="text-[13px] font-semibold text-slate-800">Onboarding Progress</p>
            <p className="text-[11px] text-slate-500">
              Step {displayStep} of {TOTAL_STEPS}
            </p>
            <div className="mt-2 flex items-center gap-0">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                const step = i + 1
                const done = step < displayStep
                const active = step === displayStep
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                        done || active
                          ? "bg-brand text-white"
                          : "border-2 border-slate-200 bg-white text-slate-400"
                      )}
                    >
                      {step}
                    </div>
                    {step < TOTAL_STEPS && (
                      <div
                        className={cn(
                          "h-0.5 w-8 sm:w-12",
                          done ? "bg-brand" : "bg-slate-200"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden items-center gap-2 text-[11px] text-slate-500 sm:flex">
            <Shield className="h-4 w-4 text-brand" />
            <span className="max-w-[140px] leading-tight">
              Secure &amp; Private — Your data is safe with us
            </span>
          </div>
        </div>

        {/* Mobile progress */}
        <div className="border-t border-slate-50 px-6 py-3 md:hidden">
          <p className="text-center text-[12px] font-medium text-slate-600">
            Step {displayStep} of {TOTAL_STEPS}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${(displayStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[520px] items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}

export function OnboardingCard({
  step,
  time,
  children,
  className,
}: {
  step?: number
  time?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_40px_-12px_rgba(99,102,241,0.15)]",
        className
      )}
    >
      {(step || time) && (
        <div className="flex items-center justify-between px-6 pt-5">
          {step ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
              {step}
            </div>
          ) : (
            <div />
          )}
          {time && <span className="text-[11px] text-slate-400">{time}</span>}
        </div>
      )}
      <div className="px-6 pb-6 pt-2">{children}</div>
    </div>
  )
}

export function OnboardingPrimaryBtn({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function OnboardingOutlineBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center rounded-xl border-2 border-brand/30 py-3.5 text-[15px] font-semibold text-brand transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}
