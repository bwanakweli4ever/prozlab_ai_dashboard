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
import { Loader2 } from "lucide-react"

export default function AIAssistProfilePage() {
  const { token, isAuthenticated } = useAuth()
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
      const payload: any = {}
      if (firstName) payload.first_name = firstName
      if (lastName) payload.last_name = lastName
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
      if (!res.ok) throw new Error(await res.text())
      toast({ title: "Profile updated" })
      router.push("/dashboard/profile/view")
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
    <div className="relative p-4 md:p-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-md shadow">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Processing…</span>
          </div>
        </div>
      )}
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>AI Resume Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Upload PDF Resume</Label>
            <Input disabled={loading} type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={handleUpload} disabled={loading || !file} className="mt-2">
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
            <Button onClick={reviewCurrentProfile} disabled={loading} variant="secondary" className="mt-2 ml-2">
              {loading ? "..." : "Review Current Profile (AI)"}
            </Button>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Quick merge helpers for arrays */}
              {(experiences.length > 0 || educationItems.length > 0) && (
                <div className="rounded border p-3">
                  <div className="text-sm text-muted-foreground mb-2">Detected structured items</div>
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
                          <div key={i} className="p-2 border rounded">
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
                          <div key={i} className="p-2 border rounded">
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
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input type="number" value={yearsExperience as any} onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Suggested Bio / Summary</Label>
                <Textarea rows={6} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Education</Label>
                  <Textarea rows={6} value={education} onChange={(e) => setEducation(e.target.value)} />
                </div>
                <div>
                  <Label>Certifications</Label>
                  <Textarea rows={6} value={certifications} onChange={(e) => setCertifications(e.target.value)} />
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
                        className="w-full text-left p-3 border rounded text-sm hover:bg-muted"
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
                          <button key={i} type="button" onClick={() => setBio(s)} className="w-full text-left p-3 border rounded text-sm hover:bg-muted">
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

              <div className="flex justify-end">
                <Button onClick={applyUpdates} disabled={loading}>
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
