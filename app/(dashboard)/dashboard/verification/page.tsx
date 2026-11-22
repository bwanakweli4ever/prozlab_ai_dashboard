"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Check,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import {
  isPrivateDocumentUrl,
  openPrivateDocument,
  verificationApi,
  type VerificationEvidence,
  type VerificationEvidenceType,
  type VerificationStatus,
} from "@/lib/api"
import {
  dashboardCardClass,
  dashboardInputClass,
  dashboardPageSubtitleClass,
  dashboardPageTitleClass,
} from "@/lib/dashboard-styles"
import { cn, normalizeMediaUrl } from "@/lib/utils"
import { ResumeCard } from "@/components/dashboard/resume-card"

const EVIDENCE_TYPES: {
  id: VerificationEvidenceType
  label: string
  icon: React.ElementType
  hint: string
  section: "identity" | "work" | "skills"
}[] = [
  { id: "github", label: "GitHub", icon: Github, hint: "Your GitHub profile or one of your repositories.", section: "identity" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, hint: "Your public LinkedIn profile.", section: "identity" },
  { id: "identity_document", label: "ID Document", icon: ShieldCheck, hint: "A government ID or passport (PDF, JPG or PNG). Only Prozlab admins can see it.", section: "identity" },
  { id: "portfolio", label: "Portfolio", icon: Globe, hint: "Your website or portfolio link.", section: "skills" },
  { id: "work_sample", label: "Work Sample", icon: Briefcase, hint: "A case study, demo or live project link.", section: "skills" },
  { id: "certification", label: "Certification", icon: BadgeCheck, hint: "A link to a certificate (Credly, Microsoft, Cisco, AWS…).", section: "skills" },
  { id: "recommendation", label: "Reference", icon: UserCheck, hint: "Someone who can vouch for your work: a manager or client.", section: "skills" },
]

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full",
          met ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
        )}
      >
        <Check className="h-3 w-3" />
      </div>
      <span className={met ? "text-slate-700" : "text-slate-500"}>{label}</span>
    </div>
  )
}

type GitHubValidationResult = Awaited<ReturnType<typeof verificationApi.validateGitHub>>

function normalizeGitHubUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "")
  if (/^(www\.)?github\.com\//i.test(trimmed)) return `https://${trimmed.replace(/^www\./i, "").replace(/\/+$/, "")}`
  if (!trimmed.includes("/") && /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(trimmed)) {
    return `https://github.com/${trimmed}`
  }
  return trimmed
}

function formatGitHubMemberSince(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
}

function resolveEvidenceTitle(
  rawTitle: string,
  activeType: VerificationEvidenceType,
  githubResult?: GitHubValidationResult | null
): string {
  const trimmed = rawTitle.trim()
  if (trimmed.length >= 2) return trimmed

  if (activeType === "github" && githubResult?.username) {
    return `GitHub — ${githubResult.username}`
  }

  const label = EVIDENCE_TYPES.find((t) => t.id === activeType)?.label
  return label ? `${label} verification` : "Verification evidence"
}

function evidenceUrlPlaceholder(type: VerificationEvidenceType): string {
  switch (type) {
    case "github":
      return "https://github.com/your-username"
    case "linkedin":
      return "https://linkedin.com/in/your-profile"
    case "portfolio":
      return "https://yourportfolio.com"
    case "work_sample":
      return "https://link-to-your-project-or-demo.com"
    case "certification":
      return "https://credly.com/badges/... or issuer link"
    default:
      return "https://"
  }
}

function GitHubPreviewCard({ result }: { result: GitHubValidationResult }) {
  if (!result.valid || !result.username) return null

  const memberSince = formatGitHubMemberSince(result.account_created_at)

  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-start gap-3">
        {result.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.avatar_url}
            alt=""
            className="h-12 w-12 rounded-full border border-white shadow-sm"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
            <Github className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-slate-900">{result.name || result.username}</p>
          <p className="text-[12px] text-slate-600">@{result.username}</p>
          <p className="mt-1 text-[12px] text-emerald-700">
            {result.public_repos ?? 0} public {result.public_repos === 1 ? "repository" : "repositories"}
            {memberSince ? ` · member since ${memberSince}` : ""}
          </p>
          {result.bio && (
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{result.bio}</p>
          )}
        </div>
      </div>

      {result.top_repos && result.top_repos.length > 0 && (
        <div className="mt-3 border-t border-emerald-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recent public work</p>
          <ul className="mt-2 space-y-2">
            {result.top_repos.map((repo) => (
              <li key={repo.name} className="rounded-lg bg-white/80 px-3 py-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {repo.url ? (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] font-semibold text-brand hover:underline"
                    >
                      {repo.name}
                    </a>
                  ) : (
                    <span className="text-[13px] font-semibold text-slate-900">{repo.name}</span>
                  )}
                  {repo.language && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {repo.language}
                    </span>
                  )}
                  {typeof repo.stars === "number" && repo.stars > 0 && (
                    <span className="text-[11px] text-slate-500">{repo.stars} stars</span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{repo.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function SkillsVerificationPage() {
  const { token } = useAuth()
  const { ensureMinimalProfile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [section, setSection] = useState<"identity" | "work" | "skills">("identity")
  const [activeType, setActiveType] = useState<VerificationEvidenceType>("github")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [referrerName, setReferrerName] = useState("")
  const [referrerEmail, setReferrerEmail] = useState("")
  const [referrerRelationship, setReferrerRelationship] = useState("")
  const [referrerMessage, setReferrerMessage] = useState("")
  const [githubResult, setGithubResult] = useState<GitHubValidationResult | null>(null)
  const [githubChecking, setGithubChecking] = useState(false)
  const [identityDocFile, setIdentityDocFile] = useState<File | null>(null)
  const [identityDocLabel, setIdentityDocLabel] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await verificationApi.getStatus(token)
      setStatus(data)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load verification"
      if (msg.includes("not found")) {
        try {
          await ensureMinimalProfile()
          const data = await verificationApi.getStatus(token)
          setStatus(data)
          return
        } catch {
          /* fall through */
        }
      }
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [token, ensureMinimalProfile])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const resetForm = () => {
    setTitle("")
    setUrl("")
    setDescription("")
    setReferrerName("")
    setReferrerEmail("")
    setReferrerRelationship("")
    setReferrerMessage("")
    setGithubResult(null)
    setIdentityDocFile(null)
    setIdentityDocLabel(null)
  }

  const handleAddEvidence = async () => {
    if (!token) return

    // GitHub: any profile or repository link works. Check it here if it wasn't checked already.
    let ghResult = githubResult
    if (activeType === "github") {
      const normalizedUrl = normalizeGitHubUrl(url)
      if (!normalizedUrl) {
        toast({ title: "Paste your GitHub link", variant: "destructive" })
        return
      }
      const inputUsername = normalizedUrl.match(/github\.com\/([^/?#]+)/i)?.[1]?.toLowerCase()
      const checkedUsername = ghResult?.username?.toLowerCase()
      if (!ghResult?.valid || (inputUsername && checkedUsername && inputUsername !== checkedUsername)) {
        setGithubChecking(true)
        try {
          ghResult = await verificationApi.validateGitHub(token, normalizedUrl)
          setGithubResult(ghResult)
        } catch (error) {
          toast({
            title: "Could not check GitHub",
            description: error instanceof Error ? error.message : "Try again in a moment.",
            variant: "destructive",
          })
          return
        } finally {
          setGithubChecking(false)
        }
        if (!ghResult?.valid) {
          toast({ title: "Could not verify GitHub", description: ghResult?.message, variant: "destructive" })
          return
        }
      }
    }

    if (activeType === "linkedin") {
      const trimmedUrl = url.trim()
      if (!/^https?:\/\/(www\.)?linkedin\.com\/in\//i.test(trimmedUrl)) {
        toast({ title: "Enter a valid LinkedIn profile URL", variant: "destructive" })
        return
      }
    }

    if (["portfolio", "work_sample", "certification"].includes(activeType)) {
      const trimmedUrl = url.trim()
      if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        toast({ title: "Enter a valid https link", variant: "destructive" })
        return
      }
    }

    if (activeType === "identity_document") {
      if (!identityDocFile && !url.trim()) {
        toast({
          title: "ID document required",
          description: "Upload your government ID or passport before adding this evidence.",
          variant: "destructive",
        })
        return
      }
      if (description.trim().length < 3) {
        toast({
          title: "Document type required",
          description: "Tell us what you uploaded (e.g. Passport, National ID, Driver's license).",
          variant: "destructive",
        })
        return
      }
    }

    if (activeType === "previous_employer" && description.trim().length < 10) {
      toast({
        title: "Employer details required",
        description: "Describe the company, your role, and what you delivered.",
        variant: "destructive",
      })
      return
    }

    if (activeType === "recommendation") {
      if (!referrerName.trim() || !referrerEmail.trim()) {
        toast({ title: "Referrer details required", variant: "destructive" })
        return
      }
      if (referrerMessage.trim().length < 20) {
        toast({ title: "Recommendation message too short", description: "Use at least 20 characters.", variant: "destructive" })
        return
      }
    }

    setSubmitting(true)
    try {
      let evidenceUrl = url.trim()
      if (activeType === "identity_document" && identityDocFile) {
        const upload = await verificationApi.uploadIdentityDocument(token, identityDocFile)
        evidenceUrl = upload.file_url || ""
        if (!evidenceUrl) {
          throw new Error("Upload succeeded but no file URL was returned")
        }
      }

      const resolvedTitle = resolveEvidenceTitle(title, activeType, ghResult)
      const payload: Record<string, unknown> = {
        type: activeType,
        title: resolvedTitle,
      }
      if (evidenceUrl) payload.url = activeType === "github" ? normalizeGitHubUrl(evidenceUrl) : evidenceUrl
      if (description.trim()) payload.description = description.trim()
      if (activeType === "recommendation") {
        payload.referrer_name = referrerName
        payload.referrer_email = referrerEmail
        payload.referrer_relationship = referrerRelationship
        payload.referrer_message = referrerMessage
      }
      if (activeType === "previous_employer") {
        payload.description = description
      }

      await verificationApi.addEvidence(token, payload)
      resetForm()
      await loadStatus()
      toast({ title: "Evidence added", description: "Your verification item was saved." })
    } catch (error) {
      toast({
        title: "Could not add evidence",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      await verificationApi.deleteEvidence(token, id)
      await loadStatus()
      toast({ title: "Removed" })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!token) return
    setSubmitting(true)
    try {
      const data = await verificationApi.submit(token)
      setStatus(data)
      toast({
        title: "Submitted for review",
        description: "Our team will review your verification evidence.",
      })
    } catch (error) {
      toast({
        title: "Submit failed",
        description: error instanceof Error ? error.message : "Complete all requirements first",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  const reqs = status?.requirements_met

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className={dashboardPageTitleClass}>Verification Center</h1>
            <p className={`mt-1 ${dashboardPageSubtitleClass}`}>
              Two steps: show it&apos;s you, and add your CV. Everything else is optional.
            </p>
          </div>
        </div>
      </div>

      {status?.admin_notes && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-[13px]",
            status.skill_verification_status === "verified"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : status.skill_verification_status === "rejected" || status.skill_verification_status === "needs_revision"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-slate-50 text-slate-700"
          )}
        >
          <p className="font-semibold">Admin feedback</p>
          <p className="mt-1">{status.admin_notes}</p>
          {status.reviewed_at && (
            <p className="mt-1 text-[12px] opacity-70">Reviewed {new Date(status.reviewed_at).toLocaleString()}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(dashboardCardClass, "md:col-span-1")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold">Verification score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[36px] font-bold text-brand">{status?.verification_score ?? 0}%</div>
            <p className="mt-1 text-[12px] text-slate-500 capitalize">
              Status: {status?.skill_verification_status?.replace(/_/g, " ") ?? "not started"}
            </p>
          </CardContent>
        </Card>
        <Card className={cn(dashboardCardClass, "md:col-span-2")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-semibold">Requirements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <RequirementRow met={!!reqs?.identity_link} label="1. Show it's you: GitHub, LinkedIn or ID" />
            <RequirementRow met={!!reqs?.cv_on_profile} label="2. Your CV (it covers your experience)" />
            <p className="text-[12px] text-slate-500 sm:col-span-2">
              Portfolio, work samples, certifications and references are optional and raise your score.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={dashboardCardClass}>
        <CardHeader>
          <CardTitle className="text-[16px]">Add verification evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={section}
            onValueChange={(v) => {
              const next = v as "identity" | "work" | "skills"
              setSection(next)
              const first = EVIDENCE_TYPES.find((t) => t.section === next)
              if (next === "work") return
              if (first) {
                setActiveType(first.id)
                resetForm()
              }
            }}
          >
            <TabsList className="mb-3 grid w-full grid-cols-3 bg-slate-100 p-1">
              <TabsTrigger value="identity" className="text-[12px]">1. It&apos;s you</TabsTrigger>
              <TabsTrigger value="work" className="text-[12px]">2. Your CV</TabsTrigger>
              <TabsTrigger value="skills" className="text-[12px]">Extras (optional)</TabsTrigger>
            </TabsList>
          </Tabs>

          {section === "work" ? (
            <div className="space-y-3">
              <p className="text-[13px] text-slate-600">
                Your CV is your work-experience proof, so there&apos;s nothing to retype. Our team reviews it with the rest
                of your verification.
              </p>
              <ResumeCard className="shadow-none" onUploaded={loadStatus} />
            </div>
          ) : (
          <>
          <Tabs value={activeType} onValueChange={(v) => { setActiveType(v as VerificationEvidenceType); resetForm() }}>
            <TabsList className="flex h-auto flex-wrap gap-1 bg-slate-100 p-1">
              {EVIDENCE_TYPES.filter((t) => t.section === section).map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="text-[12px]">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {EVIDENCE_TYPES.filter((t) => t.section === section).map((t) => (
              <TabsContent key={t.id} value={t.id} className="space-y-3 pt-2">
                <p className="text-[13px] text-slate-500">{t.hint}</p>
                <div className={["github", "linkedin", "identity_document"].includes(t.id) ? "hidden" : undefined}>
                  <Label>Title</Label>
                  <Input
                    className={dashboardInputClass}
                    placeholder={`e.g. ${t.label} proof`}
                    minLength={2}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">At least 2 characters. Leave blank to use a default title.</p>
                </div>

                {t.id !== "recommendation" && t.id !== "previous_employer" && t.id !== "identity_document" && (
                  <div>
                    <Label>URL</Label>
                    <Input
                      className={dashboardInputClass}
                      placeholder={evidenceUrlPlaceholder(t.id)}
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (t.id === "github") setGithubResult(null)
                      }}
                    />
                    {t.id === "github" && (
                      <div className="mt-2 space-y-2">
                        <p className="text-[12px] text-slate-500">
                          Paste your GitHub profile or any of your repositories. We check your public repositories when
                          you add it.
                        </p>
                        {githubResult && <GitHubPreviewCard result={githubResult} />}
                      </div>
                    )}
                  </div>
                )}

                {t.id === "identity_document" && (
                  <>
                    <div>
                      <Label>Upload document</Label>
                      <Input
                        className={dashboardInputClass}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setIdentityDocFile(file)
                          setIdentityDocLabel(file?.name ?? null)
                          setUrl("")
                        }}
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        PDF, JPG, or PNG up to 5MB. Your document is only visible to Prozlab admins during review.
                      </p>
                      {identityDocLabel && (
                        <p className="mt-2 text-[12px] font-medium text-emerald-700">
                          Ready to upload: {identityDocLabel}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Document type</Label>
                      <Input
                        className={dashboardInputClass}
                        placeholder="e.g. Passport, National ID, Driver's license"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(t.id === "work_sample" || t.id === "certification" || t.id === "previous_employer") && (
                  <div>
                    <Label>{t.id === "previous_employer" ? "Role & responsibilities" : "Description"}</Label>
                    <Textarea
                      className={dashboardInputClass}
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                )}

                {t.id === "recommendation" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Referrer name</Label>
                        <Input className={dashboardInputClass} value={referrerName} onChange={(e) => setReferrerName(e.target.value)} />
                      </div>
                      <div>
                        <Label>Referrer email</Label>
                        <Input className={dashboardInputClass} type="email" value={referrerEmail} onChange={(e) => setReferrerEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        className={dashboardInputClass}
                        placeholder="e.g. Former manager at Acme Corp"
                        value={referrerRelationship}
                        onChange={(e) => setReferrerRelationship(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Recommendation message</Label>
                      <Textarea
                        className={dashboardInputClass}
                        rows={4}
                        placeholder="What they can attest to about your skills and delivery..."
                        value={referrerMessage}
                        onChange={(e) => setReferrerMessage(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {t.id === "previous_employer" && (
                  <div>
                    <Label>Company website (optional)</Label>
                    <Input className={dashboardInputClass} value={url} onChange={(e) => setUrl(e.target.value)} />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <Button
            onClick={handleAddEvidence}
            disabled={submitting || githubChecking}
            className="bg-brand text-white hover:bg-brand-dark"
          >
            {submitting || githubChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {githubChecking ? "Checking GitHub…" : "Add evidence"}
          </Button>
          </>
          )}
        </CardContent>
      </Card>

      <Card className={dashboardCardClass}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[16px]">Submitted evidence</CardTitle>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !status?.can_submit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for review"}
          </Button>
        </CardHeader>
        <CardContent>
          {!status?.evidences?.length ? (
            <p className="text-[14px] text-slate-500">No evidence yet. Add GitHub, work samples, or a recommendation above.</p>
          ) : (
            <ul className="space-y-3">
              {status.evidences.map((item: VerificationEvidence) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-brand">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[14px] font-medium text-slate-900">{item.title}</span>
                      {item.status && item.status !== "submitted" && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                            item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                    {item.admin_notes && (
                      <p className="mt-1 text-[12px] text-amber-700">Note: {item.admin_notes}</p>
                    )}
                    {item.url && (
                      item.type === "identity_document" ? (
                        <p className="mt-1 text-[13px] text-emerald-700">
                          Private identity document, visible only to you and Prozlab admins.
                          {token && isPrivateDocumentUrl(item.url) && (
                            <button
                              type="button"
                              onClick={() => {
                                void openPrivateDocument(token, item.url!).catch(() => undefined)
                              }}
                              className="ml-2 font-medium text-brand hover:underline"
                            >
                              View
                            </button>
                          )}
                        </p>
                      ) : (
                        <a
                          href={normalizeMediaUrl(item.url) || item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-[13px] text-brand hover:underline"
                        >
                          {item.url}
                        </a>
                      )
                    )}
                    {item.metadata?.username && (
                      <div className="mt-2 text-[12px] text-slate-500">
                        <p>
                          GitHub @{String(item.metadata.username)}
                          {item.metadata.public_repos != null
                            ? ` · ${String(item.metadata.public_repos)} public repos`
                            : ""}
                          {item.metadata.account_created_at
                            ? ` · since ${formatGitHubMemberSince(String(item.metadata.account_created_at))}`
                            : ""}
                        </p>
                        {Array.isArray(item.metadata.top_repos) && item.metadata.top_repos.length > 0 && (
                          <p className="mt-1">
                            Work shown:{" "}
                            {(item.metadata.top_repos as Array<{ name?: string }>)
                              .map((repo) => repo.name)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                    {item.referrer_name && (
                      <p className="mt-1 text-[12px] text-slate-500">
                        Ref: {item.referrer_name}
                        {item.referrer_relationship ? ` (${item.referrer_relationship})` : ""}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
