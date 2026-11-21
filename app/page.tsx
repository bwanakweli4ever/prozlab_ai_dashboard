"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ItServicesLandingPage } from "@/components/it-services-landing-page"

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user?.is_superuser ? "/admin" : "/dashboard")
    }
  }, [isAuthenticated, isLoading, router, user])

  return <ItServicesLandingPage />
}
