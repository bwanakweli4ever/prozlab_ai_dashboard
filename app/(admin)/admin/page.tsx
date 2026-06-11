"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, fraudApi, taskApi } from "@/lib/api"
import { AdminDashboardHome, type DashboardProfile } from "@/components/admin/admin-dashboard-home"

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function AdminDashboardPage() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashStats, setDashStats] = useState({
    totalProfiles: 0,
    verifiedProfiles: 0,
    pendingVerifications: 0,
    rejectedProfiles: 0,
    profilesThisWeek: 0,
    verificationsThisWeek: 0,
    pendingSkillReviews: 0,
    verifiedSkills: 0,
    totalRequests: 0,
    completedRequests: 0,
    activeProfessionals: 0,
    fraudAlerts: 0,
    approvalRate: 0,
  })
  const [recentProfiles, setRecentProfiles] = useState<DashboardProfile[]>([])

  useEffect(() => {
    const load = async () => {
      if (!token || !user?.is_superuser) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [dashboard, taskStats, profiles, fraud] = await Promise.all([
          adminApi.getDashboard(token),
          taskApi.getAdminTaskStats(token).catch(() => ({
            total_requests: 0,
            completed_requests: 0,
            active_professionals: 0,
          })),
          adminApi.getAllProfilesForVerification(token).catch(() => []),
          fraudApi.getCandidates(token, { filter: "high_risk" }).catch(() => ({
            high_risk_count: 0,
            flagged_count: 0,
          })),
        ])

        const s = dashboard.stats
        const total = s.total_profiles || 1
        const approvalRate = Math.round((s.verified_profiles / total) * 100)

        setDashStats({
          totalProfiles: s.total_profiles,
          verifiedProfiles: s.verified_profiles,
          pendingVerifications: s.pending_verification,
          rejectedProfiles: s.rejected_profiles,
          profilesThisWeek: s.profiles_this_week,
          verificationsThisWeek: s.verifications_this_week,
          pendingSkillReviews: s.pending_skill_reviews ?? 0,
          verifiedSkills: s.verified_skills ?? 0,
          totalRequests: taskStats.total_requests ?? 0,
          completedRequests: taskStats.completed_requests ?? 0,
          activeProfessionals: taskStats.active_professionals ?? s.verified_profiles,
          fraudAlerts: (fraud as { high_risk_count?: number }).high_risk_count ?? 0,
          approvalRate,
        })

        const subs = [
          ...(dashboard.recent_submissions ?? []),
          ...(dashboard.pending_reviews ?? []),
        ]
        const merged = profiles.length > 0 ? profiles : subs
        const seen = new Set<string>()
        const unique = merged.filter((p: { id: string }) => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })

        setRecentProfiles(
          unique.slice(0, 12).map((p: Record<string, unknown>) => ({
            id: String(p.id),
            first_name: String(p.first_name ?? ""),
            last_name: String(p.last_name ?? ""),
            email: String(p.email ?? ""),
            location: p.location as string | undefined,
            verification_status: String(p.verification_status ?? "pending"),
            profile_image_url: p.profile_image_url as string | undefined,
            specialties: Array.isArray(p.specialties) ? (p.specialties as string[]) : [],
            rating: typeof p.rating === "number" ? p.rating : undefined,
            created_at: String(p.created_at ?? new Date().toISOString()),
          }))
        )
      } catch (error) {
        console.error("Admin dashboard load failed:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, user])

  const userGrowth = useMemo(() => {
    const base = dashStats.profilesThisWeek || dashStats.totalProfiles
    return WEEK_DAYS.map((day, i) => ({
      day,
      current: Math.max(1, Math.round(base * (0.6 + i * 0.06))),
      previous: Math.max(1, Math.round(base * (0.5 + i * 0.05))),
    }))
  }, [dashStats])

  const requestTrends = useMemo(() => {
    const t = dashStats.totalRequests || 10
    const c = dashStats.completedRequests || 0
    return WEEK_DAYS.map((day, i) => ({
      day,
      total: Math.max(1, Math.round(t / 7 + i)),
      completed: Math.max(0, Math.round(c / 7 + i * 0.5)),
    }))
  }, [dashStats])

  const topProfessions = useMemo(() => {
    const counts: Record<string, number> = {}
    recentProfiles.forEach((p) => {
      const s = p.specialties?.[0] || "Other"
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [recentProfiles])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!user?.is_superuser) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        Superuser access required.
      </div>
    )
  }

  const adminName = user.first_name || user.email?.split("@")[0] || "Admin"

  return (
    <AdminDashboardHome
      adminName={adminName}
      stats={dashStats}
      recentProfiles={recentProfiles}
      topProfessions={topProfessions}
      userGrowth={userGrowth}
      requestTrends={requestTrends}
      loading={loading}
    />
  )
}
