"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FolderOpen,
  Gift,
  Headphones,
  Languages,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Rocket,
  Star,
  Upload,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/contexts/profile-context"
import type { ProzProfileResponse } from "@/types/api"
import { cn, getProfileImageUrl } from "@/lib/utils"

type ExtendedProfile = ProzProfileResponse & {
  skills?: string[]
  portfolio_links?: string[]
  skill_verification_status?: string
  experience_level?: string
  predicted_success_score?: number
}

const SKILL_STYLES: Record<string, { bg: string; dot: string }> = {
  React: { bg: "bg-sky-50 border-sky-200 text-sky-800", dot: "bg-sky-500" },
  "Node.js": { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", dot: "bg-emerald-500" },
  TypeScript: { bg: "bg-blue-50 border-blue-200 text-blue-800", dot: "bg-blue-600" },
  FastAPI: { bg: "bg-teal-50 border-teal-200 text-teal-800", dot: "bg-teal-500" },
  Python: { bg: "bg-amber-50 border-amber-200 text-amber-900", dot: "bg-amber-500" },
  AWS: { bg: "bg-orange-50 border-orange-200 text-orange-800", dot: "bg-orange-500" },
  Docker: { bg: "bg-indigo-50 border-indigo-200 text-indigo-800", dot: "bg-indigo-500" },
  PostgreSQL: { bg: "bg-violet-50 border-violet-200 text-violet-800", dot: "bg-violet-500" },
}

const PROJECT_METRICS = ["30% Engagement", "50K+ Users", "99.9% Uptime", "2M+ API calls"]

const KNOWN_SKILLS = [
  "React", "Node.js", "TypeScript", "JavaScript", "FastAPI", "Python", "AWS", "Docker",
  "PostgreSQL", "MongoDB", "GraphQL", "Redis", "Kubernetes", "Vue", "Angular", "Next.js",
  "Tailwind", "Django", "Flask", "Java", "Go", "Rust", "Swift", "Kotlin", "Figma",
  "UI/UX", "Product Design", "DevOps", "Cybersecurity", "Data Science",
]

function isShortLabel(text: string, max = 36): boolean {
  const t = text.trim()
  return t.length > 0 && t.length <= max && !t.includes("\n") && !/university|bachelor|master|degree|diploma/i.test(t)
}

function extractSkillsFromText(...texts: (string | undefined)[]): string[] {
  const blob = texts.filter(Boolean).join(" ")
  const found = KNOWN_SKILLS.filter((skill) => blob.toLowerCase().includes(skill.toLowerCase()))
  return [...new Set(found)]
}

function deriveSkills(profile: ExtendedProfile): string[] {
  const fromArray = [
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    ...(Array.isArray(profile.specialties) ? profile.specialties : []),
  ]
    .map((s) => String(s).trim())
    .filter((s) => isShortLabel(s))

  if (fromArray.length) return [...new Set(fromArray)].slice(0, 12)

  const fromEducation = (profile.education || "")
    .split(/[,;|\n]+/)
    .map((s) => s.trim())
    .filter((s) => isShortLabel(s))
  if (fromEducation.length >= 2) return fromEducation.slice(0, 12)

  const fromCerts = (profile.certifications || "")
    .split(/[,;|\n]+/)
    .map((s) => s.trim())
    .filter((s) => isShortLabel(s))
  if (fromCerts.length) return fromCerts.slice(0, 12)

  const fromBio = extractSkillsFromText(profile.bio, profile.education, profile.certifications)
  if (fromBio.length) return fromBio.slice(0, 12)

  return []
}

function WaveBanner() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-full opacity-30"
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
        fill="white"
        fillOpacity="0.08"
      />
      <path
        d="M0,55 C300,20 500,70 800,45 C950,30 1100,60 1200,50 L1200,80 L0,80 Z"
        fill="white"
        fillOpacity="0.05"
      />
    </svg>
  )
}

function ProfileRing({ value }: { value: number }) {
  const offset = 251 - (value / 100) * 251
  return (
    <div className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center">
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
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[18px] font-bold leading-none text-slate-900">{value}%</p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500">Complete</p>
      </div>
    </div>
  )
}

function ChecklistRow({
  done,
  label,
  pending,
}: {
  done: boolean
  label: string
  pending?: boolean
}) {
  return (
    <li className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded-full",
            done ? "bg-emerald-500 text-white" : "border-2 border-slate-200 bg-white"
          )}
        >
          {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </span>
        <span className={done ? "text-slate-700" : "text-slate-500"}>{label}</span>
      </span>
      {pending && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
          Pending
        </span>
      )}
    </li>
  )
}

function deriveHeadline(profile: ExtendedProfile, skills: string[]): string {
  const yrs = profile.years_experience ?? 0
  const seniority = yrs >= 7 ? "Senior" : yrs >= 4 ? "Mid-Level" : yrs >= 2 ? "" : "Junior"
  const role = yrs >= 5 ? "Full-Stack Engineer" : yrs >= 2 ? "Software Engineer" : "Professional"

  let focus = profile.experience_level || "SaaS & AI Systems"
  if (skills.length >= 2) {
    focus = `${skills[0]} & ${skills[1]}`
  } else if (skills.length === 1) {
    focus = skills[0]
  }
  if (focus.length > 48) focus = "SaaS & AI Systems"

  return [seniority, role].filter(Boolean).join(" ") + ` | ${focus}`
}

type ProjectCard = {
  name: string
  url: string
  description: string
  tags: string[]
  metric: string
  initial: string
  color: string
}

function deriveProjects(profile: ExtendedProfile, skills: string[]): ProjectCard[] {
  const links = [
    ...(Array.isArray(profile.portfolio_links) ? profile.portfolio_links : []),
    ...(profile.website ? [profile.website] : []),
  ].filter(Boolean)
  const unique = [...new Set(links)]
  const colors = ["bg-indigo-600", "bg-violet-600", "bg-sky-600", "bg-emerald-600"]

  if (unique.length === 0) return []

  return unique.slice(0, 3).map((rawUrl, i) => {
    const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`
    let name = "Project"
    try {
      const host = new URL(url).hostname.replace("www.", "")
      const part = host.split(".")[0]
      name = part.charAt(0).toUpperCase() + part.slice(1)
    } catch {
      name = rawUrl.replace(/^https?:\/\//, "").split("/")[0] || "Project"
    }
    return {
      name,
      url,
      description:
        profile.bio?.slice(0, 90) ||
        "End-to-end product delivery with measurable impact on users and business outcomes.",
      tags: skills.slice(i * 2, i * 2 + 2).length ? skills.slice(i * 2, i * 2 + 2) : ["React", "FastAPI"],
      metric: PROJECT_METRICS[i % PROJECT_METRICS.length],
      initial: name.charAt(0),
      color: colors[i % colors.length],
    }
  })
}

function parseBioBullets(bio?: string): string[] {
  if (!bio) return []
  const lines = bio.split("\n").map((l) => l.trim().replace(/^[-•*]\s*/, ""))
  const bullets = lines.filter((l) => l.length > 15 && l.length < 200)
  if (bullets.length >= 2) return bullets.slice(0, 4)
  if (bio.length > 80) {
    return bio
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)
      .slice(0, 3)
      .map((s) => s + ".")
  }
  return []
}

function formatAvailabilityLabel(value?: string): string {
  if (!value?.trim()) return ""
  const normalized = value.replace(/-/g, " ").trim()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function isUnavailableStatus(value?: string): boolean {
  if (!value?.trim()) return false
  return /not available|unavailable|closed|none/i.test(value)
}

function getAvailabilityStatus(value?: string): {
  isSet: boolean
  label: string
  isOpen: boolean
  heroText: string
} {
  const isSet = Boolean(value?.trim())
  const label = formatAvailabilityLabel(value)
  const isOpen = isSet && !isUnavailableStatus(value)
  const heroText = !isSet
    ? "Set availability"
    : isOpen
      ? "Available for work"
      : label

  return { isSet, label, isOpen, heroText }
}

interface CandidateProfileViewProps {
  profile: ExtendedProfile
  onEdit?: (section?: "personal" | "summary" | "experience" | "education" | "contact") => void
}

function profileEditHref(section?: "personal" | "summary" | "experience" | "education" | "contact") {
  const params = new URLSearchParams({ edit: "1" })
  if (section) params.set("section", section)
  return `/dashboard/profile/view?${params.toString()}`
}

export function CandidateProfileView({ profile, onEdit }: CandidateProfileViewProps) {
  const router = useRouter()
  const { calculateProfileCompletion } = useProfile()
  const [bioExpanded, setBioExpanded] = useState(false)

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}` || "U"
  const skills = deriveSkills(profile)
  const visibleSkills = skills.slice(0, 8)
  const hiddenSkillCount = Math.max(0, skills.length - 8)
  const projects = deriveProjects(profile, skills)
  const bioBullets = parseBioBullets(profile.bio)
  const { percentage } = calculateProfileCompletion()

  const isVerified = profile.verification_status === "verified"
  const skillVerified = profile.skill_verification_status === "verified"
  const skillPending = profile.skill_verification_status === "in_progress"

  const hasBasic = !!(profile.first_name && profile.last_name && profile.email)
  const hasExperience = (profile.years_experience ?? 0) > 0 || (profile.bio?.length ?? 0) > 50
  const hasSkills = skills.length > 0
  const hasPortfolio = projects.length > 0

  const successRate = profile.predicted_success_score
    ? Math.round(profile.predicted_success_score)
    : Math.min(98, 72 + Math.floor(percentage / 4))

  const projectCount = Math.max(projects.length, profile.review_count || 0, 1)
  const displayRate = profile.hourly_rate && profile.hourly_rate > 0 ? profile.hourly_rate : 40
  const visibilityBoost = Math.max(8, 100 - percentage)
  const availabilityStatus = getAvailabilityStatus(profile.availability)

  const bioText =
    profile.bio ||
    "Add a professional summary to tell employers about your background, expertise, and the kind of impact you deliver."
  const bioPreview = bioText.length > 220 && !bioExpanded ? bioText.slice(0, 220) + "…" : bioText

  const stats = [
    { icon: Briefcase, label: `${profile.years_experience ?? 0}+ Years Experience` },
    { icon: FolderOpen, label: `${projectCount} Projects Completed` },
    { icon: Rocket, label: `${successRate}% Success Rate` },
    {
      icon: Star,
      label:
        profile.rating > 0
          ? `${profile.rating.toFixed(1)} Client Rating (${profile.review_count} reviews)`
          : "Building your rating",
    },
  ]

  const openEdit = (section?: "personal" | "summary" | "experience" | "education" | "contact") => {
    if (onEdit) {
      onEdit(section)
      return
    }
    router.push(profileEditHref(section))
  }

  const quickActions = [
    { title: "Upload Work Sample", icon: Upload, href: "/dashboard/verification" },
    { title: "Verify Your Work", icon: ClipboardCheck, href: "/dashboard/verification" },
    { title: "View Opportunities", icon: Briefcase, href: "/dashboard/tasks" },
    { title: "Invite & Earn", icon: Gift, href: "/dashboard" },
  ]

  const latestRole = bioBullets[0] || deriveHeadline(profile, skills).split("|")[0]?.trim() || "Professional"
  let latestCompany = projects[0]?.name || "Current Role"
  if (!projects[0]?.name && profile.website) {
    try {
      const host = new URL(
        profile.website.startsWith("http") ? profile.website : `https://${profile.website}`
      ).hostname.replace("www.", "")
      latestCompany = host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1)
    } catch {
      latestCompany = "Current Role"
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 px-1 sm:px-0 xl:grid-cols-[1fr_272px]">
      {/* ── Main column ── */}
      <div className="min-w-0 space-y-4">
        {/* Hero */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#6366f1] px-6 pb-[88px] pt-5">
            <WaveBanner />
            <div className="relative flex items-start justify-end gap-4">
              <div className="text-right text-white">
                <p className="text-[26px] font-bold leading-none">
                  ${displayRate}
                  <span className="text-[14px] font-normal opacity-75"> /hr</span>
                </p>
                <p className="mt-1.5 flex items-center justify-end gap-1.5 text-[12px] font-medium">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      availabilityStatus.isOpen
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                        : "bg-slate-300"
                    )}
                  />
                  {availabilityStatus.heroText}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 rounded-b-2xl bg-white px-6 pb-6 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 hidden h-8 gap-1.5 rounded-lg border-slate-200 text-[12px] font-semibold text-slate-700 sm:inline-flex"
              onClick={() => openEdit()}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative shrink-0 -mt-[72px]">
                <Avatar className="h-[116px] w-[116px] border-[5px] border-white shadow-xl">
                  <AvatarImage src={getProfileImageUrl(profile.profile_image_url)} alt={fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="min-w-0 flex-1 overflow-hidden pb-0.5 pr-2 sm:pt-12">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-bold tracking-tight text-slate-900">{fullName}</h1>
                  {(isVerified || skillVerified) && (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                      <BadgeCheck className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug text-slate-700">
                  {deriveHeadline(profile, skills)}
                </p>
                {profile.location && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="truncate">{profile.location}</span>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
                      isVerified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    )}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified Professional
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
                      skillVerified
                        ? "border-violet-200 bg-violet-50 text-violet-700"
                        : "border-indigo-100 bg-indigo-50 text-indigo-600"
                    )}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Top 5% Work Verification Score
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Icon className="h-4 w-4 text-brand" />
              </div>
              <p className="text-[12px] font-semibold leading-snug text-slate-800">{label}</p>
            </div>
          ))}
        </div>

        {/* About Me */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">About Me</h2>
            <button
              type="button"
              onClick={() => openEdit("summary")}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_200px]">
            <div className="min-w-0 pr-2">
              <p className="break-words text-[14px] leading-[1.7] text-slate-600 whitespace-pre-line">{bioPreview}</p>
              {bioText.length > 220 && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((v) => !v)}
                  className="mt-2 text-[13px] font-semibold text-brand hover:text-brand-dark"
                >
                  {bioExpanded ? "View Less" : "View More"}
                </button>
              )}
            </div>
            <div className="space-y-3 border-slate-100 lg:border-l lg:pl-6">
              {profile.email && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{profile.email}</span>
                  </p>
                </div>
              )}
              {profile.phone_number && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {profile.phone_number}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Languages</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-700">
                  <Languages className="h-3.5 w-3.5 text-slate-400" />
                  English — Fluent
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Timezone</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  GMT +2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">Skills</h2>
            <button
              type="button"
              onClick={() => openEdit("summary")}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleSkills.length > 0 ? (
              <>
                {visibleSkills.map((skill) => {
                  const label = skill.length > 32 ? skill.slice(0, 30) + "…" : skill
                  const style = SKILL_STYLES[skill] || SKILL_STYLES[label] || {
                    bg: "bg-slate-50 border-slate-200 text-slate-700",
                    dot: "bg-slate-400",
                  }
                  return (
                    <span
                      key={skill}
                      className={cn(
                        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                        style.bg
                      )}
                    >
                      <span className={cn("h-2 w-2 shrink-0 rounded-sm", style.dot)} />
                      <span className="truncate">{label}</span>
                    </span>
                  )
                })}
                {hiddenSkillCount > 0 && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                    + {hiddenSkillCount} more
                  </span>
                )}
              </>
            ) : (
              <p className="text-[13px] leading-relaxed text-slate-500">
                No short skill tags yet.{" "}
                <button
                  type="button"
                  onClick={() => openEdit("summary")}
                  className="font-semibold text-brand hover:underline"
                >
                  Add skills in Edit Profile
                </button>{" "}
                — education history stays in Experience below.
              </p>
            )}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">Featured Projects</h2>
            <Link href="/dashboard/verification" className="text-[12px] font-semibold text-brand hover:underline">
              View all projects
            </Link>
          </div>
          {projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.url}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold text-white",
                        project.color
                      )}
                    >
                      {project.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-slate-900">{project.name}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold text-emerald-600">{project.metric}</span>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
                    >
                      View Project <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {["MISTA.io", "Itike", "DataPulse"].map((name, i) => (
                <div
                  key={name}
                  className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center"
                >
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-white",
                      ["bg-indigo-600", "bg-violet-600", "bg-sky-600"][i]
                    )}
                  >
                    {name.charAt(0)}
                  </div>
                  <p className="text-[13px] font-semibold text-slate-700">{name}</p>
                  <Link
                    href="/dashboard/verification"
                    className="mt-2 inline-block text-[11px] font-semibold text-brand"
                  >
                    Add project →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">Experience</h2>
            <button
              type="button"
              onClick={() => openEdit("experience")}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="relative mt-5 pl-6 pr-2">
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-[3px] border-brand bg-white" />
            <span className="absolute bottom-0 left-[5px] top-4 w-0.5 bg-indigo-100" />
            <div className="pb-1">
              <p className="text-[15px] font-bold text-slate-900">{latestRole}</p>
              <p className="mt-0.5 text-[14px] font-semibold text-brand">{latestCompany}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
                <span className="capitalize">{profile.availability?.replace(/-/g, " ") || "Full-time"}</span>
                <span>·</span>
                <span>
                  {profile.years_experience
                    ? `${new Date().getFullYear() - (profile.years_experience || 0)} – Present`
                    : "2021 – Present"}
                </span>
                {profile.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </span>
                  </>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {(bioBullets.length > 0
                  ? bioBullets
                  : [
                      "Led end-to-end product delivery across frontend, backend, and cloud infrastructure.",
                      "Collaborated with cross-functional teams to ship features that improved user engagement.",
                      "Mentored junior developers and established engineering best practices.",
                    ]
                ).map((bullet, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-600">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {bullet}
                  </li>
                ))}
              </ul>
              {profile.education && profile.education.length > 40 && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Education</p>
                  <p className="mt-2 break-words text-[13px] leading-relaxed text-slate-600 whitespace-pre-line">
                    {profile.education}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="space-y-4">
        {/* Profile Strength */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-center text-[14px] font-bold text-slate-900">Profile Strength</p>
          <div className="my-4">
            <ProfileRing value={percentage} />
          </div>
          <p className="text-center text-[12px] leading-relaxed text-slate-500">
            A stronger profile gets you <span className="font-semibold text-slate-700">3× more matches</span>
          </p>
          <Button
            className="mt-4 w-full rounded-xl bg-brand py-5 text-[14px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark"
                onClick={() =>
                  router.push(percentage >= 72 ? "/dashboard/verification" : profileEditHref())
                }
          >
            Complete Profile
          </Button>
          <p className="mt-2 text-center text-[11px] font-semibold text-emerald-600">+{visibilityBoost}% visibility</p>
          <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
            <ChecklistRow done={hasBasic} label="Basic Information" />
            <ChecklistRow done={hasExperience} label="Work Experience" />
            <ChecklistRow done={hasSkills} label="Skills" />
            <ChecklistRow done={hasPortfolio} label="Portfolio" />
            <ChecklistRow done={skillVerified} pending={skillPending && !skillVerified} label="Work Verification" />
          </ul>
        </div>

        {/* Availability */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Calendar className="h-4 w-4 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-900">Availability</p>
              {availabilityStatus.isSet ? (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        availabilityStatus.isOpen
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                          : "bg-slate-400"
                      )}
                    />
                    <span className="text-[13px] font-semibold capitalize text-slate-800">
                      {availabilityStatus.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                    {availabilityStatus.isOpen
                      ? "Employers can see you're open to new opportunities."
                      : "Your profile shows you're not currently open to new work."}
                  </p>
                  <button
                    type="button"
                    onClick={() => openEdit("experience")}
                    className="mt-2 inline-block text-[12px] font-semibold text-brand hover:underline"
                  >
                    Edit availability
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                    Let employers know when you&apos;re open for new opportunities.
                  </p>
                  <button
                    type="button"
                    onClick={() => openEdit("experience")}
                    className="mt-2 inline-block text-[12px] font-semibold text-brand hover:underline"
                  >
                    Set Availability
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <p className="border-b border-slate-100 px-4 py-3 text-[13px] font-bold text-slate-900">Quick Actions</p>
          <ul>
            {quickActions.map((action, i) => (
              <li key={action.title} className={i > 0 ? "border-t border-slate-50" : ""}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between px-4 py-3 text-[13px] text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon className="h-4 w-4 text-slate-400" />
                    {action.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Need Help */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[13px] font-bold text-slate-900">Need Help?</p>
          <p className="mt-1 text-[12px] text-slate-500">We&apos;re here to help you succeed.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-xl border-slate-200 text-[13px] font-medium text-slate-700"
          >
            <Headphones className="mr-2 h-4 w-4 text-brand" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
