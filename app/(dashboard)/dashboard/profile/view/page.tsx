"use client"

import Link from "next/link"
import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, Loader2, Pencil, ShieldCheck, Sparkles } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { CandidateProfileView } from "@/components/dashboard/candidate-profile-view"
import {
  EditProfileSections,
  type SectionId,
} from "@/components/dashboard/edit-profile-sections"

const SECTION_IDS: SectionId[] = ["personal", "summary", "experience", "education", "contact"]

function parseSection(value: string | null): SectionId {
  if (value && SECTION_IDS.includes(value as SectionId)) {
    return value as SectionId
  }
  return "personal"
}

export default function ViewProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, isLoading, fetchProfile, ensureMinimalProfile } = useProfile()

  const isEditing = searchParams.get("edit") === "1" || searchParams.get("edit") === "true"
  const activeSection = useMemo(
    () => parseSection(searchParams.get("section")),
    [searchParams]
  )

  const openEdit = useCallback(
    (section?: SectionId) => {
      const params = new URLSearchParams()
      params.set("edit", "1")
      if (section) params.set("section", section)
      router.push(`/dashboard/profile/view?${params.toString()}`)
    },
    [router]
  )

  const closeEdit = useCallback(() => {
    router.push("/dashboard/profile/view")
  }, [router])

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
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            {isEditing ? "Edit Profile" : "Your Profile"}
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            {isEditing
              ? "Update your details section by section, then preview how employers see you."
              : "This is your public profile preview. Employers see this when evaluating you."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <Button variant="outline" onClick={closeEdit}>
              <Eye className="mr-2 h-4 w-4" />
              Preview profile
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/profile/ai-assist">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI assist
                </Link>
              </Button>
              <Button className="bg-brand hover:bg-brand-dark" onClick={() => openEdit()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit profile
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <EditProfileSections
          profile={profile}
          initialSection={activeSection}
          onPreview={closeEdit}
        />
      ) : (
        <CandidateProfileView profile={profile} onEdit={openEdit} />
      )}
    </div>
  )
}
