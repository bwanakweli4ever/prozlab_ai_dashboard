"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, KeyRound, Loader2, LogOut, Mail, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/lib/api"
import { dashboardCardClass, dashboardPageSubtitleClass, dashboardPageTitleClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className="text-[14px] font-medium text-slate-900">{value || "—"}</span>
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  const sendResetLink = async () => {
    if (!user?.email) return
    setSending(true)
    setError(null)
    try {
      await authApi.forgotPassword(user.email)
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the email. Try again in a minute.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className={cn(dashboardPageTitleClass, "flex items-center gap-2")}>
          <Settings className="h-5 w-5 text-brand" />
          Settings
        </h1>
        <p className={cn("mt-1", dashboardPageSubtitleClass)}>Your account details and password.</p>
      </div>

      <section className={cn(dashboardCardClass, "p-5")}>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <User className="h-4 w-4 text-brand" />
          Account
        </h2>
        <div className="mt-2 divide-y divide-slate-100">
          <Row label="Name" value={fullName} />
          <Row label="Email" value={user?.email} />
        </div>
        <Link
          href="/dashboard/profile/view?edit=1"
          className="mt-3 inline-block text-[13px] font-semibold text-brand hover:text-brand-dark"
        >
          Edit your profile →
        </Link>
      </section>

      <section className={cn(dashboardCardClass, "p-5")}>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <KeyRound className="h-4 w-4 text-brand" />
          Password
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          We&apos;ll email you a secure link to choose a new password.
        </p>
        {sent ? (
          <p role="status" className="mt-4 flex items-center gap-2 text-[13px] font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Sent to {user?.email}. Check your inbox (and spam folder).
          </p>
        ) : (
          <Button onClick={sendResetLink} disabled={sending || !user?.email} variant="outline" className="mt-4">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Email me a reset link
          </Button>
        )}
        {error && (
          <p role="alert" className="mt-2 text-[13px] text-red-600">
            {error}
          </p>
        )}
      </section>

      <section className={cn(dashboardCardClass, "p-5")}>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <Mail className="h-4 w-4 text-brand" />
          Emails from Prozlab
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
          We email you when a task is assigned to you, when your verification is reviewed, and with occasional
          reminders to finish your profile. Questions? Reply to any of them.
        </p>
      </section>

      <Button variant="ghost" onClick={logout} className="text-slate-600 hover:text-red-600">
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
