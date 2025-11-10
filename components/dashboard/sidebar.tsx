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
  Menu,
  UserCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckSquare,
  Briefcase,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isAdmin?: boolean
  onMobileMenuToggle?: (isOpen: boolean) => void
}

export const DashboardSidebar = React.forwardRef<
  { openMobileMenu: () => void },
  SidebarProps
>(({ isAdmin = false, onMobileMenuToggle }, ref) => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Function to open mobile menu from external trigger
  const openMobileMenu = React.useCallback(() => {
    setIsMobileOpen(true)
    onMobileMenuToggle?.(true)
  }, [onMobileMenuToggle])

  // Expose the open function to parent components
  React.useImperativeHandle(ref, () => ({
    openMobileMenu
  }), [openMobileMenu])

  const navItems = isAdmin
    ? [
        {
          title: "Dashboard",
          href: "/admin",
          icon: Home,
        },
        {
          title: "Verifications",
          href: "/admin/verifications",
          icon: ClipboardList,
        },
        {
          title: "Task Management",
          href: "/admin/tasks",
          icon: Briefcase,
        },
        {
          title: "Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
        },
      ]
    : [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: Home,
        },
        {
          title: "Profile",
          href: "/dashboard/profile/view",
          icon: UserCircle,
        },
        {
          title: "Edit Profile",
          href: "/dashboard/profile",
          icon: Edit,
        },
        {
          title: "Tasks",
          href: "/dashboard/tasks",
          icon: CheckSquare,
        },
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileOpen(false)
    onMobileMenuToggle?.(false)
  }, [pathname, onMobileMenuToggle])

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => {
        setIsMobileOpen(open)
        onMobileMenuToggle?.(open)
      }}>
        <SheetContent side="left" className="w-64 p-0 bg-background">
          <SheetHeader className="p-4 border-b bg-prozlab-red-10">
            <SheetTitle className="flex items-center">
              <ProzLabLogo size="sm" />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full py-4">
            <div className="px-4 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="px-4 mt-auto">
              <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out",
          isOpen ? "md:w-64" : "md:w-20",
        )}
      >
        <div className="flex flex-col flex-grow border-r bg-background">
          <div className="flex items-center h-16 px-4 border-b justify-between bg-prozlab-red-10">
            {isOpen ? (
              <>
                <div className="flex items-center">
                  <ProzLabLogo size="sm" />
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mx-auto">
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-col flex-1 py-4">
            <div className="px-4 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn("w-full", isOpen ? "justify-start" : "justify-center px-0")}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && <span>{item.title}</span>}
                  </Link>
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="px-4 mt-auto">
              <Button
                variant="ghost"
                className={cn("w-full", isOpen ? "justify-start" : "justify-center px-0")}
                onClick={logout}
              >
                <LogOut className={cn("h-4 w-4", isOpen && "mr-2")} />
                {isOpen && "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

DashboardSidebar.displayName = "DashboardSidebar"
