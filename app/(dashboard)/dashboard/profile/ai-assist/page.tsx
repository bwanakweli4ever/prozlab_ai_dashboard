// app/(dashboard)/dashboard/profile/ai-assist/page.tsx
"use client"

import { useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { API_BASE_URL, describeAiError, resumeApi } from "@/lib/api"
import { ResumeCard } from "@/components/dashboard/resume-card"
import { ProfileCelebration } from "@/components/dashboard/profile-celebration"
import { computeProfileCompletion } from "@/lib/profile-completion"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Loader2, Sparkles, X } from "lucide-react"
import {
  dashboardCardClass,
  dashboardInputClass,
  dashboardPageSubtitleClass,
  dashboardPageTitleClass,
} from "@/lib/dashboard-styles"

export default function AIAssistProfilePage() {
  const { token, isAuthenticated, user } = useAuth()
  const { profile, fetchProfile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [celebration, setCelebration] = useState<{ before: number; after: number; added: string[] } | null>(null)

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
  const goToProfile = useCallback(() => router.push("/dashboard/profile/view"), [router])

  const analyzeCv = async () => {
    if (!isAuthenticated || !token) {
      toast({ title: "Please log in", description: "You need to be signed in to use AI Assist", variant: "destructive" })
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const data = await resumeApi.analyzeSaved(token)
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
      if (Array.isArray(ex.skills)) setSkills(ex.skills.filter(Boolean))
      if (Array.isArray(ex.experiences)) setExperiences(ex.experiences)
      if (Array.isArray(ex.education_items)) setEducationItems(ex.education_items)
      toast(
        data?.meta?.ai_used === false
          ? { title: "Read the basics from your CV", description: "AI wasn't available, so check each field." }
          : { title: "CV analyzed", description: "Review the fields below, then apply them to your profile." },
      )
    } catch (e: any) {
      toast({ title: "Could not analyze your CV", description: e?.message || "Try again", variant: "destructive" })
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
      if (skills.length > 0) payload.skills = skills

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
      const saved = await res.json()
      const before = computeProfileCompletion(profile).percentage
      const after = computeProfileCompletion({ ...(profile || {}), ...saved }).percentage
      const added = [
        bio && "Bio",
        skills.length > 0 && "Skills",
        location && "Location",
        phoneNumber && "Phone",
        yearsExperience !== "" && "Experience",
        (linkedin || website) && "Links",
        (education || certifications) && "Education",
      ].filter(Boolean) as string[]
      await fetchProfile()
      setCelebration({ before, after, added })
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
      {celebration && (
        <ProfileCelebration
          before={celebration.before}
          after={celebration.after}
          added={celebration.added}
          onContinue={goToProfile}
        />
      )}
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
              Add your CV and AI fills in your profile for you to check. Or ask AI to review what you have.
            </p>
          </div>
        </div>
      </div>

      <Card className={dashboardCardClass}>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-[16px] font-semibold text-slate-900">From your CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <ResumeCard showAiLink={false} className="shadow-none" />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={analyzeCv}
              disabled={loading || !profile?.resume_filename}
              className="bg-brand hover:bg-brand-dark"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Analyzing..." : "Fill my profile from my CV"}
            </Button>
            <Button
              onClick={reviewCurrentProfile}
              disabled={loading}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Review current profile
            </Button>
          </div>

          {result?.meta?.ai_used === false && (
            <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <span className="font-semibold">AI wasn&apos;t used this time.</span> {describeAiError(result.meta.ai_error)} We
                read the basics from your CV, so check every field before applying.
              </p>
            </div>
          )}
          {result?.review?.ai_used === false && (
            <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <span className="font-semibold">AI review isn&apos;t available right now.</span>{" "}
                {describeAiError(result.review.ai_error)} The tips below are basic checks only.
              </p>
            </div>
          )}

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

              {skills.length > 0 && (
                <div>
                  <Label>Skills from your CV</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[12.5px] font-medium text-indigo-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                          className="rounded-full p-0.5 hover:bg-indigo-100"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="sticky bottom-0 z-10 -mx-6 flex flex-col gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-slate-500">Check the fields above, then save them to your profile.</p>
                <Button onClick={applyUpdates} disabled={loading} className="h-11 bg-brand px-6 text-white hover:bg-brand-dark">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {loading ? "Saving..." : "Apply to my profile"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
