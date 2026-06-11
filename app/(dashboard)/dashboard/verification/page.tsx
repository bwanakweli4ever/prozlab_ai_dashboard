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
import { cn } from "@/lib/utils"

const EVIDENCE_TYPES: {
  id: VerificationEvidenceType
  label: string
  icon: React.ElementType
  hint: string
  section: "identity" | "work" | "skills"
}[] = [
  { id: "github", label: "GitHub", icon: Github, hint: "Public repos prove real engineering work", section: "identity" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, hint: "Professional history cross-check", section: "identity" },
  { id: "identity_document", label: "ID Document", icon: ShieldCheck, hint: "Government ID or passport verification link", section: "identity" },
  { id: "previous_employer", label: "Past Employer", icon: Briefcase, hint: "Company + role you can verify", section: "work" },
  { id: "work_sample", label: "Work Sample", icon: Briefcase, hint: "Case study, demo, or live project URL", section: "work" },
  { id: "portfolio", label: "Portfolio", icon: Globe, hint: "Personal site or Behance/Dribbble", section: "skills" },
  { id: "recommendation", label: "Recommendation", icon: UserCheck, hint: "Reference from manager or client", section: "skills" },
  { id: "certification", label: "Certification", icon: BadgeCheck, hint: "Credly, Coursera, or vendor cert link", section: "skills" },
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
  const [githubPreview, setGithubPreview] = useState<string | null>(null)

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
    setGithubPreview(null)
  }

  const handleValidateGitHub = async () => {
    if (!token || !url) return
    try {
      const result = await verificationApi.validateGitHub(token, url)
      if (result.valid) {
        setGithubPreview(
          `@${result.username} · ${result.public_repos ?? 0} repos · ${result.followers ?? 0} followers`
        )
        if (!title) setTitle(`GitHub — ${result.username}`)
        toast({ title: "GitHub verified", description: result.message })
      } else {
        toast({ title: "Invalid GitHub", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    }
  }

  const handleAddEvidence = async () => {
    if (!token) return
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        type: activeType,
        title: title || EVIDENCE_TYPES.find((t) => t.id === activeType)?.label || "Evidence",
      }
      if (url) payload.url = url
      if (description) payload.description = description
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
              Verify your identity, work experience, and skills for admin review.
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
            <RequirementRow met={!!reqs?.identity_link} label="Identity (GitHub, LinkedIn, or ID)" />
            <RequirementRow met={!!reqs?.work_experience || !!reqs?.work_proof} label="Work experience proof" />
            <RequirementRow met={!!reqs?.third_party} label="Recommendation or certification" />
            <RequirementRow met={!!reqs?.minimum_items} label="At least 2 evidence items" />
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
              if (first) {
                setActiveType(first.id)
                resetForm()
              }
            }}
          >
            <TabsList className="mb-3 grid w-full grid-cols-3 bg-slate-100 p-1">
              <TabsTrigger value="identity" className="text-[12px]">Identity</TabsTrigger>
              <TabsTrigger value="work" className="text-[12px]">Work Experience</TabsTrigger>
              <TabsTrigger value="skills" className="text-[12px]">Skills Assessment</TabsTrigger>
            </TabsList>
          </Tabs>

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
                <div>
                  <Label>Title</Label>
                  <Input
                    className={dashboardInputClass}
                    placeholder={`e.g. ${t.label} proof`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {t.id !== "recommendation" && t.id !== "previous_employer" && (
                  <div>
                    <Label>URL</Label>
                    <Input
                      className={dashboardInputClass}
                      placeholder="https://"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    {t.id === "github" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleValidateGitHub}>
                          Validate GitHub
                        </Button>
                        {githubPreview && (
                          <span className="text-[12px] text-emerald-600">{githubPreview}</span>
                        )}
                      </div>
                    )}
                  </div>
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
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add evidence
          </Button>
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
                      <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block text-[13px] text-brand hover:underline">
                        {item.url}
                      </a>
                    )}
                    {item.metadata?.username && (
                      <p className="mt-1 text-[12px] text-slate-500">
                        GitHub: @{String(item.metadata.username)} · {String(item.metadata.public_repos ?? 0)} repos
                      </p>
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
