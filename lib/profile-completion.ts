import type { ProzProfileResponse } from "@/types/api"

/** One step toward a complete profile. The same list drives every progress number in the dashboard. */
export type CompletionItem = { key: string; label: string; done: boolean }

// Bios the sign-up wizard writes automatically; they don't count as the person's own bio.
const AUTO_BIO = /^Professional (with |looking to provide quality services)/

const filled = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== ""

export function profileChecklist(profile: Partial<ProzProfileResponse> | null | undefined): CompletionItem[] {
  if (!profile) return []
  const bio = (profile.bio || "").trim()
  const verification = profile.skill_verification_status || "not_started"
  return [
    { key: "cv", label: "Upload your CV", done: filled(profile.resume_filename) },
    { key: "bio", label: "Write a short bio", done: bio.length >= 80 && !AUTO_BIO.test(bio) },
    { key: "skills", label: "List your skills", done: (profile.skills?.length ?? 0) > 0 },
    { key: "photo", label: "Add a profile photo", done: filled(profile.profile_image_url) },
    { key: "location", label: "Add your location", done: filled(profile.location) },
    { key: "phone", label: "Add a phone number", done: filled(profile.phone_number) },
    { key: "experience", label: "Add your years of experience", done: (profile.years_experience ?? 0) > 0 },
    { key: "rate", label: "Set your hourly rate", done: (profile.hourly_rate ?? 0) > 0 },
    { key: "links", label: "Add LinkedIn or a website", done: filled(profile.linkedin) || filled(profile.website) },
    {
      key: "education",
      label: "Add education or certifications",
      done: filled(profile.education) || filled(profile.certifications),
    },
    { key: "verify", label: "Start skill verification", done: verification !== "not_started" },
  ]
}

export function computeProfileCompletion(profile: Partial<ProzProfileResponse> | null | undefined): {
  percentage: number
  missingFields: string[]
} {
  const items = profileChecklist(profile)
  if (items.length === 0) return { percentage: 0, missingFields: [] }
  const done = items.filter((item) => item.done).length
  return {
    percentage: Math.round((done / items.length) * 100),
    missingFields: items.filter((item) => !item.done).map((item) => item.label),
  }
}
