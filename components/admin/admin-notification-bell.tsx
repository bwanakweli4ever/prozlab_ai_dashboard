"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Briefcase, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { taskApi } from "@/lib/api"

const SEEN_KEY = "prozlab_admin_notifications_seen_at"

export type AdminNotification = {
  id: string
  type: string
  title: string
  company_name: string
  client_name: string
  client_email: string
  status: string
  priority: string
  created_at: string
}

export function AdminNotificationBell() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [seenAt, setSeenAt] = useState<string | null>(null)

  useEffect(() => {
    setSeenAt(localStorage.getItem(SEEN_KEY))
  }, [])

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await taskApi.getAdminNotifications(token, 25)
      setNotifications(data.notifications || [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const unreadCount = notifications.filter((n) => {
    if (!seenAt || !n.created_at) return true
    return new Date(n.created_at) > new Date(seenAt)
  }).length

  const markSeen = () => {
    const now = new Date().toISOString()
    localStorage.setItem(SEEN_KEY, now)
    setSeenAt(now)
  }

  const formatWhen = (iso: string) => {
    try {
      const d = new Date(iso)
      const diff = Date.now() - d.getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return "Just now"
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      return d.toLocaleDateString()
    } catch {
      return ""
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) markSeen()
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-slate-600 hover:bg-slate-100"
          aria-label="Admin notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Service requests</span>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-[13px] text-slate-500">No recent requests</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer items-start py-2.5">
              <Link href={`/admin/tasks?requestId=${n.id}`}>
                <div className="flex w-full gap-2">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-900">{n.title}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {n.company_name} · {n.client_name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{formatWhen(n.created_at)}</p>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/tasks" className="w-full justify-center text-center text-[13px] font-medium text-brand">
            View all requests
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
