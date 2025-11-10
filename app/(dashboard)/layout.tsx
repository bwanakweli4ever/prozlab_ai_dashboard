"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  const handleMobileMenuToggle = () => {
    sidebarRef.current?.openMobileMenu()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <DashboardSidebar 
          ref={sidebarRef}
          onMobileMenuToggle={setIsMobileMenuOpen} 
        />
        <div className="flex flex-1 flex-col md:ml-64">
          <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />
          <main className="flex-1 px-4 md:px-6 py-4 pt-0">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
