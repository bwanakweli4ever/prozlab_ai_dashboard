"use client"

import { useCallback, useEffect, useState } from "react"
import { BellRing, CheckCircle2, Clock, Loader2, Mail, RefreshCw, Send, XCircle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { profileReminderApi, type ProfileReminderOverview, type ProfileReminderResult } from "@/lib/api"

export function ProfileReminderCard() {
  const { token, user } = useAuth()
  const [overview, setOverview] = useState<ProfileReminderOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [testTo, setTestTo] = useState("")
  const [busy, setBusy] = useState<"test" | "send" | null>(null)
  const [result, setResult] = useState<ProfileReminderResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setLoadError(null)
    try {
      setOverview(await profileReminderApi.overview(token))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load reminder recipients.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const sendTest = async () => {
    if (!token) return
    setBusy("test")
    setResult(null)
    try {
      setResult(await profileReminderApi.sendTest(token, testTo.trim() || undefined))
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "Test send failed.", count: 0 })
    } finally {
      setBusy(null)
    }
  }

  const sendAll = async () => {
    if (!token) return
    setConfirmOpen(false)
    setBusy("send")
    setResult(null)
    try {
      setResult(await profileReminderApi.sendAll(token))
      // Give the background sender a moment, then refresh who's still eligible.
      setTimeout(() => void load(), 4000)
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : "Sending failed.", count: 0 })
    } finally {
      setBusy(null)
    }
  }

  const count = overview?.eligible_count ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Profile reminders
        </CardTitle>
        <CardDescription>
          Email professionals whose profiles aren&apos;t finished. Each email lists the steps they still have left.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {overview?.auto && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
              overview.auto.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                Automatic reminders: {overview.auto.enabled ? "On" : "Off"}
              </p>
              <p className="mt-0.5">
                {overview.auto.enabled
                  ? `Sent ${overview.auto.schedule} to professionals who signed up at least ${overview.auto.min_account_age_days} day ago. Each person gets one at most every ${overview.auto.interval_days} days and ${overview.auto.max_reminders} in total.`
                  : "Turn on with PROFILE_REMINDERS_AUTO=true in the server's .env. You can still send them yourself below."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div>
            {loading && !overview ? (
              <p className="text-sm text-muted-foreground">Checking profiles…</p>
            ) : loadError ? (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                {loadError}
              </p>
            ) : overview ? (
              <>
                <p className="text-sm font-medium">
                  {count === 0
                    ? "Nobody needs a reminder right now"
                    : `${count} professional${count === 1 ? "" : "s"} with unfinished profiles`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {overview.recently_reminded_count > 0
                    ? `${overview.recently_reminded_count} reminded in the last ${overview.skip_recent_days} days are skipped.`
                    : `Anyone reminded in the last ${overview.skip_recent_days} days is skipped.`}{" "}
                  Only verified, active accounts are included.
                </p>
              </>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {overview && overview.recipients.length > 0 && (
          <div className="max-h-64 overflow-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Professional</th>
                  <th className="px-3 py-2 font-medium">Progress</th>
                  <th className="px-3 py-2 font-medium">Reminded</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Still to do</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {overview.recipients.map((r) => (
                  <tr key={r.email}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {r.steps_done} of {r.steps_total}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {r.reminders_sent ? `${r.reminders_sent}×` : "Not yet"}
                    </td>
                    <td className="hidden px-3 py-2 text-xs text-slate-500 md:table-cell">{r.missing.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {overview && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <p className="text-xs text-muted-foreground">Subject: {overview.subject}</p>
            <iframe
              title="Profile reminder email preview"
              srcDoc={overview.preview_html}
              sandbox=""
              className="h-[560px] w-full rounded-lg border bg-slate-100"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reminder-test-to">Send a test to</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="reminder-test-to"
              type="email"
              placeholder={user?.email ?? "you@company.com"}
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
            <Button variant="outline" onClick={sendTest} disabled={busy !== null} className="sm:w-44">
              {busy === "test" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send test
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">Each person gets their own checklist and a link to sign in.</p>
          <Button onClick={() => setConfirmOpen(true)} disabled={busy !== null || count === 0}>
            {busy === "send" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {count > 0 ? `Send to ${count} professional${count === 1 ? "" : "s"}` : "Send reminders"}
          </Button>
        </div>

        {result && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-lg border p-4 text-sm ${
              result.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {result.success ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <span>{result.message}</span>
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Email {count} professional{count === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Each person gets the &ldquo;{overview?.subject}&rdquo; email with their own checklist. Anyone emailed now
              won&apos;t be included again for {overview?.skip_recent_days ?? 7} days. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendAll}>Send emails</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
