"use client"

import {
  BadgeCheck,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn, getProfileImageUrl } from "@/lib/utils"

export interface TalentProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  bio?: string
  location?: string
  years_experience?: number
  hourly_rate?: number
  availability?: string
  verification_status: "pending" | "verified" | "rejected"
  created_at: string
  updated_at?: string
  profile_image_url?: string
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  phone?: string
  specialties?: string[]
  rating?: number
  review_count?: number
  skill_verification_status?: string
  verification_score?: number
}

export interface ReviewChecklist {
  identity: boolean
  portfolio: boolean
  assessment: boolean
  experience: boolean
  references: boolean
}

interface TalentVerificationBoardProps {
  profiles: TalentProfile[]
  totalFiltered?: number
  totalLoaded?: number
  page?: number
  pageSize?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  loading: boolean
  stats: {
    pending: number
    approved: number
    rejected: number
    needMoreInfo: number
    topRated: number
    verificationRate: number
  }
  search: string
  onSearchChange: (v: string) => void
  activeTab: string
  onTabChange: (v: string) => void
  professionFilter: string
  onProfessionFilterChange: (v: string) => void
  experienceFilter: string
  onExperienceFilterChange: (v: string) => void
  availabilityFilter: string
  onAvailabilityFilterChange: (v: string) => void
  sortBy: string
  onSortChange: (v: string) => void
  professions: string[]
  selectedProfile: TalentProfile | null
  reviewLoading: boolean
  reviewChecklist: ReviewChecklist
  reviewScore: number
  aiSummary: string[]
  onSelectReview: (profile: TalentProfile) => void
  onCloseReview: () => void
  onApprove: () => void
  onReject: () => void
  onRequestChanges: () => void
  actionLoading: boolean
  adminNotes: string
  onAdminNotesChange: (v: string) => void
  rejectionReason: string
  onRejectionReasonChange: (v: string) => void
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? "#6366F1" : score >= 60 ? "#F59E0B" : "#94A3B8"

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-slate-800">
        {score}%
      </span>
    </div>
  )
}

function daysAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

function computeMatchScore(p: TalentProfile): number {
  if (p.verification_score != null) return p.verification_score
  let score = 40
  if (p.rating) score += Math.min(p.rating * 12, 30)
  if (p.years_experience) score += Math.min(p.years_experience * 2, 16)
  if (p.website || p.linkedin) score += 8
  if (p.bio && p.bio.length > 80) score += 6
  if (p.skill_verification_status === "verified") score += 10
  if (p.verification_status === "verified") score += 6
  return Math.min(Math.round(score), 99)
}

function ChecklistRow({ ok, label, missing }: { ok: boolean; label: string; missing?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-slate-700">{label}</span>
      {ok ? (
        <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-600">
          <Check className="h-3.5 w-3.5" /> Verified
        </span>
      ) : missing ? (
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Missing</span>
      ) : (
        <span className="text-[12px] text-slate-400">Pending</span>
      )}
    </div>
  )
}

export function TalentVerificationBoard({
  profiles,
  totalFiltered = 0,
  totalLoaded = 0,
  page = 1,
  pageSize = 12,
  totalPages = 1,
  onPageChange,
  loading,
  stats,
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  professionFilter,
  onProfessionFilterChange,
  experienceFilter,
  onExperienceFilterChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  sortBy,
  onSortChange,
  professions,
  selectedProfile,
  reviewLoading,
  reviewChecklist,
  reviewScore,
  aiSummary,
  onSelectReview,
  onCloseReview,
  onApprove,
  onReject,
  onRequestChanges,
  actionLoading,
  adminNotes,
  onAdminNotesChange,
  rejectionReason,
  onRejectionReasonChange,
}: TalentVerificationBoardProps) {
  const tabs = [
    { id: "all", label: "All", count: totalLoaded },
    { id: "pending", label: "Pending Review", count: stats.pending },
    { id: "verified", label: "Approved", count: stats.approved },
    { id: "need_more", label: "Need More Info", count: stats.needMoreInfo },
    { id: "rejected", label: "Rejected", count: stats.rejected },
    { id: "top_rated", label: "Top Rated", count: stats.topRated },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      <div className={cn("min-w-0 flex-1 space-y-5 pb-8 pr-0 transition-all", selectedProfile && "xl:pr-[380px]")}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Talent Verification</h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Review work-verified professionals before they go live — hire based on proof, not interviews.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-[14px]"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "Pending Review", value: stats.pending, sub: "Awaiting action", icon: Clock, accent: "text-amber-600 bg-amber-50" },
            { label: "Approved", value: stats.approved, sub: "Live on platform", icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50" },
            { label: "Rejected", value: stats.rejected, sub: "Declined", icon: XCircle, accent: "text-red-600 bg-red-50" },
            { label: "Need More Info", value: stats.needMoreInfo, sub: "Incomplete", icon: Briefcase, accent: "text-orange-600 bg-orange-50" },
            { label: "Verification Rate", value: `${stats.verificationRate}%`, sub: "Approval ratio", icon: BadgeCheck, accent: "text-brand bg-brand/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-slate-500">{s.label}</p>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.accent)}>
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-[22px] font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                activeTab === t.id
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {t.label}
              <span className="ml-1.5 text-[12px] opacity-70">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={professionFilter} onValueChange={onProfessionFilterChange}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-slate-200 bg-white text-[12px]">
              <SelectValue placeholder="Profession" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All professions</SelectItem>
              {professions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={experienceFilter} onValueChange={onExperienceFilterChange}>
            <SelectTrigger className="h-9 w-[130px] rounded-lg border-slate-200 bg-white text-[12px]">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All experience</SelectItem>
              <SelectItem value="0-2">0–2 years</SelectItem>
              <SelectItem value="3-5">3–5 years</SelectItem>
              <SelectItem value="6-10">6–10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={onAvailabilityFilterChange}>
            <SelectTrigger className="h-9 w-[130px] rounded-lg border-slate-200 bg-white text-[12px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy / Limited</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-1 text-[12px] text-slate-500">
            Sort by:
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="h-9 w-[120px] border-0 bg-transparent text-[12px] font-medium text-slate-800 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="score">Match score</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : totalFiltered === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-[14px] text-slate-500">
            {totalLoaded === 0 ? (
              <p>No professionals found yet. New sign-ups will appear here for review.</p>
            ) : activeTab === "pending" && stats.pending === 0 ? (
              <div className="space-y-2">
                <p>No profiles are awaiting review right now.</p>
                <p className="text-[13px] text-slate-400">
                  {stats.approved} approved · switch to <strong>All</strong> or <strong>Approved</strong> to browse existing talent.
                </p>
              </div>
            ) : (
              <p>No candidates match your current tab or filters.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const score = computeMatchScore(profile)
              const title = profile.specialties?.[0] || "Professional"
              const portfolioOk = !!(profile.website || profile.linkedin)
              const assessmentOk = profile.skill_verification_status === "verified" || profile.skill_verification_status === "pending_review"
              const isSelected = selectedProfile?.id === profile.id

              return (
                <div
                  key={profile.id}
                  className={cn(
                    "rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md",
                    isSelected ? "border-brand ring-2 ring-brand/20" : "border-slate-200/80"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border border-slate-100">
                      <AvatarImage src={getProfileImageUrl(profile.profile_image_url)} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-[13px]">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-slate-900">
                          {profile.first_name} {profile.last_name}
                        </p>
                        {profile.verification_status === "verified" && (
                          <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" />
                        )}
                      </div>
                      <p className="truncate text-[12px] text-slate-500">{title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {profile.location || "—"} · {daysAgo(profile.created_at)}
                      </p>
                    </div>
                    <ScoreRing score={score} size={48} />
                  </div>

                  {profile.specialties && profile.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {profile.specialties.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {portfolioOk && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Check className="h-3 w-3" /> Portfolio
                      </span>
                    )}
                    {assessmentOk && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                        <Star className="h-3 w-3" /> Work Verified {score}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg text-[12px]"
                      onClick={() => onSelectReview(profile)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg bg-brand text-[12px] hover:bg-brand/90"
                      onClick={() => onSelectReview(profile)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && totalFiltered > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-slate-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalFiltered)} of {totalFiltered} candidate
              {totalFiltered !== 1 ? "s" : ""}
            </p>
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-[12px]"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-[12px]"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review sidebar */}
      {selectedProfile && (
        <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[380px] flex-col border-l border-slate-200 bg-white shadow-xl xl:top-16 xl:h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-[14px] font-semibold text-slate-900">Review</p>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCloseReview}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {reviewLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="border-b border-slate-100 p-4">
                <div className="flex gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={getProfileImageUrl(selectedProfile.profile_image_url)} />
                    <AvatarFallback>{selectedProfile.first_name?.[0]}{selectedProfile.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">
                      {selectedProfile.first_name} {selectedProfile.last_name}
                    </p>
                    <p className="text-[12px] text-slate-500">{selectedProfile.specialties?.[0] || "Professional"}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3" /> {selectedProfile.location || "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {selectedProfile.hourly_rate != null && selectedProfile.hourly_rate > 0 && (
                        <span className="font-semibold text-slate-800">${selectedProfile.hourly_rate}/hr</span>
                      )}
                      {selectedProfile.years_experience != null && (
                        <span className="text-slate-500">{selectedProfile.years_experience} yrs exp.</span>
                      )}
                      {selectedProfile.availability && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                          {selectedProfile.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <ScoreRing score={reviewScore} size={72} />
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Verification Score</p>
                    <p className="text-[12px] text-slate-500">
                      {reviewScore >= 80 ? "Excellent" : reviewScore >= 60 ? "Good" : "Needs review"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 px-4 py-3">
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-slate-400">Checklist</p>
                <ChecklistRow ok={reviewChecklist.identity} label="Identity Verified" />
                <ChecklistRow ok={reviewChecklist.portfolio} label="Portfolio Verified" />
                <ChecklistRow ok={reviewChecklist.assessment} label="Work Evidence Verified" />
                <ChecklistRow ok={reviewChecklist.experience} label="Experience Verified" />
                <ChecklistRow ok={reviewChecklist.references} label="References" missing={!reviewChecklist.references} />
              </div>

              {aiSummary.length > 0 && (
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                      <Sparkles className="h-3.5 w-3.5 text-brand" /> AI Verification Summary
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Low Risk
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {aiSummary.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProfile.specialties && selectedProfile.specialties.length > 0 && (
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="mb-2 text-[12px] font-semibold text-slate-700">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.specialties.map((s) => (
                      <span key={s} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(selectedProfile.website || selectedProfile.linkedin) && (
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="mb-2 text-[12px] font-semibold text-slate-700">Portfolio Highlights</p>
                  <div className="flex gap-2">
                    {selectedProfile.website && (
                      <a
                        href={selectedProfile.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-brand/10 hover:text-brand"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {selectedProfile.linkedin && (
                      <a
                        href={selectedProfile.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-brand/10 hover:text-brand"
                      >
                        <Briefcase className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selectedProfile.bio && (
                <div className="px-4 py-3">
                  <p className="mb-1 text-[12px] font-semibold text-slate-700">About</p>
                  <p className="text-[12px] leading-relaxed text-slate-600 line-clamp-4">{selectedProfile.bio}</p>
                </div>
              )}

              <div className="mt-auto space-y-2 border-t border-slate-100 p-4">
                <Textarea
                  placeholder="Admin notes (optional)"
                  value={adminNotes}
                  onChange={(e) => onAdminNotesChange(e.target.value)}
                  className="min-h-[60px] rounded-lg border-slate-200 text-[12px]"
                />
                {selectedProfile.verification_status === "pending" && (
                  <Textarea
                    placeholder="Rejection reason (required to reject)"
                    value={rejectionReason}
                    onChange={(e) => onRejectionReasonChange(e.target.value)}
                    className="min-h-[50px] rounded-lg border-slate-200 text-[12px]"
                  />
                )}
                <Button
                  className="h-11 w-full rounded-xl bg-brand text-[14px] font-semibold hover:bg-brand/90"
                  onClick={onApprove}
                  disabled={actionLoading || selectedProfile.verification_status === "verified"}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Approve</>}
                </Button>
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-xl text-[13px]"
                  onClick={onRequestChanges}
                  disabled={actionLoading}
                >
                  Request Changes
                </Button>
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-xl border-red-200 text-[13px] text-red-600 hover:bg-red-50"
                  onClick={onReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
