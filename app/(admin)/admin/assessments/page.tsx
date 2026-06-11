"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { adminApi } from "@/lib/api"
import type { SkillVerificationDetail, SkillVerificationListItem } from "@/types/api"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  in_progress: "bg-slate-100 text-slate-700",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  needs_revision: "bg-orange-100 text-orange-800",
  not_started: "bg-slate-100 text-slate-500",
}

const EVIDENCE_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  identity_document: "ID Document",
  previous_employer: "Work Experience",
  work_sample: "Work Sample",
  portfolio: "Portfolio",
  recommendation: "Recommendation",
  certification: "Certification",
}

function statusBadge(status: string) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_COLORS[status] || STATUS_COLORS.in_progress)}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

export default function AdminAssessmentsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<SkillVerificationListItem[]>([])
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("pending")
  const [detail, setDetail] = useState<SkillVerificationDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [evidenceReviews, setEvidenceReviews] = useState<Record<string, "approved" | "rejected" | "pending">>({})

  const loadProfiles = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const category =
        tab === "identity" ? "identity" : tab === "work" ? "work_experience" : undefined
      const skillStatus = tab === "pending" ? "pending_review" : tab === "all" ? undefined : undefined

      const data = await adminApi.getSkillVerifications(token, {
        page: 1,
        pageSize: 50,
        skillStatus: tab === "pending" ? "pending_review" : tab === "verified" ? "verified" : tab === "rejected" ? "rejected" : undefined,
        search: search || undefined,
        category,
      })
      setProfiles(data.profiles)
    } catch (error) {
      toast({
        title: "Failed to load assessments",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [token, tab, search, toast])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const openDetail = async (profileId: string) => {
    if (!token) return
    setDetailOpen(true)
    setDetailLoading(true)
    setReviewNotes("")
    setEvidenceReviews({})
    try {
      const data = await adminApi.getSkillVerificationDetail(profileId, token)
      setDetail(data)
      const reviews: Record<string, "approved" | "rejected" | "pending"> = {}
      data.evidences.forEach((e) => {
        reviews[e.id] = (e.status as "approved" | "rejected" | "pending") || "pending"
      })
      setEvidenceReviews(reviews)
      setReviewNotes(data.admin_notes || "")
    } catch (error) {
      toast({
        title: "Could not load details",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleReview = async (decision: "verified" | "rejected" | "needs_revision") => {
    if (!token || !detail) return
    setSubmitting(true)
    try {
      await adminApi.reviewSkillVerification(detail.profile.id, token, {
        decision,
        admin_notes: reviewNotes || undefined,
        evidence_reviews: Object.entries(evidenceReviews).map(([evidence_id, status]) => ({
          evidence_id,
          status,
        })),
      })
      toast({
        title: decision === "verified" ? "Assessment approved" : decision === "rejected" ? "Assessment rejected" : "Sent back for revision",
      })
      setDetailOpen(false)
      await loadProfiles()
    } catch (error) {
      toast({
        title: "Review failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = profiles.filter((p) => p.skill_verification_status === "pending_review").length

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Review identity verification, work experience, and skills assessments submitted by candidates.
          </p>
        </div>
        <Link href="/admin/verifications">
          <Button variant="outline" size="sm" className="text-[13px]">
            Profile requests →
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[12px] text-slate-500">Pending review</p>
              <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[12px] text-slate-500">Identity items</p>
              <p className="text-xl font-bold text-slate-900">
                {profiles.reduce((n, p) => n + p.identity_items, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[12px] text-slate-500">Work experience</p>
              <p className="text-xl font-bold text-slate-900">
                {profiles.reduce((n, p) => n + p.work_experience_items, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-[16px] text-slate-900">Submissions</CardTitle>
              <CardDescription>Filter by category or review status</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-slate-100 p-1">
              <TabsTrigger value="pending" className="text-[12px]">Pending</TabsTrigger>
              <TabsTrigger value="all" className="text-[12px]">All</TabsTrigger>
              <TabsTrigger value="identity" className="text-[12px]">Identity</TabsTrigger>
              <TabsTrigger value="work" className="text-[12px]">Work Experience</TabsTrigger>
              <TabsTrigger value="verified" className="text-[12px]">Verified</TabsTrigger>
              <TabsTrigger value="rejected" className="text-[12px]">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-0">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-[14px] text-slate-500">
                  No assessment submissions found for this filter.
                </div>
              ) : (
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {p.first_name} {p.last_name}
                          </p>
                          {statusBadge(p.skill_verification_status)}
                          <Badge variant="outline" className="text-[11px]">
                            Score {p.verification_score}%
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-slate-500">{p.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> {p.identity_items} identity
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {p.work_experience_items} work
                          </span>
                          <span>{p.evidence_count} total items</span>
                          {p.submitted_at && (
                            <span>Submitted {new Date(p.submitted_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openDetail(p.id)} className="shrink-0">
                        <Eye className="mr-1.5 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Review assessment</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">
                  {detail.profile.first_name} {detail.profile.last_name}
                </p>
                <p className="text-[13px] text-slate-500">{detail.profile.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statusBadge(detail.profile.skill_verification_status)}
                  <Badge variant="secondary">Profile: {detail.profile.verification_status}</Badge>
                  {detail.profile.years_experience != null && (
                    <Badge variant="outline">{detail.profile.years_experience} yrs exp</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-slate-700">Evidence items</p>
                {detail.evidences.map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-medium text-slate-900">
                          {EVIDENCE_LABELS[ev.type] || ev.type}: {ev.title}
                        </p>
                        {ev.url && (
                          <a href={ev.url} target="_blank" rel="noreferrer" className="text-[12px] text-brand hover:underline">
                            {ev.url}
                          </a>
                        )}
                        {ev.description && (
                          <p className="mt-1 text-[12px] text-slate-500">{ev.description}</p>
                        )}
                        {ev.referrer_name && (
                          <p className="mt-1 text-[12px] text-slate-500">
                            Ref: {ev.referrer_name} ({ev.referrer_email})
                          </p>
                        )}
                      </div>
                      <select
                        className="rounded-md border border-slate-200 px-2 py-1 text-[12px]"
                        value={evidenceReviews[ev.id] || "pending"}
                        onChange={(e) =>
                          setEvidenceReviews((prev) => ({
                            ...prev,
                            [ev.id]: e.target.value as "approved" | "rejected" | "pending",
                          }))
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-1.5 text-[13px] font-medium text-slate-700">Admin notes</p>
                <Textarea
                  placeholder="Feedback for the candidate..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-orange-700"
              onClick={() => handleReview("needs_revision")}
              disabled={submitting || detailLoading}
            >
              Request revision
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview("rejected")}
              disabled={submitting || detailLoading}
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button
              className="bg-brand hover:bg-brand/90"
              onClick={() => handleReview("verified")}
              disabled={submitting || detailLoading}
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
