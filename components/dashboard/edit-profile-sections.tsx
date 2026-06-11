"use client"

import { useEffect, useState, type ElementType } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  Sparkles,
  User,
  Wand2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { mediaApi, prozApi } from "@/lib/api"
import {
  dashboardCardClass,
  dashboardInputClass,
  dashboardPageSubtitleClass,
  dashboardPageTitleClass,
} from "@/lib/dashboard-styles"
import type { ProzProfileResponse, ProzProfileUpdate } from "@/types/api"
import { cn } from "@/lib/utils"

type SectionId = "personal" | "summary" | "experience" | "education" | "contact"

type FormValues = {
  firstName: string
  lastName: string
  phoneNumber: string
  location: string
  bio: string
  yearsExperience: number
  hourlyRate: number
  availability: string
  education: string
  certifications: string
  website: string
  linkedin: string
  preferredContactMethod: string
}

const SECTIONS: {
  id: SectionId
  title: string
  description: string
  icon: ElementType
  fields: (keyof FormValues)[]
}[] = [
  {
    id: "personal",
    title: "Personal Info",
    description: "Name, photo & location",
    icon: User,
    fields: ["firstName", "lastName", "phoneNumber", "location"],
  },
  {
    id: "summary",
    title: "Professional Summary",
    description: "Your bio & headline",
    icon: FileText,
    fields: ["bio"],
  },
  {
    id: "experience",
    title: "Experience & Rate",
    description: "Years, rate & availability",
    icon: Briefcase,
    fields: ["yearsExperience", "hourlyRate", "availability"],
  },
  {
    id: "education",
    title: "Education & Certs",
    description: "Degrees & qualifications",
    icon: GraduationCap,
    fields: ["education", "certifications"],
  },
  {
    id: "contact",
    title: "Links & Contact",
    description: "Website, LinkedIn & prefs",
    icon: Link2,
    fields: ["website", "linkedin", "preferredContactMethod"],
  },
]

const API_FIELD_MAP: Record<keyof FormValues, keyof ProzProfileUpdate> = {
  firstName: "first_name",
  lastName: "last_name",
  phoneNumber: "phone_number",
  location: "location",
  bio: "bio",
  yearsExperience: "years_experience",
  hourlyRate: "hourly_rate",
  availability: "availability",
  education: "education",
  certifications: "certifications",
  website: "website",
  linkedin: "linkedin",
  preferredContactMethod: "preferred_contact_method",
}

const SNAKE_TO_FORM: Record<string, keyof FormValues> = Object.fromEntries(
  Object.entries(API_FIELD_MAP).map(([k, v]) => [v, k as keyof FormValues])
) as Record<string, keyof FormValues>

type AiResult = {
  suggestions?: string[]
  suggested_updates?: Record<string, unknown>
  rephrased_bio?: string[]
}

function formToDraft(values: FormValues, email?: string | null) {
  return {
    first_name: values.firstName,
    last_name: values.lastName,
    email: email || undefined,
    phone_number: values.phoneNumber || undefined,
    location: values.location || undefined,
    bio: values.bio || undefined,
    years_experience: values.yearsExperience || undefined,
    hourly_rate: values.hourlyRate || undefined,
    availability: values.availability || undefined,
    education: values.education || undefined,
    certifications: values.certifications || undefined,
    website: values.website || undefined,
    linkedin: values.linkedin || undefined,
    preferred_contact_method: values.preferredContactMethod || undefined,
  }
}

interface EditProfileSectionsProps {
  profile: ProzProfileResponse
}

export function EditProfileSections({ profile }: EditProfileSectionsProps) {
  const router = useRouter()
  const { token, user } = useAuth()
  const { updateProfile, fetchProfile } = useProfile()
  const [activeSection, setActiveSection] = useState<SectionId>("personal")
  const [savingSection, setSavingSection] = useState<SectionId | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      location: "",
      bio: "",
      yearsExperience: 0,
      hourlyRate: 0,
      availability: "",
      education: "",
      certifications: "",
      website: "",
      linkedin: "",
      preferredContactMethod: "email",
    },
  })

  useEffect(() => {
    form.reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      phoneNumber: profile.phone_number ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      yearsExperience: profile.years_experience ?? 0,
      hourlyRate: profile.hourly_rate ?? 0,
      availability: profile.availability ?? "",
      education: profile.education ?? "",
      certifications: profile.certifications ?? "",
      website: profile.website ?? "",
      linkedin: profile.linkedin ?? "",
      preferredContactMethod: profile.preferred_contact_method ?? "email",
    })
  }, [profile, form])

  const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection)
  const currentSection = SECTIONS[currentIndex]

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return
    setIsUploadingImage(true)
    try {
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      const result = await mediaApi.uploadProfileImage(file, token)
      if (result?.url) {
        await updateProfile({ profile_image_url: result.url })
      }
      await fetchProfile()
      toast({ title: "Photo updated" })
      setImagePreview(null)
    } catch {
      toast({ title: "Upload failed", variant: "destructive" })
      setImagePreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const buildSectionPayload = (sectionId: SectionId): ProzProfileUpdate => {
    const section = SECTIONS.find((s) => s.id === sectionId)!
    const values = form.getValues()
    const payload: ProzProfileUpdate = {}
    for (const field of section.fields) {
      const apiKey = API_FIELD_MAP[field]
      const val = values[field]
      if (field === "yearsExperience" || field === "hourlyRate") {
        ;(payload as Record<string, unknown>)[apiKey] = Number(val) || 0
      } else {
        ;(payload as Record<string, unknown>)[apiKey] = val ?? ""
      }
    }
    return payload
  }

  const saveSection = async (sectionId: SectionId) => {
    setSavingSection(sectionId)
    try {
      await updateProfile(buildSectionPayload(sectionId))
      toast({ title: "Section saved", description: `${SECTIONS.find((s) => s.id === sectionId)?.title} updated.` })
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSavingSection(null)
    }
  }

  const improveSection = async () => {
    if (!token) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const draft = formToDraft(form.getValues(), user?.email)
      const result = await prozApi.reviewDraft(token, draft)
      setAiResult({
        suggestions: result.suggestions,
        suggested_updates: result.suggested_updates,
        rephrased_bio: result.rephrased_bio,
      })
      toast({ title: "AI suggestions ready", description: "Review and apply improvements below." })
    } catch (error) {
      toast({
        title: "AI assist failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
    }
  }

  const applySnakeField = (snakeKey: string, value: unknown) => {
    const formKey = SNAKE_TO_FORM[snakeKey]
    if (!formKey) return
    if (formKey === "yearsExperience" || formKey === "hourlyRate") {
      form.setValue(formKey, Number(value) || 0)
    } else {
      form.setValue(formKey, String(value ?? ""))
    }
  }

  const sectionSnakeFields = new Set(
    currentSection.fields.map((f) => API_FIELD_MAP[f])
  )

  const relevantUpdates = aiResult?.suggested_updates
    ? Object.entries(aiResult.suggested_updates).filter(([k]) => sectionSnakeFields.has(k as keyof ProzProfileUpdate))
    : []

  const showRephrasedBio = activeSection === "summary" && (aiResult?.rephrased_bio?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/dashboard/profile/view"
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
        <h1 className={dashboardPageTitleClass}>Edit Profile</h1>
        <p className={dashboardPageSubtitleClass}>
          Complete one section at a time. Use AI to polish each part before saving.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav className={cn(dashboardCardClass, "h-fit p-2 lg:sticky lg:top-20")}>
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
          <ul className="space-y-0.5">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon
              const active = activeSection === section.id
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id)
                      setAiResult(null)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        active ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight">{section.title}</p>
                      <p className="truncate text-[11px] text-slate-400">{section.description}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 border-t border-slate-100 px-2 pt-3">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-brand">
              <Link href="/dashboard/profile/ai-assist">
                <Sparkles className="mr-2 h-4 w-4" />
                Full AI Assist
              </Link>
            </Button>
          </div>
        </nav>

        {/* Active section */}
        <div className="space-y-4">
          <div className={cn(dashboardCardClass, "overflow-hidden")}>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                  <currentSection.icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">{currentSection.title}</h2>
                  <p className="text-[13px] text-slate-500">{currentSection.description}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={aiLoading}
                onClick={improveSection}
                className="shrink-0 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
              >
                {aiLoading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-1.5 h-4 w-4" />
                )}
                AI Improve
              </Button>
            </div>

            <Form {...form}>
              <form className="px-6 py-5" onSubmit={(e) => e.preventDefault()}>
                {activeSection === "personal" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow ring-2 ring-brand/20">
                        {imagePreview ? (
                          <Image src={imagePreview} alt="Preview" width={96} height={96} className="h-full w-full object-cover" />
                        ) : profile.profile_image_url ? (
                          <Image
                            src={profile.profile_image_url}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white">
                            {profile.first_name?.[0]}
                            {profile.last_name?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id="profile-photo"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingImage}
                          onClick={() => document.getElementById("profile-photo")?.click()}
                        >
                          {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                          Upload photo
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl><Input className={dashboardInputClass} {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl><Input className={dashboardInputClass} {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input className={dashboardInputClass} placeholder="+250 ..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input className={dashboardInputClass} placeholder="Kigali, Rwanda" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {activeSection === "summary" && (
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional bio</FormLabel>
                      <FormControl>
                        <Textarea
                          className={cn(dashboardInputClass, "min-h-[160px] py-3")}
                          placeholder="Summarize your experience, specialties, and impact..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Visible on your public profile. AI can rephrase this section.</FormDescription>
                    </FormItem>
                  )} />
                )}

                {activeSection === "experience" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of experience</FormLabel>
                        <FormControl>
                          <Input className={dashboardInputClass} type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly rate ($)</FormLabel>
                        <FormControl>
                          <Input className={dashboardInputClass} type="number" min={0} step={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="availability" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Availability</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={dashboardInputClass}>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["full-time", "part-time", "contract", "freelance"].map((v) => (
                              <SelectItem key={v} value={v}>{v.replace("-", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                )}

                {activeSection === "education" && (
                  <div className="space-y-4">
                    <FormField control={form.control} name="education" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Textarea className={cn(dashboardInputClass, "min-h-[120px] py-3")} placeholder="Degrees, institutions, years..." {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="certifications" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Textarea className={cn(dashboardInputClass, "min-h-[100px] py-3")} placeholder="AWS, Coursera, vendor certs..." {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {activeSection === "contact" && (
                  <div className="space-y-4">
                    <FormField control={form.control} name="website" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website / portfolio</FormLabel>
                        <FormControl><Input className={dashboardInputClass} placeholder="https://..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="linkedin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl><Input className={dashboardInputClass} placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="preferredContactMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred contact</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={dashboardInputClass}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["email", "phone", "linkedin", "website"].map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                )}
              </form>
            </Form>

            {/* AI suggestions panel */}
            {aiResult && (relevantUpdates.length > 0 || showRephrasedBio || (aiResult.suggestions?.length ?? 0) > 0) && (
              <div className="border-t border-violet-100 bg-violet-50/50 px-6 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-violet-800">
                    <Sparkles className="h-4 w-4" />
                    AI suggestions for this section
                  </p>
                  <button type="button" onClick={() => setAiResult(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-[12px] text-slate-600">
                    {aiResult.suggestions.slice(0, 4).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
                {showRephrasedBio && (
                  <div className="mb-3 space-y-2">
                    <p className="text-[11px] font-semibold uppercase text-violet-600">Rephrased bio options</p>
                    {aiResult.rephrased_bio!.map((text, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => form.setValue("bio", text)}
                        className="block w-full rounded-lg border border-violet-200 bg-white p-3 text-left text-[12px] text-slate-700 hover:border-brand"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}
                {relevantUpdates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {relevantUpdates.map(([key, val]) => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-violet-200 bg-white text-[12px]"
                        onClick={() => applySnakeField(key, val)}
                      >
                        Apply {key.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                disabled={currentIndex === 0}
                onClick={() => setActiveSection(SECTIONS[currentIndex - 1].id)}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingSection === activeSection}
                  onClick={() => saveSection(activeSection)}
                >
                  {savingSection === activeSection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Save section
                </Button>
                {currentIndex < SECTIONS.length - 1 ? (
                  <Button
                    type="button"
                    className="bg-brand hover:bg-brand-dark"
                    onClick={() => setActiveSection(SECTIONS[currentIndex + 1].id)}
                  >
                    Next
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" className="bg-brand hover:bg-brand-dark" onClick={() => router.push("/dashboard/profile/view")}>
                    View profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[12px] text-slate-400">
            Section {currentIndex + 1} of {SECTIONS.length} · Changes save per section
          </p>
        </div>
      </div>
    </div>
  )
}
