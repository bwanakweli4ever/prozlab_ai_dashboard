"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { taskApi } from "@/lib/api"
import { dashboardCardClass, dashboardPageSubtitleClass, dashboardPageTitleClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"
import type { NotificationResponse } from "@/types/api"

function timeAgo(value: string): string {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ""
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export default function NotificationsPage() {
  const { token } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()
  const [items, setItems] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      setItems(await taskApi.getProfessionalNotifications(token, false, 50))
    } catch (e) {
      const message = e instanceof Error ? e.message : ""
      // No professional profile yet means there can't be any notifications.
      if (/not found|404/i.test(message)) setItems([])
      else setError("Couldn't load your notifications. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!profileLoading) void load()
  }, [load, profileLoading, profile?.id])

  const markRead = async (item: NotificationResponse) => {
    if (!token || item.is_read) return
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)))
    try {
      await taskApi.markNotificationRead(item.id, token)
    } catch {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: false } : n)))
    }
  }

  const markAllRead = async () => {
    if (!token) return
    setMarkingAll(true)
    const unread = items.filter((n) => !n.is_read)
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await Promise.allSettled(unread.map((n) => taskApi.markNotificationRead(n.id, token)))
    setMarkingAll(false)
  }

  const unreadCount = items.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={cn(dashboardPageTitleClass, "flex items-center gap-2")}>
            <Bell className="h-5 w-5 text-brand" />
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[12px] font-semibold text-white">{unreadCount}</span>
            )}
          </h1>
          <p className={cn("mt-1", dashboardPageSubtitleClass)}>
            Updates about tasks assigned to you and your verification.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0 || markingAll}>
          {markingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <div className={cn(dashboardCardClass, "flex items-center justify-center gap-2 py-16 text-[14px] text-slate-500")}>
          <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications…
        </div>
      ) : error ? (
        <div className={cn(dashboardCardClass, "py-12 text-center")}>
          <p className="text-[14px] text-slate-600">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={cn(dashboardCardClass, "flex flex-col items-center py-16 text-center")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Bell className="h-6 w-6 text-brand" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-slate-900">No notifications yet</p>
          <p className="mt-1 max-w-sm text-[13px] text-slate-500">
            When a task is assigned to you or your verification is reviewed, it shows up here and in your email.
          </p>
          <Link href="/dashboard/profile/ai-assist" className="mt-4 text-[13px] font-semibold text-brand hover:text-brand-dark">
            Finish your profile to get matched →
          </Link>
        </div>
      ) : (
        <ul className={cn(dashboardCardClass, "divide-y divide-slate-100 overflow-hidden")}>
          {items.map((n) => (
            <li key={n.id} className={cn("flex gap-3 px-5 py-4", !n.is_read && "bg-indigo-50/40")}>
              <span
                className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.is_read ? "bg-transparent" : "bg-brand")}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={cn("text-[14px] text-slate-900", !n.is_read && "font-semibold")}>{n.title}</p>
                  <span className="shrink-0 text-[12px] text-slate-400">{timeAgo(n.created_at)}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{n.message}</p>
                <div className="mt-1.5 flex flex-wrap gap-4">
                  {n.task_assignment_id && (
                    <Link
                      href="/dashboard/tasks"
                      onClick={() => void markRead(n)}
                      className="text-[12px] font-semibold text-brand hover:text-brand-dark"
                    >
                      View task →
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => void markRead(n)}
                      className="text-[12px] font-medium text-slate-500 hover:text-slate-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
