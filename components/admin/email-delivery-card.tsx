"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Loader2, Mail, RefreshCw, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { emailApi, type EmailTestResult } from "@/lib/api"

type ServiceStatus = { status?: string; provider?: string; message?: string }

export function EmailDeliveryCard() {
  const { token, user } = useAuth()
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<EmailTestResult | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    setChecking(true)
    setStatusError(null)
    try {
      setStatus(await emailApi.getStatus())
    } catch (error) {
      setStatus(null)
      setStatusError(error instanceof Error ? error.message : "Could not reach the email service.")
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    void checkStatus()
  }, [checkStatus])

  const sendTest = async () => {
    if (!token) {
      setSendError("Your session has expired. Sign in again.")
      return
    }
    setSending(true)
    setResult(null)
    setSendError(null)
    try {
      setResult(await emailApi.sendTestEmail(token, recipient.trim() || undefined))
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "The test email could not be sent.")
    } finally {
      setSending(false)
    }
  }

  const operational = status?.status === "operational"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email delivery
        </CardTitle>
        <CardDescription>
          Sign-up verification, password resets and request updates are sent through this service.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Service status</p>
            {checking && !status ? (
              <p className="text-sm text-muted-foreground">Checking…</p>
            ) : statusError ? (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                {statusError}
              </p>
            ) : (
              <p
                className={`flex items-center gap-1.5 text-sm ${operational ? "text-emerald-600" : "text-amber-600"}`}
              >
                {operational ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {operational ? "Operational" : "Not configured"}
                {operational && status?.provider ? (
                  <span className="text-muted-foreground">· {status.provider}</span>
                ) : null}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={checking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            Check again
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-email-recipient">Send a test email to</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="test-email-recipient"
              type="email"
              placeholder={user?.email ?? "you@company.com"}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !sending) void sendTest()
              }}
            />
            <Button onClick={sendTest} disabled={sending} className="sm:w-48">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {sending ? "Sending…" : "Send test email"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Leave it empty to send to your own address.</p>
        </div>

        {result ? (
          <div
            role="status"
            className={`rounded-lg border p-4 text-sm ${
              result.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {result.success ? `Sent to ${result.sent_to} via ${result.provider}` : "Not sent"}
            </p>
            <p className="mt-1 break-words">{result.message}</p>
          </div>
        ) : null}

        {sendError ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {sendError}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
