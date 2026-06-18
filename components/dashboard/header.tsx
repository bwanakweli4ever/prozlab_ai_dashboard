"use client"

import { Bell, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void
  isAdmin?: boolean
}

export function DashboardHeader({ onMobileMenuToggle, isAdmin = false }: DashboardHeaderProps) {
  const { user } = useAuth()
  const { profile } = useProfile()

  const userInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"
  const userName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "User"
  const avatarUrl = profile?.profile_image_url || undefined

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white px-4 md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="mr-auto text-slate-600 hover:bg-slate-100 md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open Menu</span>
      </Button>

      {isAdmin ? (
        <AdminNotificationBell />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-slate-600 hover:bg-slate-100"
          onClick={() => (window.location.href = "/dashboard/notifications")}
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="sr-only">Notifications</span>
        </Button>
      )}

      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="text-[13px] font-semibold leading-tight text-slate-900">{userName}</p>
          <p className="text-[11px] text-slate-500">{isAdmin ? "Administrator" : "Candidate"}</p>
        </div>
      </div>
    </header>
  )
}
