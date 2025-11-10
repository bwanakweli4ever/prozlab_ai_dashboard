"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { ProfileView } from "@/components/profile/profile-view"

export default function ViewProfilePage() {
  const router = useRouter()
  const { profile, isLoading } = useProfile()

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push("/onboarding")
    }
  }, [profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">This is how your profile appears to others.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/profile")}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <ProfileView profile={profile} />
    </div>
  )
}
