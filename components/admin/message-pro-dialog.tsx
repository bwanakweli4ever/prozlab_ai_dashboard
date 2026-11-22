"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { messageProfessional, type AdminMessageResult } from "@/lib/api"

type Preset = { id: string; label: string; subject: string; body: (firstName: string) => string }

/** Ready-to-send messages. Each can be edited before sending. */
export const MESSAGE_PRESETS: Preset[] = [
  {
    id: "thanks",
    label: "Thank you for joining",
    subject: "Thank you for joining Prozlab",
    body: (n) =>
      `Thank you for joining Prozlab, ${n}. We're glad to have you.\nWhen your profile is complete and verified, we can match you to client work that fits your skills.`,
  },
  {
    id: "complete",
    label: "Finish your profile",
    subject: "A few minutes to finish your profile",
    body: (n) =>
      `Hi ${n}, your profile is almost there. Open AI Assist, upload your CV, and it fills in most of your profile for you to check. It takes a few minutes.`,
  },
  {
    id: "refresh",
    label: "Tidy your profile with AI",
    subject: "Quick refresh for your Prozlab profile",
    body: (n) =>
      `Hi ${n}, some details on your profile look like they came straight from your CV's layout. Open AI Assist and use "Fill my profile from my CV" to tidy it up in a minute.`,
  },
  {
    id: "verify",
    label: "Verify your work",
    subject: "Two steps to get verified",
    body: (n) =>
      `Hi ${n}, verification takes two steps: link your GitHub, LinkedIn or an ID document, and make sure your CV is on your profile. Then press "Submit for review".`,
  },
  {
    id: "verified",
    label: "Thanks for verifying",
    subject: "Thanks for completing your verification",
    body: (n) =>
      `Thank you, ${n}. Your verification is complete. We'll reach out when client work that fits your skills comes in.`,
  },
  {
    id: "work",
    label: "We have work for you",
    subject: "A client request that fits your skills",
    body: (n) =>
      `Hi ${n}, we have a client request that matches your skills. Reply to this email if you're available and we'll share the details.`,
  },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  firstName: string
  fullName: string
  email: string
}

export function MessageProDialog({ open, onOpenChange, profileId, firstName, fullName, email }: Props) {
  const { token } = useAuth()
  const [presetId, setPresetId] = useState(MESSAGE_PRESETS[0].id)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<AdminMessageResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applyPreset = (id: string) => {
    setPresetId(id)
    const preset = MESSAGE_PRESETS.find((p) => p.id === id)
    if (preset) {
      setSubject(preset.subject)
      setMessage(preset.body(firstName || "there"))
    } else {
      setSubject("")
      setMessage("")
    }
  }

  useEffect(() => {
    if (open) {
      applyPreset(MESSAGE_PRESETS[0].id)
      setResult(null)
      setError(null)
      setSendEmail(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profileId])

  const send = async () => {
    if (!token) return
    setSending(true)
    setError(null)
    setResult(null)
    try {
      setResult(await messageProfessional(token, profileId, { subject: subject.trim(), message: message.trim(), send_email: sendEmail }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the message.")
    } finally {
      setSending(false)
    }
  }

  const canSend = subject.trim().length >= 2 && message.trim().length >= 2 && !sending

  return (
    <Dialog open={open} onOpenChange={(o) => !sending && onOpenChange(o)}>
      <DialogContent className="max-w-lg border-slate-200 bg-white text-slate-900 [&>button]:text-slate-500">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Message {fullName}</DialogTitle>
          <DialogDescription className="text-slate-500">
            Shows in their Notifications{sendEmail ? ` and is emailed to ${email}` : ""}. Replies come to your team inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-700">Start from</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...MESSAGE_PRESETS.map((p) => ({ id: p.id, label: p.label })), { id: "custom", label: "Write my own" }].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                    presetId === p.id
                      ? "border-brand bg-brand text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="msg-subject" className="text-slate-700">Subject</Label>
            <Input
              id="msg-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={150}
              className="mt-1.5 border-slate-200 bg-white text-slate-900"
            />
          </div>
          <div>
            <Label htmlFor="msg-body" className="text-slate-700">Message</Label>
            <Textarea
              id="msg-body"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={4000}
              className="mt-1.5 border-slate-200 bg-white text-slate-900"
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <span className="text-[13px] text-slate-700">Also send by email</span>
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
          </label>

          {result && (
            <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {result.message}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          <Button type="button" onClick={send} disabled={!canSend} className="bg-brand text-white hover:bg-brand-dark">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {result ? "Send again" : "Send message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
