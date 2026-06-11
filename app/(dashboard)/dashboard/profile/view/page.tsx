"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ShieldCheck } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { CandidateProfileView } from "@/components/dashboard/candidate-profile-view"

export default function ViewProfilePage() {
  const { profile, isLoading, fetchProfile, ensureMinimalProfile } = useProfile()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-[22px] font-bold text-slate-900">Your public profile isn&apos;t ready</h2>
        <p className="text-[14px] text-slate-500">
          Create or refresh your profile, then this page will show how employers see you.
        </p>
        <div className="flex w-full flex-col gap-2">
          <Button className="bg-brand hover:bg-brand-dark" onClick={() => fetchProfile()}>
            Refresh profile
          </Button>
          <Button variant="outline" onClick={async () => { await ensureMinimalProfile(); await fetchProfile() }}>
            Create profile
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/profile/ai-assist">
              <Sparkles className="mr-2 h-4 w-4" />
              Use AI to build profile
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-brand">
            <Link href="/dashboard/verification">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verify skills
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CandidateProfileView profile={profile} />
  )
}
