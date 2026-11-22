"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Download, FileText, Loader2, RefreshCw, Sparkles, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { RESUME_ACCEPT, resumeApi, validateResumeFile } from "@/lib/api"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"

type Props = {
  /** Show the "Fill my profile from it" link (hidden on the AI page, which has its own button). */
  showAiLink?: boolean
  className?: string
  /** Called after a CV is saved, e.g. to start AI analysis right away. */
  onUploaded?: () => void
}

function formatDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function ResumeCard({ showAiLink = true, className, onUploaded }: Props) {
  const { token } = useAuth()
  const { profile, fetchProfile, ensureMinimalProfile } = useProfile()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<"upload" | "download" | "remove" | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileName = profile?.resume_filename

  const upload = async (file: File | undefined | null) => {
    if (!file || !token) return
    const problem = validateResumeFile(file)
    setError(problem)
    if (problem) return
    setBusy("upload")
    try {
      if (!profile) await ensureMinimalProfile()
      await resumeApi.upload(token, file)
      await fetchProfile()
      toast({ title: "CV saved", description: file.name })
      onUploaded?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload your CV. Try again.")
    } finally {
      setBusy(null)
    }
  }

  const download = async () => {
    if (!token) return
    setBusy("download")
    try {
      await resumeApi.download(token, fileName || "cv")
    } catch (e) {
      toast({ title: "Download failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    if (!token || !window.confirm("Remove your CV from your profile?")) return
    setBusy("remove")
    try {
      await resumeApi.remove(token)
      await fetchProfile()
      toast({ title: "CV removed" })
    } catch (e) {
      toast({ title: "Could not remove your CV", description: e instanceof Error ? e.message : "Try again", variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={cn(dashboardCardClass, "p-5", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="sr-only"
        aria-label="Choose your CV"
        onChange={(e) => {
          void upload(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">Your CV</h3>
          <p className="text-[12.5px] text-slate-500">Private to you and the Prozlab team. PDF or Word, up to 10 MB.</p>
        </div>
      </div>

      {fileName ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium text-slate-800">{fileName}</p>
              {profile?.resume_uploaded_at && (
                <p className="text-[12px] text-slate-500">Added {formatDate(profile.resume_uploaded_at)}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={download} disabled={busy !== null}>
              {busy === "download" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy !== null}>
              {busy === "upload" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Replace
            </Button>
            <Button size="sm" variant="ghost" onClick={remove} disabled={busy !== null} className="text-slate-500 hover:text-red-600">
              {busy === "remove" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span className="sr-only">Remove CV</span>
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void upload(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "mt-4 block w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
            dragging ? "border-brand bg-brand/5" : "border-slate-200 bg-slate-50/60 hover:border-brand/40 hover:bg-brand/5",
          )}
        >
          {busy === "upload" ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
          ) : (
            <Upload className="mx-auto h-6 w-6 text-brand" />
          )}
          <span className="mt-2 block text-[13.5px] font-semibold text-slate-700">
            {busy === "upload" ? "Uploading…" : "Upload your CV"}
            {busy !== "upload" && <span className="font-normal text-slate-500"> or drop it here</span>}
          </span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-red-600">
          {error}
        </p>
      )}

      {showAiLink && fileName && (
        <Link
          href="/dashboard/profile/ai-assist"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-dark"
        >
          <Sparkles className="h-4 w-4" />
          Fill my profile from my CV
        </Link>
      )}
    </div>
  )
}
