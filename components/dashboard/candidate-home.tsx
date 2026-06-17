"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  ChevronRight,
  ClipboardCheck,
  Code2,
  FolderOpen,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Upload,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { cn } from "@/lib/utils"

const ONBOARDING_STEPS = [
  { id: "personal", label: "Personal Info", icon: Target },
  { id: "expertise", label: "Expertise", icon: Star },
  { id: "portfolio", label: "Work Samples", icon: FolderOpen },
  { id: "assessment", label: "Work Verification", icon: ShieldCheck },
  { id: "complete", label: "Complete", icon: Check },
] as const

function CircularProgress({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E0E7FF" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#6366F1"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-brand">{value}%</span>
    </div>
  )
}

function ProfileStrengthGauge({ label }: { label: string }) {
  return (
    <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#E0E7FF" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#6366F1"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="239"
          strokeDashoffset="60"
        />
      </svg>
      <span className="absolute text-[13px] font-bold text-slate-800">{label}</span>
    </div>
  )
}

function deriveOnboardingStep(
  profile: ReturnType<typeof useProfile>["profile"],
  skills: string[]
) {
  if (!profile) return 1
  if (skills.length === 0) return 2
  if (!profile.website && !profile.bio) return 3
  const verification = (profile as { skill_verification_status?: string }).skill_verification_status
  if (verification !== "verified") return 4
  return 5
}

export function CandidateHome() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, calculateProfileCompletion } = useProfile()

  const firstName = user?.first_name || "there"
  const [skills, setSkills] = useState<string[]>([])
  const [completion, setCompletion] = useState(35)

  useEffect(() => {
    let nextSkills: string[] = []
    try {
      const stored = localStorage.getItem("onboardingSkills")
      if (stored) nextSkills = JSON.parse(stored)
    } catch {
      /* ignore */
    }
    const profileSkills = (profile as { skills?: string[] } | null)?.skills
    if (Array.isArray(profileSkills) && profileSkills.length > 0) {
      nextSkills = profileSkills
    }
    setSkills(nextSkills)

    const { percentage } = calculateProfileCompletion()
    setCompletion(percentage > 0 ? percentage : 35)
  }, [profile, calculateProfileCompletion])

  const currentStep = deriveOnboardingStep(profile, skills)
  const strengthLabel = completion >= 80 ? "Great" : completion >= 50 ? "Good" : "Fair"

  const continueAction = () => {
    if (currentStep <= 1) router.push("/register")
    else if (currentStep === 2) router.push("/register")
    else if (currentStep === 3) router.push("/dashboard/profile/view?edit=1")
    else if (currentStep === 4) router.push("/dashboard/verification")
    else router.push("/dashboard/profile/view")
  }

  const continueTitle =
    currentStep === 2
      ? "Add your key skills"
      : currentStep === 3
        ? "Add work samples"
        : currentStep === 4
          ? "Verify your skills"
          : "Finish your profile"

  const continueDesc =
    currentStep === 2
      ? "This helps our AI match you with the right opportunities."
      : currentStep === 3
        ? "Showcase your best projects to stand out to employers."
        : currentStep === 4
          ? "Submit real-world evidence to earn your work-verified badge."
          : "Complete the remaining details on your profile."

  const quickActions = [
    {
      title: "Upload Work Sample",
      desc: "Add portfolio items",
      icon: Upload,
      href: "/dashboard/profile/view?edit=1",
    },
    {
      title: "AI Profile Assist",
      desc: "Import & enrich your profile",
      icon: Sparkles,
      href: "/dashboard/profile/ai-assist",
    },
    {
      title: "Verify Skills",
      desc: "GitHub, work & references",
      icon: ClipboardCheck,
      href: "/dashboard/verification",
    },
    {
      title: "View Opportunities",
      desc: "Roles matched to your proven skills",
      icon: Briefcase,
      href: "/dashboard/tasks",
    },
    {
      title: "View Profile",
      desc: "See public profile",
      icon: BarChart3,
      href: "/dashboard/profile/view",
    },
  ]

  const stats = [
    { label: "Profile views", value: profile?.profile_views ?? 24, icon: "👁" },
    { label: "Role matches", value: 12, icon: "✨" },
    { label: "Engagements", value: 6, icon: "📋" },
    { label: "Work verified", value: 1, icon: "🛡" },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
      {/* ── Main column ── */}
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Build your work-verified profile and get matched to roles where your proven skills predict success.
          </p>
        </div>

        {/* Profile completion + stepper */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-slate-900">Complete your profile</h2>
            <CircularProgress value={completion} />
          </div>

          <div className="relative flex items-start justify-between px-2">
            <div className="absolute left-8 right-8 top-5 h-0.5 bg-slate-200" />
            <div
              className="absolute left-8 top-5 h-0.5 bg-brand transition-all"
              style={{ width: `${Math.max(0, ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100)}%`, maxWidth: "calc(100% - 4rem)" }}
            />
            {ONBOARDING_STEPS.map((step, i) => {
              const StepIcon = step.icon
              const stepNum = i + 1
              const done = stepNum < currentStep
              const active = stepNum === currentStep
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2" style={{ width: `${100 / ONBOARDING_STEPS.length}%` }}>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      done || active
                        ? "border-brand bg-brand text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    )}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "text-center text-[10px] font-medium leading-tight sm:text-[11px]",
                      active ? "text-brand" : done ? "text-slate-700" : "text-slate-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Continue card */}
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 to-indigo-50 p-5">
          <p className="text-[12px] font-medium text-slate-500">Continue where you left off</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Code2 className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">{continueTitle}</h3>
                <p className="mt-0.5 text-[13px] text-slate-600">{continueDesc}</p>
                <p className="mt-1 text-[11px] text-slate-400">Takes less than 2 minutes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={continueAction}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI assist CTA */}
        <Link
          href="/dashboard/profile/ai-assist"
          className="group flex flex-col gap-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Use AI to build your work-verified profile</h3>
              <p className="mt-0.5 text-[13px] text-slate-600">
                Import your background and let AI help highlight your skills, projects, and proven experience.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-indigo-200 group-hover:bg-brand-dark">
            Open AI Assistant <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-[15px] font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-brand/10 group-hover:text-brand">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-slate-900">{action.title}</p>
                    <p className="text-[12px] text-slate-500">{action.desc}</p>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 text-slate-300 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right sidebar widgets ── */}
      <div className="space-y-4">
        {/* Tips */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
            <p className="text-[13px] font-semibold text-slate-900">Tips to stand out</p>
          </div>
          <div className="p-4">
            <ul className="space-y-2.5">
              {[
                "Complete your profile",
                "Add work samples",
                "Get skills verified",
                "Keep profile updated",
              ].map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-[13px] text-slate-700">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} />
                  {tip}
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 text-[12px] font-semibold text-brand hover:text-brand-dark">
              View all tips →
            </button>
          </div>
        </div>

        {/* Profile strength */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
          <p className="text-[13px] font-semibold text-slate-900">Profile strength</p>
          <div className="my-3">
            <ProfileStrengthGauge label={strengthLabel} />
          </div>
          <p className="text-[12px] leading-relaxed text-slate-500">
            Complete remaining steps to boost your visibility to employers.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile/view?edit=1")}
            className="mt-3 text-[12px] font-semibold text-brand hover:text-brand-dark"
          >
            Improve now →
          </button>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-[13px] font-semibold text-slate-900">Your stats</p>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">This month</span>
          </div>
          <ul className="divide-y divide-slate-50">
            {stats.map((stat) => (
              <li key={stat.label}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2 text-[13px] text-slate-700">
                    <span className="text-base">{stat.icon}</span>
                    {stat.label}
                  </span>
                  <span className="flex items-center gap-1 text-[13px] font-semibold text-slate-900">
                    {stat.value}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[13px] font-semibold text-slate-900">Need help?</p>
          <p className="mt-1 text-[12px] text-slate-500">Our support team is here for you</p>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Headphones className="h-4 w-4 text-brand" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
