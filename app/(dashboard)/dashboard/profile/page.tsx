"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ShieldCheck } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { EditProfileSections } from "@/components/dashboard/edit-profile-sections"

export default function ProfilePage() {
  const { profile, isLoading, fetchProfile, ensureMinimalProfile } = useProfile()
  const [isCreating, setIsCreating] = useState(false)
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    setIsClientReady(true)
  }, [])

  if (isLoading || !isClientReady) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!profile) {
    const handleCreateProfile = async () => {
      setIsCreating(true)
      try {
        await ensureMinimalProfile()
        await fetchProfile()
      } finally {
        setIsCreating(false)
      }
    }

    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-[22px] font-bold text-slate-900">No profile linked yet</h2>
        <p className="text-[14px] text-slate-500">Create a profile to start editing section by section.</p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => fetchProfile()}>
            Refresh profile
          </Button>
          <Button className="flex-1 bg-brand hover:bg-brand-dark" disabled={isCreating} onClick={handleCreateProfile}>
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create profile"}
          </Button>
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard/profile/ai-assist">
            <Sparkles className="mr-2 h-4 w-4" />
            Use AI to build profile
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-brand">
          <Link href="/dashboard/verification">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify skills
          </Link>
        </Button>
      </div>
    )
  }

  return <EditProfileSections profile={profile} />
}
