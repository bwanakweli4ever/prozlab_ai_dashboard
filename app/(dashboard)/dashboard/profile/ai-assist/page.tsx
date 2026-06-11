// app/(dashboard)/dashboard/profile/ai-assist/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import Link from "next/link"
import { ArrowLeft, Loader2, Sparkles, Upload } from "lucide-react"
import {
  dashboardCardClass,
  dashboardInputClass,
  dashboardPageSubtitleClass,
  dashboardPageTitleClass,
} from "@/lib/dashboard-styles"

export default function AIAssistProfilePage() {
  const { token, isAuthenticated, user } = useAuth()
  const { fetchProfile } = useProfile()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [yearsExperience, setYearsExperience] = useState<number | "">("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [education, setEducation] = useState("")
  const [certifications, setCertifications] = useState("")
  const [experiences, setExperiences] = useState<any[]>([])
  const [educationItems, setEducationItems] = useState<any[]>([])
  const router = useRouter()

  const handleUpload = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", description: "You need to be signed in to use AI Assist", variant: "destructive" })
      router.push("/login")
      return
    }
    if (!file) {
      toast({ title: "Please select a PDF resume" })
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${API_BASE_URL}/api/v1/proz/ai/parse-resume`, {
        method: "POST",
        body: form,
        credentials: "include",
        headers: token ? { "Authorization": `Bearer ${token}` } : undefined,
      })
      if (res.status === 401) {
        toast({ title: "Unauthorized", description: "Please log in again to continue", variant: "destructive" })
        router.push("/login")
        return
      }
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
      const ex = data?.extracted || {}
      if (ex.bio) setBio(ex.bio)
      if (ex.location) setLocation(ex.location)
      if (ex.years_experience !== undefined && ex.years_experience !== null) setYearsExperience(ex.years_experience)
      if (ex.first_name) setFirstName(ex.first_name)
      if (ex.last_name) setLastName(ex.last_name)
      if (ex.phone_number) setPhoneNumber(ex.phone_number)
      if (ex.website) setWebsite(ex.website)
      if (ex.linkedin) setLinkedin(ex.linkedin)
      if (ex.education) setEducation(ex.education)
      if (ex.certifications) setCertifications(ex.certifications)
      if (Array.isArray(ex.experiences)) setExperiences(ex.experiences)
      if (Array.isArray(ex.education_items)) setEducationItems(ex.education_items)
      toast({ title: "Resume analyzed" })
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || "Try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const applyUpdates = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", description: "You need to be signed in to update your profile", variant: "destructive" })
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        first_name: firstName || user?.first_name || "Candidate",
        last_name: lastName || user?.last_name || "User",
      }
      if (phoneNumber) payload.phone_number = phoneNumber
      if (bio) payload.bio = bio
      if (location) payload.location = location
      if (yearsExperience !== "" && !Number.isNaN(Number(yearsExperience))) payload.years_experience = Number(yearsExperience)
      if (website) payload.website = website
      if (linkedin) payload.linkedin = linkedin
      if (education) payload.education = education
      if (certifications) payload.certifications = certifications

      const res = await fetch(`${API_BASE_URL}/api/v1/proz/ai/apply-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        toast({ title: "Unauthorized", description: "Please log in again to continue", variant: "destructive" })
        router.push("/login")
        return
      }
      if (!res.ok) {
        const errText = await res.text()
        let detail = errText
        try {
          const parsed = JSON.parse(errText)
          detail = parsed.detail || errText
        } catch {
          /* use raw text */
        }
        throw new Error(typeof detail === "string" ? detail : "Failed to apply profile")
      }
      await fetchProfile()
      toast({ title: "Profile saved", description: "Your profile is ready to edit and verify." })
      router.push("/dashboard/profile")
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const reviewCurrentProfile = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in", variant: "destructive" })
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/proz/ai/review-profile`, {
        method: "POST",
        headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        credentials: "include",
      })
      if (res.status === 401) {
        toast({ title: "Unauthorized", description: "Please log in again", variant: "destructive" })
        router.push("/login")
        return
      }
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult((prev: any) => ({ ...(prev || {}), review: data }))
      const su = data?.suggested_updates || {}
      if (su.bio && !bio) setBio(su.bio)
      toast({ title: "AI review ready" })
    } catch (e: any) {
      toast({ title: "Review failed", description: e?.message || "Try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
            <span className="text-sm font-medium text-slate-700">Processing…</span>
          </div>
        </div>
      )}

      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <Sparkles className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className={dashboardPageTitleClass}>AI Profile Assistant</h1>
            <p className={`mt-1 ${dashboardPageSubtitleClass}`}>
              Upload your resume or review your current profile — AI will suggest fields to complete.
            </p>
          </div>
        </div>
      </div>

      <Card className={dashboardCardClass}>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-[16px] font-semibold text-slate-900">Upload & analyze</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
            <Label className="text-slate-700">PDF Resume</Label>
            <Input
              disabled={loading}
              type="file"
              accept="application/pdf"
              className={`mt-2 ${dashboardInputClass}`}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="mt-2 text-[13px] text-slate-500">
                Selected: <span className="font-medium text-slate-700">{file.name}</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={handleUpload}
                disabled={loading || !file}
                className="bg-brand hover:bg-brand-dark"
              >
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "Analyzing..." : "Analyze Resume"}
              </Button>
              <Button
                onClick={reviewCurrentProfile}
                disabled={loading}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Review Current Profile
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Quick merge helpers for arrays */}
              {(experiences.length > 0 || educationItems.length > 0) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="mb-2 text-sm text-slate-500">Detected structured items</div>
                  {experiences.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <Label>Experiences ({experiences.length})</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const merged = experiences.map((e) => [e.role, e.company, e.period].filter(Boolean).join(" — ")).join("\n")
                            setBio((prev) => (prev ? prev + "\n\n" + merged : merged))
                          }}
                        >
                          Merge into Bio
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1 max-h-40 overflow-auto text-sm">
                        {experiences.map((e, i) => (
                          <div key={i} className="rounded-lg border border-slate-200 bg-white p-2">
                            {(e.role || e.company || e.period) ? (
                              <div className="font-medium">{[e.role, e.company, e.period].filter(Boolean).join(" — ")}</div>
                            ) : null}
                            <div className="text-muted-foreground whitespace-pre-wrap">{e.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {educationItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Education Items ({educationItems.length})</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const merged = educationItems.map((e) => [e.institution, e.degree, e.period].filter(Boolean).join(" — ") || e.raw).join("\n")
                            setEducation((prev) => (prev ? prev + "\n\n" + merged : merged))
                          }}
                        >
                          Merge into Education
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1 max-h-40 overflow-auto text-sm">
                        {educationItems.map((e, i) => (
                          <div key={i} className="rounded-lg border border-slate-200 bg-white p-2">
                            <div className="font-medium">{[e.institution, e.degree, e.period].filter(Boolean).join(" — ")}</div>
                            {e.raw && <div className="text-muted-foreground whitespace-pre-wrap">{e.raw}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input className={dashboardInputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input className={dashboardInputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input className={dashboardInputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input className={dashboardInputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input className={dashboardInputClass} type="number" value={yearsExperience as any} onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input className={dashboardInputClass} value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input className={dashboardInputClass} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Suggested Bio / Summary</Label>
                <Textarea className={dashboardInputClass} rows={6} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Education</Label>
                  <Textarea className={dashboardInputClass} rows={6} value={education} onChange={(e) => setEducation(e.target.value)} />
                </div>
                <div>
                  <Label>Certifications</Label>
                  <Textarea className={dashboardInputClass} rows={6} value={certifications} onChange={(e) => setCertifications(e.target.value)} />
                </div>
              </div>

              {Array.isArray(result?.suggestions) && result.suggestions.length > 0 && (
                <div>
                  <Label>AI Suggestions</Label>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground">
                    {result.suggestions.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(result?.rephrased_summaries) && result.rephrased_summaries.length > 0 && (
                <div>
                  <Label>Alternative Rephrases</Label>
                  <div className="space-y-2">
                    {result.rephrased_summaries.map((s: string, i: number) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setBio(s)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-colors hover:border-brand/30 hover:bg-violet-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {result?.review && (
                <div className="space-y-2">
                  <Label>AI Review Suggestions</Label>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground">
                    {(result.review.suggestions || []).map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {Array.isArray(result.review.rephrased_bio) && result.review.rephrased_bio.length > 0 && (
                    <div>
                      <Label>Rephrased Bio Options</Label>
                      <div className="space-y-2">
                        {result.review.rephrased_bio.map((s: string, i: number) => (
                          <button key={i} type="button" onClick={() => setBio(s)} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-colors hover:border-brand/30 hover:bg-violet-50">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.review.suggested_updates && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.review.suggested_updates).map(([k, v]: any) => (
                        <Button
                          key={k}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const setter: any = {
                              bio: setBio,
                              location: setLocation,
                              years_experience: (val: any) => setYearsExperience(Number(val)),
                              hourly_rate: () => {},
                              availability: () => {},
                              education: setEducation,
                              certifications: setCertifications,
                              website: setWebsite,
                              linkedin: setLinkedin,
                              preferred_contact_method: () => {},
                            }[k]
                            if (setter) setter(v)
                          }}
                        >
                          Apply {k}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <Button onClick={applyUpdates} disabled={loading} className="bg-brand hover:bg-brand-dark">
                  {loading ? "Applying..." : "Apply to Profile"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
