"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"

export function DashboardAnalytics() {
  const { profile, calculateProfileCompletion } = useProfile()
  const { percentage } = calculateProfileCompletion()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="text-[24px] font-bold text-slate-900">Profile Analytics</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[14px] text-slate-600">
          Profile completion: <strong className="text-brand">{percentage}%</strong>
        </p>
        {profile && (
          <ul className="mt-4 space-y-2 text-[13px] text-slate-700">
            <li>Profile views: {profile.profile_views ?? 0}</li>
            <li>Rating: {profile.rating?.toFixed(1) ?? "N/A"}</li>
            <li>Verification: {profile.verification_status}</li>
          </ul>
        )}
      </div>
    </div>
  )
}
