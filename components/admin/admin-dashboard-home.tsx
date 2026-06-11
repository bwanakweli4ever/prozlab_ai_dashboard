"use client"

import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Filter,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

export interface DashboardProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  location?: string
  verification_status: string
  profile_image_url?: string
  specialties?: string[]
  rating?: number
  created_at: string
}

interface AdminDashboardHomeProps {
  adminName: string
  stats: {
    totalProfiles: number
    verifiedProfiles: number
    pendingVerifications: number
    rejectedProfiles: number
    profilesThisWeek: number
    verificationsThisWeek: number
    pendingSkillReviews: number
    verifiedSkills: number
    totalRequests: number
    completedRequests: number
    activeProfessionals: number
    fraudAlerts: number
    approvalRate: number
  }
  recentProfiles: DashboardProfile[]
  topProfessions: { name: string; count: number }[]
  userGrowth: { day: string; current: number; previous: number }[]
  requestTrends: { day: string; total: number; completed: number }[]
  loading?: boolean
}

const BRAND = "#6366F1"

function MiniRing({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BRAND} strokeWidth={4} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">{value}%</span>
    </div>
  )
}

function statusStyle(status: string) {
  if (status === "verified") return "bg-emerald-100 text-emerald-700"
  if (status === "rejected") return "bg-red-100 text-red-700"
  if (status === "pending") return "bg-amber-100 text-amber-800"
  return "bg-sky-100 text-sky-700"
}

function daysAgo(d: string) {
  const n = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  return n <= 0 ? "Today" : n === 1 ? "1 day ago" : `${n} days ago`
}

function completionScore(p: DashboardProfile) {
  let s = 50
  if (p.verification_status === "verified") s += 30
  if (p.rating) s += Math.min(p.rating * 8, 20)
  if (p.location) s += 5
  return Math.min(Math.round(s), 99)
}

export function AdminDashboardHome({
  adminName,
  stats,
  recentProfiles,
  topProfessions,
  userGrowth,
  requestTrends,
  loading,
}: AdminDashboardHomeProps) {
  const verificationPie = [
    { name: "Verified", value: stats.verifiedProfiles, color: "#10B981" },
    { name: "In Review", value: stats.pendingSkillReviews, color: "#6366F1" },
    { name: "Pending", value: stats.pendingVerifications, color: "#F59E0B" },
    { name: "Rejected", value: stats.rejectedProfiles, color: "#EF4444" },
  ].filter((x) => x.value > 0)

  const kpis = [
    {
      label: "Total Users",
      value: stats.totalProfiles,
      delta: `+${stats.profilesThisWeek} this week`,
      gradient: true,
      icon: Users,
    },
    {
      label: "Active Professionals",
      value: stats.activeProfessionals || stats.verifiedProfiles,
      delta: `${stats.verifiedProfiles} verified`,
      icon: BadgeCheck,
    },
    {
      label: "Total Requests",
      value: stats.totalRequests,
      delta: `${stats.completedRequests} completed`,
      icon: Briefcase,
    },
    {
      label: "Pending Assessments",
      value: stats.pendingSkillReviews,
      delta: `${stats.verifiedSkills} approved`,
      icon: ClipboardList,
    },
    {
      label: "Platform Health",
      value: stats.fraudAlerts === 0 ? "Excellent" : "Review",
      delta: stats.fraudAlerts === 0 ? "All systems running" : `${stats.fraudAlerts} fraud alerts`,
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome bar */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <span>👋 Welcome back, {adminName}</span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System Online
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            A real-time overview of your ProzLab platform performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-slate-200 bg-white text-[12px]">
            <Calendar className="h-3.5 w-3.5" />
            Last 7 days
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search anything..." className="h-9 w-48 rounded-lg border-slate-200 bg-white pl-9 text-[12px] lg:w-56" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-slate-200 bg-white">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={cn(
              "rounded-2xl border p-4 shadow-sm",
              k.gradient
                ? "border-transparent bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white"
                : "border-slate-200/80 bg-white"
            )}
          >
            <div className="flex items-start justify-between">
              <p className={cn("text-[12px] font-medium", k.gradient ? "text-white/80" : "text-slate-500")}>{k.label}</p>
              <k.icon className={cn("h-4 w-4", k.gradient ? "text-white/70" : "text-slate-400")} />
            </div>
            <p className={cn("mt-2 text-[26px] font-bold leading-none", k.gradient ? "text-white" : "text-slate-900")}>
              {loading ? "—" : k.value}
            </p>
            <p className={cn("mt-1.5 flex items-center gap-1 text-[11px]", k.gradient ? "text-white/70" : "text-slate-400")}>
              <ArrowUpRight className="h-3 w-3" />
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-slate-900">User Growth</p>
            <span className="text-[11px] text-slate-400">This week vs last</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="current" stroke={BRAND} fill="url(#growthFill)" strokeWidth={2} name="This week" />
                <Line type="monotone" dataKey="previous" stroke="#CBD5E1" strokeDasharray="4 4" dot={false} name="Last week" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-3">
          <p className="mb-2 text-[14px] font-semibold text-slate-900">Verification Status</p>
          <div className="flex items-center gap-4">
            <div className="h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={verificationPie} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {verificationPie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {verificationPie.map((e) => (
                <div key={e.name} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  <span className="text-slate-600">{e.name}</span>
                  <span className="font-semibold text-slate-900">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-4">
          <p className="mb-3 text-[14px] font-semibold text-slate-900">Quick Stats</p>
          <div className="space-y-3">
            {[
              { label: "Avg. Verification Time", value: "2.4 min" },
              { label: "Approval Rate", value: `${stats.approvalRate}%` },
              { label: "Active Assessments", value: String(stats.pendingSkillReviews + stats.verifiedSkills) },
              { label: "Fraud Alerts", value: String(stats.fraudAlerts) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                <span className="text-[13px] text-slate-500">{row.label}</span>
                <span className="text-[14px] font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[14px] font-semibold text-slate-900">Revenue Trends</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="current" stroke={BRAND} strokeWidth={2} name="Profiles" dot={false} />
                <Line type="monotone" dataKey="previous" stroke="#10B981" strokeWidth={2} name="Verified" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[14px] font-semibold text-slate-900">Request Trends</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#C7D2FE" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill={BRAND} radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[14px] font-semibold text-slate-900">Top Professions</p>
          <div className="space-y-2.5">
            {topProfessions.slice(0, 5).map((p, i) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-4 text-[11px] font-medium text-slate-400">{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-0.5 flex justify-between text-[12px]">
                    <span className="text-slate-700">{p.name}</span>
                    <span className="font-medium text-slate-900">{p.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${Math.min(100, (p.count / (topProfessions[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topProfessions.length === 0 && (
              <p className="text-[12px] text-slate-400">No profession data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-slate-900">Recent Professionals</p>
            <Link href="/admin/verifications" className="text-[12px] font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-medium">Professional</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-center">Complete</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProfiles.slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={p.profile_image_url} />
                          <AvatarFallback className="text-[11px]">{p.first_name?.[0]}{p.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{p.first_name} {p.last_name}</p>
                          <p className="text-[11px] text-slate-400">{p.specialties?.[0] || "Professional"} · {daysAgo(p.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{p.location || "—"}</td>
                    <td className="py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusStyle(p.verification_status))}>
                        {p.verification_status === "pending" ? "Pending" : p.verification_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        <MiniRing value={completionScore(p)} />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Link href="/admin/verifications" className="text-[12px] font-medium text-brand hover:underline">
                        {p.verification_status === "pending" ? "Review" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentProfiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No professionals yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-brand" /> AI Insights
            </p>
            <div className="space-y-2">
              {[
                `Verification speed improved — ${stats.verificationsThisWeek} reviews this week`,
                `${stats.approvalRate}% approval rate across all profiles`,
                stats.pendingVerifications > 0
                  ? `${stats.pendingVerifications} profiles awaiting your review`
                  : "No pending profile reviews right now",
              ].map((text, i) => (
                <div key={i} className="rounded-xl bg-sky-50 px-3 py-2.5 text-[12px] text-sky-900">
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="mb-3 text-[14px] font-semibold text-slate-900">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Review Verifications", href: "/admin/verifications", icon: CheckCircle2, color: "bg-brand/10 text-brand" },
                { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-emerald-50 text-emerald-600" },
                { label: "Assessments", href: "/admin/assessments", icon: ClipboardList, color: "bg-violet-50 text-violet-600" },
                { label: "Fraud Detection", href: "/admin/fraud", icon: ShieldCheck, color: "bg-amber-50 text-amber-600" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-brand/30 hover:bg-white"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", a.color)}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-[11px] font-medium text-slate-700">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
