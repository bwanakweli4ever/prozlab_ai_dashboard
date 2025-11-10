"use client"

import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning"
  read: boolean
  time: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "1", title: "Welcome to ProzLab", message: "Your account was created successfully.", type: "success", read: false, time: "2m" },
    { id: "2", title: "Profile Incomplete", message: "Add more details to get better matches.", type: "warning", read: false, time: "1h" },
    { id: "3", title: "New Feature", message: "You can now save favorite jobs.", type: "info", read: true, time: "1d" },
  ])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>Mark all as read</Button>
      </div>

      <div className="grid gap-4">
        {notifications.map((n) => (
          <Card key={n.id} className={n.read ? "opacity-80" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {n.type === "success" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {n.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                {n.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
                {n.title}
                <span className="ml-auto text-xs text-muted-foreground">{n.time}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{n.message}</p>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 border rounded-lg">
            <Bell className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">You're all caught up. No notifications right now.</p>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Manage preferences in Settings → Notifications.
        </CardContent>
      </Card>
    </div>
  )
}


