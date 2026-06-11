"use client"

import { useSearchParams } from "next/navigation"
import { CandidateHome } from "@/components/dashboard/candidate-home"
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics"
import { useProfile } from "@/contexts/profile-context"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const { isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (tab === "analytics") {
    return <DashboardAnalytics />
  }

  return <CandidateHome />
}
