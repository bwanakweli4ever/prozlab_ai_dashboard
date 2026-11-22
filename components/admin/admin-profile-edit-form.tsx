"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Loader2, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { AdminProfileUpdate } from "@/lib/api"

type Status = "pending" | "verified" | "rejected"

/** The profile fields the form reads; matches the admin profile detail response. */
export type EditableProfile = {
  first_name: string
  last_name: string
  email?: string
  phone_number?: string | null
  bio?: string | null
  location?: string | null
  years_experience?: number | null
  hourly_rate?: number | null
  availability?: string | null
  education?: string | null
  certifications?: string | null
  website?: string | null
  linkedin?: string | null
  preferred_contact_method?: string | null
  skills?: string[] | null
  verification_status?: string | null
  is_featured?: boolean | null
}

type FormState = {
  first_name: string
  last_name: string
  phone_number: string
  location: string
  bio: string
  years_experience: string
  hourly_rate: string
  availability: string
  skills: string
  education: string
  certifications: string
  website: string
  linkedin: string
  preferred_contact_method: string
  verification_status: Status
  is_featured: boolean
}

const AVAILABILITY = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
]

const CONTACT = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Website" },
]

const STATUS: { value: Status; label: string }[] = [
  { value: "pending", label: "Pending review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
]

const fieldClass =
  "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"

function toState(p: EditableProfile): FormState {
  const status = (["pending", "verified", "rejected"].includes(p.verification_status || "") ? p.verification_status : "pending") as Status
  return {
    first_name: p.first_name || "",
    last_name: p.last_name || "",
    phone_number: p.phone_number || "",
    location: p.location || "",
    bio: p.bio || "",
    years_experience: p.years_experience != null ? String(p.years_experience) : "",
    hourly_rate: p.hourly_rate ? String(p.hourly_rate) : "",
    availability: p.availability || "",
    skills: (p.skills || []).join(", "),
    education: p.education || "",
    certifications: p.certifications || "",
    website: p.website || "",
    linkedin: p.linkedin || "",
    preferred_contact_method: p.preferred_contact_method || "email",
    verification_status: status,
    is_featured: Boolean(p.is_featured),
  }
}

function splitSkills(value: string): string[] {
  const seen = new Set<string>()
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))
}

function toNumber(value: string): number | null {
  const n = Number(value)
  return value.trim() === "" || Number.isNaN(n) ? null : n
}

/** Only the fields that changed, in the shape the admin update endpoint takes. */
function diff(initial: FormState, current: FormState): AdminProfileUpdate {
  const out: AdminProfileUpdate = {}
  const text = [
    "first_name", "last_name", "phone_number", "location", "bio", "availability", "education",
    "certifications", "website", "linkedin", "preferred_contact_method",
  ] as const
  for (const key of text) {
    if (current[key].trim() !== initial[key].trim()) (out as Record<string, unknown>)[key] = current[key].trim() || null
  }
  if (current.years_experience !== initial.years_experience) {
    const n = toNumber(current.years_experience)
    out.years_experience = n == null ? null : Math.round(n)
  }
  if (current.hourly_rate !== initial.hourly_rate) out.hourly_rate = toNumber(current.hourly_rate)
  if (splitSkills(current.skills).join("|") !== splitSkills(initial.skills).join("|")) out.skills = splitSkills(current.skills)
  if (current.verification_status !== initial.verification_status) out.verification_status = current.verification_status
  if (current.is_featured !== initial.is_featured) out.is_featured = current.is_featured
  return out
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-[13px] text-slate-500">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  id,
  label,
  hint,
  wide,
  children,
}: {
  id: string
  label: string
  hint?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-slate-500">{hint}</p>}
    </div>
  )
}

export function AdminProfileEditForm({
  profile,
  saving,
  onCancel,
  onSave,
}: {
  profile: EditableProfile
  saving: boolean
  onCancel: () => void
  onSave: (changes: AdminProfileUpdate) => void
}) {
  const initial = useMemo(() => toState(profile), [profile])
  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState<string | null>(null)
  const changes = diff(initial, form)
  const changeCount = Object.keys(changes).length
  const skills = splitSkills(form.skills)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setError(null)
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Only verified profiles can appear on /proz
      if (key === "verification_status" && value !== "verified") next.is_featured = false
      return next
    })
  }

  const input = (key: keyof FormState, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      id={key}
      value={form[key] as string}
      onChange={(e) => set(key, e.target.value as never)}
      className={fieldClass}
      {...props}
    />
  )

  const submit = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required.")
      return
    }
    if (form.hourly_rate && toNumber(form.hourly_rate) == null) {
      setError("Hourly rate must be a number.")
      return
    }
    onSave(changes)
  }

  return (
    <div className="space-y-4">
      <Section title="Basics">
        <Field id="first_name" label="First name">
          {input("first_name", { autoComplete: "off" })}
        </Field>
        <Field id="last_name" label="Last name">
          {input("last_name", { autoComplete: "off" })}
        </Field>
        <Field id="phone_number" label="Phone">
          {input("phone_number", { maxLength: 20, placeholder: "Not added" })}
        </Field>
        <Field id="location" label="Location">
          {input("location", { maxLength: 255, placeholder: "City, state" })}
        </Field>
      </Section>

      <Section title="About">
        <Field id="bio" label="Bio" wide hint={`${form.bio.trim().length} characters`}>
          <textarea
            id="bio"
            rows={5}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            className={`${fieldClass} resize-y leading-relaxed`}
            placeholder="A short summary of their experience"
          />
        </Field>
      </Section>

      <Section title="Work">
        <Field id="years_experience" label="Years of experience">
          {input("years_experience", { type: "number", min: 0, max: 70, inputMode: "numeric", placeholder: "Not set" })}
        </Field>
        <Field id="hourly_rate" label="Hourly rate (USD)" hint="Leave empty if they haven't set one.">
          {input("hourly_rate", { type: "number", min: 0, step: "1", inputMode: "decimal", placeholder: "Not set" })}
        </Field>
        <Field id="availability" label="Availability">
          <select
            id="availability"
            value={form.availability}
            onChange={(e) => set("availability", e.target.value)}
            className={fieldClass}
          >
            <option value="">Not set</option>
            {AVAILABILITY.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            {form.availability && !AVAILABILITY.some((o) => o.value === form.availability) && (
              <option value={form.availability}>{form.availability}</option>
            )}
          </select>
        </Field>
        <Field id="skills" label="Skills" wide hint="Separate skills with commas.">
          {input("skills", { placeholder: "e.g. Networking, Microsoft 365, Python" })}
          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[12px] font-medium text-indigo-700">
                  {s}
                </span>
              ))}
            </div>
          )}
        </Field>
      </Section>

      <Section title="Education & certifications" hint="One item per line reads best on their profile.">
        <Field id="education" label="Education" wide>
          <textarea
            id="education"
            rows={4}
            value={form.education}
            onChange={(e) => set("education", e.target.value)}
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </Field>
        <Field id="certifications" label="Certifications" wide>
          <textarea
            id="certifications"
            rows={3}
            value={form.certifications}
            onChange={(e) => set("certifications", e.target.value)}
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </Field>
      </Section>

      <Section title="Links & contact">
        <Field id="website" label="Website">
          {input("website", { maxLength: 255, placeholder: "https://" })}
        </Field>
        <Field id="linkedin" label="LinkedIn">
          {input("linkedin", { maxLength: 255, placeholder: "https://linkedin.com/in/…" })}
        </Field>
        <Field id="preferred_contact_method" label="Preferred contact">
          <select
            id="preferred_contact_method"
            value={form.preferred_contact_method}
            onChange={(e) => set("preferred_contact_method", e.target.value)}
            className={fieldClass}
          >
            {CONTACT.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Status & visibility" hint="Changing the status here doesn't email them. Use Talent Verification to approve with an email.">
        <Field id="verification_status" label="Verification status">
          <select
            id="verification_status"
            value={form.verification_status}
            onChange={(e) => set("verification_status", e.target.value as Status)}
            className={fieldClass}
          >
            {STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 sm:mt-6">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Featured on /proz
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {form.verification_status === "verified" ? "Shows on the public experts page." : "Verify them first."}
            </p>
          </div>
          <Switch
            checked={form.is_featured}
            disabled={form.verification_status !== "verified"}
            onCheckedChange={(v) => set("is_featured", v)}
            aria-label="Featured on /proz"
          />
        </div>
      </Section>

      <div className="sticky -bottom-6 -mx-6 -mb-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <p className={`text-[13px] ${error ? "font-medium text-red-600" : "text-slate-500"}`}>
          {error ?? (changeCount === 0 ? "No changes yet" : `${changeCount} field${changeCount === 1 ? "" : "s"} changed`)}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || changeCount === 0} className="bg-brand text-white hover:bg-brand-dark">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
