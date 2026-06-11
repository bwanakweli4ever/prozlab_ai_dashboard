"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, emailApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  TalentVerificationBoard,
  type ReviewChecklist,
  type TalentProfile,
} from "@/components/admin/talent-verification-board"

function normalizeProfile(p: Record<string, unknown>): TalentProfile {
  return {
    id: String(p.id),
    first_name: String(p.first_name ?? ""),
    last_name: String(p.last_name ?? ""),
    email: String(p.email ?? ""),
    bio: p.bio as string | undefined,
    location: p.location as string | undefined,
    years_experience: Number(p.years_experience ?? 0),
    hourly_rate: Number(p.hourly_rate ?? p.hourlyRate ?? 0),
    availability: String(p.availability ?? p.availability_status ?? ""),
    verification_status: (p.verification_status as TalentProfile["verification_status"]) ?? "pending",
    created_at: String(p.created_at ?? new Date().toISOString()),
    updated_at: p.updated_at as string | undefined,
    profile_image_url: p.profile_image_url as string | undefined,
    education: p.education as string | undefined,
    certifications: p.certifications as string | undefined,
    website: p.website as string | undefined,
    linkedin: p.linkedin as string | undefined,
    phone: p.phone_number as string | undefined,
    specialties: Array.isArray(p.specialties) ? (p.specialties as string[]) : [],
    rating: typeof p.rating === "number" ? p.rating : undefined,
    review_count: Number(p.review_count ?? 0),
    skill_verification_status: p.skill_verification_status as string | undefined,
    verification_score: typeof p.verification_score === "number" ? p.verification_score : undefined,
  }
}

function needsMoreInfo(p: TalentProfile) {
  return (
    p.verification_status === "pending" &&
    (!p.bio || p.bio.length < 40 || (!p.website && !p.linkedin) || p.skill_verification_status === "needs_revision")
  )
}

function matchScore(p: TalentProfile): number {
  if (p.verification_score != null) return p.verification_score
  let score = 40
  if (p.rating) score += Math.min(p.rating * 12, 30)
  if (p.years_experience) score += Math.min(p.years_experience * 2, 16)
  if (p.website || p.linkedin) score += 8
  if (p.bio && p.bio.length > 80) score += 6
  if (p.skill_verification_status === "verified") score += 10
  return Math.min(Math.round(score), 99)
}

const PAGE_SIZE = 12

export default function AdminVerificationsPage() {
  const { token, user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [allProfiles, setAllProfiles] = useState<TalentProfile[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [professionFilter, setProfessionFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewChecklist, setReviewChecklist] = useState<ReviewChecklist>({
    identity: false,
    portfolio: false,
    assessment: false,
    experience: false,
    references: false,
  })
  const [reviewScore, setReviewScore] = useState(0)
  const [aiSummary, setAiSummary] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const loadProfiles = useCallback(async () => {
    if (authLoading) return
    if (!token || !user?.is_superuser) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await adminApi.getAllProfilesForVerification(token)
      setAllProfiles(list.map((p: Record<string, unknown>) => normalizeProfile(p)))
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load candidates"
      toast({ title: "Could not load candidates", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [authLoading, token, user, toast])

  useEffect(() => {
    if (authLoading) return
    loadProfiles()
  }, [authLoading, loadProfiles])

  const stats = useMemo(() => {
    const pending = allProfiles.filter((p) => p.verification_status === "pending").length
    const approved = allProfiles.filter((p) => p.verification_status === "verified").length
    const rejected = allProfiles.filter((p) => p.verification_status === "rejected").length
    const needMoreInfo = allProfiles.filter(needsMoreInfo).length
    const topRated = allProfiles.filter((p) => (p.rating ?? 0) >= 4 || matchScore(p) >= 85).length
    const total = allProfiles.length || 1
    const verificationRate = Math.round((approved / total) * 100)
    return { pending, approved, rejected, needMoreInfo, topRated, verificationRate }
  }, [allProfiles])

  const professions = useMemo(() => {
    const set = new Set<string>()
    allProfiles.forEach((p) => p.specialties?.forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [allProfiles])

  const filteredProfiles = useMemo(() => {
    let list = [...allProfiles]

    if (activeTab === "pending") list = list.filter((p) => p.verification_status === "pending")
    else if (activeTab === "verified") list = list.filter((p) => p.verification_status === "verified")
    else if (activeTab === "all") list = list
    else if (activeTab === "rejected") list = list.filter((p) => p.verification_status === "rejected")
    else if (activeTab === "need_more") list = list.filter(needsMoreInfo)
    else if (activeTab === "top_rated") list = list.filter((p) => (p.rating ?? 0) >= 4 || matchScore(p) >= 85)

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q) ||
          p.specialties?.some((s) => s.toLowerCase().includes(q))
      )
    }

    if (professionFilter !== "all") {
      list = list.filter((p) => p.specialties?.includes(professionFilter))
    }

    if (experienceFilter !== "all") {
      list = list.filter((p) => {
        const y = p.years_experience ?? 0
        if (experienceFilter === "0-2") return y <= 2
        if (experienceFilter === "3-5") return y >= 3 && y <= 5
        if (experienceFilter === "6-10") return y >= 6 && y <= 10
        if (experienceFilter === "10+") return y > 10
        return true
      })
    }

    if (availabilityFilter === "available") {
      list = list.filter((p) => /available|open|full/i.test(p.availability ?? ""))
    } else if (availabilityFilter === "busy") {
      list = list.filter((p) => p.availability && !/available|open/i.test(p.availability))
    }

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === "score") return matchScore(b) - matchScore(a)
      if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0)
      return 0
    })

    return list
  }, [allProfiles, activeTab, search, professionFilter, experienceFilter, availabilityFilter, sortBy])

  const totalFiltered = filteredProfiles.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))

  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredProfiles.slice(start, start + PAGE_SIZE)
  }, [filteredProfiles, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, search, professionFilter, experienceFilter, availabilityFilter, sortBy])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openReview = async (profile: TalentProfile) => {
    setSelectedProfile(profile)
    setAdminNotes("")
    setRejectionReason("")
    setReviewLoading(true)

    let enriched = profile
    if (token) {
      try {
        const full = await adminApi.getProfileForVerification(profile.id, token)
        enriched = normalizeProfile({ ...profile, ...full })
        setSelectedProfile(enriched)
      } catch {
        /* use list data */
      }

      try {
        const skill = await adminApi.getSkillVerificationDetail(profile.id, token)
        enriched = {
          ...enriched,
          skill_verification_status: skill.profile.skill_verification_status,
          verification_score: skill.profile.verification_score,
        }
        setSelectedProfile(enriched)

        const hasIdentity = skill.evidences.some((e) =>
          ["github", "linkedin", "identity_document"].includes(e.type)
        )
        const hasPortfolio = skill.evidences.some((e) =>
          ["portfolio", "work_sample", "github"].includes(e.type)
        ) || !!(enriched.website || enriched.linkedin)
        const hasAssessment = ["verified", "pending_review"].includes(skill.profile.skill_verification_status)
        const hasExperience = (enriched.years_experience ?? 0) > 0 || skill.evidences.some((e) => e.type === "previous_employer")
        const hasRefs = skill.evidences.some((e) => e.type === "recommendation")

        setReviewChecklist({
          identity: hasIdentity,
          portfolio: hasPortfolio,
          assessment: hasAssessment,
          experience: hasExperience,
          references: hasRefs,
        })
        setReviewScore(skill.profile.verification_score || matchScore(enriched))

        const summary: string[] = []
        if (hasPortfolio) summary.push("Portfolio appears authentic")
        if (enriched.linkedin) summary.push("LinkedIn profile linked")
        if (enriched.website) summary.push("Personal website provided")
        if (skill.profile.verification_score >= 70) summary.push(`Verification score: ${skill.profile.verification_score}%`)
        if ((enriched.years_experience ?? 0) >= 3) summary.push(`${enriched.years_experience} years experience listed`)
        setAiSummary(summary.length ? summary : ["Limited automated signals — manual review recommended"])
      } catch {
        setReviewChecklist({
          identity: !!(enriched.linkedin),
          portfolio: !!(enriched.website || enriched.linkedin),
          assessment: enriched.skill_verification_status === "verified",
          experience: (enriched.years_experience ?? 0) > 0,
          references: false,
        })
        setReviewScore(matchScore(enriched))
        setAiSummary(["Skill verification data unavailable — review profile manually"])
      }
    }

    setReviewLoading(false)
  }

  const runAction = async (status: "verified" | "rejected" | "pending") => {
    if (!token || !selectedProfile) return
    if (status === "rejected" && !rejectionReason.trim()) {
      toast({ title: "Reason required", description: "Add a rejection reason", variant: "destructive" })
      return
    }

    setActionLoading(true)
    try {
      const result = await adminApi.verifyProfile(
        selectedProfile.id,
        status,
        token,
        adminNotes || undefined,
        status === "rejected" ? rejectionReason : undefined
      )

      if (result?.isNetworkError) {
        toast({ title: "Offline mode", description: "Updated locally" })
      } else {
        toast({
          title: status === "verified" ? "Approved" : status === "rejected" ? "Rejected" : "Changes requested",
        })
      }

      try {
        await emailApi.sendVerificationNotification(
          selectedProfile.email,
          selectedProfile.first_name,
          selectedProfile.last_name,
          status === "verified" ? "verified" : status === "rejected" ? "rejected" : "pending",
          adminNotes || undefined,
          status === "rejected" ? rejectionReason : undefined
        )
      } catch {
        /* non-blocking */
      }

      setSelectedProfile(null)
      await loadProfiles()
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  if (!user?.is_superuser && !loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        Superuser access required.
      </div>
    )
  }

  return (
    <TalentVerificationBoard
      profiles={paginatedProfiles}
      totalFiltered={totalFiltered}
      totalLoaded={allProfiles.length}
      page={currentPage}
      pageSize={PAGE_SIZE}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      loading={loading || authLoading}
      stats={stats}
      search={search}
      onSearchChange={setSearch}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      professionFilter={professionFilter}
      onProfessionFilterChange={setProfessionFilter}
      experienceFilter={experienceFilter}
      onExperienceFilterChange={setExperienceFilter}
      availabilityFilter={availabilityFilter}
      onAvailabilityFilterChange={setAvailabilityFilter}
      sortBy={sortBy}
      onSortChange={setSortBy}
      professions={professions}
      selectedProfile={selectedProfile}
      reviewLoading={reviewLoading}
      reviewChecklist={reviewChecklist}
      reviewScore={reviewScore}
      aiSummary={aiSummary}
      onSelectReview={openReview}
      onCloseReview={() => setSelectedProfile(null)}
      onApprove={() => runAction("verified")}
      onReject={() => runAction("rejected")}
      onRequestChanges={() => runAction("pending")}
      actionLoading={actionLoading}
      adminNotes={adminNotes}
      onAdminNotesChange={setAdminNotes}
      rejectionReason={rejectionReason}
      onRejectionReasonChange={setRejectionReason}
    />
  )
}
