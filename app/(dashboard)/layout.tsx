"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const sidebarRef = React.useRef<{ openMobileMenu: () => void }>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  const handleMobileMenuToggle = () => {
    sidebarRef.current?.openMobileMenu()
  }

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <div className="dashboard-shell min-h-screen bg-[#F8FAFC] text-slate-900">
        <div className="flex min-h-screen">
          <DashboardSidebar
            ref={sidebarRef}
            onMobileMenuToggle={setIsMobileMenuOpen}
          />
          <div className="flex min-h-screen flex-1 flex-col md:ml-[240px]">
            <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />
            <main className="flex-1 bg-[#F8FAFC] px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
