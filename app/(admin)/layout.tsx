"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const sidebarRef = React.useRef<{ openMobileMenu: () => void }>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/")
      } else if (!user?.is_superuser) {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isAuthenticated || !user?.is_superuser) {
    return null // Will redirect in useEffect
  }

  const handleMobileMenuToggle = () => {
    sidebarRef.current?.openMobileMenu()
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        ref={sidebarRef}
        isAdmin={true} 
        onMobileMenuToggle={setIsMobileMenuOpen}
      />
      <div className="flex flex-1 flex-col md:ml-64">
        <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="flex-1 overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8 pt-0 pb-4">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
