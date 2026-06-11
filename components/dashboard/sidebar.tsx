"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  UserCircle,
  Edit,
  Bell,
  CheckSquare,
  Briefcase,
  MessageSquare,
  FileText,
  Sparkles,
  Wand2,
  ShieldCheck,
} from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isAdmin?: boolean
  onMobileMenuToggle?: (isOpen: boolean) => void
}

function NavLink({
  href,
  icon: Icon,
  title,
  active,
  badge,
  onClick,
}: {
  href: string
  icon: React.ElementType
  title: string
  active: boolean
  badge?: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.75]" />
      <span className="flex-1">{title}</span>
      {badge && (
        <span className="rounded-md bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}

export const DashboardSidebar = React.forwardRef<
  { openMobileMenu: () => void },
  SidebarProps
>(({ isAdmin = false, onMobileMenuToggle }, ref) => {
  const { logout } = useAuth()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const openMobileMenu = React.useCallback(() => {
    setIsMobileOpen(true)
    onMobileMenuToggle?.(true)
  }, [onMobileMenuToggle])

  React.useImperativeHandle(ref, () => ({ openMobileMenu }), [openMobileMenu])

  const navItems = isAdmin
    ? [
        { title: "Dashboard", href: "/admin", icon: Home },
        { title: "Talent Verification", href: "/admin/verifications", icon: FileText },
        { title: "Assessments", href: "/admin/assessments", icon: ClipboardList, badge: "New" },
        { title: "Fraud Detection", href: "/admin/fraud", icon: ShieldCheck },
        { title: "Task Management", href: "/admin/tasks", icon: Briefcase },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Settings", href: "/admin/settings", icon: Settings },
      ]
    : [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Profile", href: "/dashboard/profile/view", icon: UserCircle },
        { title: "Edit Profile", href: "/dashboard/profile", icon: Edit },
        { title: "AI Assist", href: "/dashboard/profile/ai-assist", icon: Wand2, badge: "New" },
        { title: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
        { title: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
        { title: "Applications", href: "/dashboard/tasks", icon: FileText },
        { title: "Messages", href: "/dashboard/notifications", icon: MessageSquare },
        { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { title: "Settings", href: "/dashboard/settings", icon: Settings },
      ]

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    setIsMobileOpen(false)
    onMobileMenuToggle?.(false)
  }, [pathname, onMobileMenuToggle])

  const sidebarBody = (onNavClick?: () => void) => (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={`${item.href}-${item.title}`}
            href={item.href}
            icon={item.icon}
            title={item.title}
            badge={"badge" in item ? (item as { badge?: string }).badge : undefined}
            active={isActive(item.href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {!isAdmin && (
        <div className="mx-3 mb-3 rounded-xl border border-brand/15 bg-gradient-to-br from-brand/5 to-indigo-50 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="text-[12px] font-semibold text-slate-900">Boost your visibility</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                Stand out to top employers with a boosted profile.
              </p>
              <button type="button" className="mt-2 text-[11px] font-semibold text-brand hover:text-brand-dark">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 px-3 py-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Sheet
        open={isMobileOpen}
        onOpenChange={(open) => {
          setIsMobileOpen(open)
          onMobileMenuToggle?.(open)
        }}
      >
        <SheetContent side="left" className="w-[260px] border-slate-200 bg-white p-0">
          <SheetHeader className="border-b border-slate-100 px-5 py-4">
            <SheetTitle>
              <ProzLabLogo size="sm" />
            </SheetTitle>
          </SheetHeader>
          {sidebarBody(() => setIsMobileOpen(false))}
        </SheetContent>
      </Sheet>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <ProzLabLogo size="md" />
        </div>
        {sidebarBody()}
      </aside>
    </>
  )
})

DashboardSidebar.displayName = "DashboardSidebar"
