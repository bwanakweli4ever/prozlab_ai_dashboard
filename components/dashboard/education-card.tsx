import { GraduationCap } from "lucide-react"

type Section = { heading: string | null; items: string[] }

const BULLETS = /^[\s•·\-–—*▪●◦]+/
const INSTITUTION = /\b(university|college|school|institute|academy|polytechnic|ecole|école|universit[éy])\b/i

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

/** A short ALL-CAPS line such as "TECHNICAL SKILLS" or "LANGUAGE" starts a new group. */
function isHeading(line: string): boolean {
  const letters = line.replace(/[^A-Za-z]/g, "")
  return letters.length >= 4 && letters === letters.toUpperCase() && line.split(/\s+/).length <= 4 && !/\d/.test(line)
}

/**
 * Education text often arrives as raw CV text: page numbers, the person's name, and other sections
 * (skills, languages) mixed in. Split it into tidy groups for display; nothing is changed in the data.
 */
export function parseEducation(text: string, fullName: string): Section[] {
  const name = fullName.trim().toLowerCase()
  const lines = text
    .split(/\r?\n|\s{3,}/)
    .map((l) => l.replace(BULLETS, "").trim())
    .filter(Boolean)
    .filter((l) => !/^page\s*\d+$/i.test(l))
    .filter((l) => !(name && l.toLowerCase().includes(name) && l.length < 80))

  const sections: Section[] = [{ heading: null, items: [] }]
  for (const line of lines) {
    if (isHeading(line)) {
      sections.push({ heading: titleCase(line), items: [] })
    } else {
      sections[sections.length - 1].items.push(line)
    }
  }
  return sections.filter((s) => s.items.length > 0)
}

/** Group education lines into entries: a school line starts an entry, the lines after it are its details. */
function toEntries(items: string[]): { title: string; details: string[] }[] {
  const entries: { title: string; details: string[] }[] = []
  for (const item of items) {
    if (entries.length === 0 || INSTITUTION.test(item)) entries.push({ title: item, details: [] })
    else entries[entries.length - 1].details.push(item)
  }
  return entries
}

export function EducationCard({
  education,
  certifications,
  fullName,
}: {
  education?: string | null
  certifications?: string | null
  fullName: string
}) {
  const sections = parseEducation(education || "", fullName)
  const certItems = (certifications || "")
    .split(/\r?\n|[,;]/)
    .map((c) => c.replace(BULLETS, "").trim())
    .filter((c) => c && c.length <= 80 && !isHeading(c))
  if (sections.length === 0 && certItems.length === 0) return null

  const educationSection = sections.find((s) => s.heading === null || /educat|degree|academ/i.test(s.heading))
  const otherSections = sections.filter((s) => s !== educationSection)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
        <GraduationCap className="h-4 w-4 text-brand" />
        Education
      </h2>

      {educationSection && (
        <ul className="mt-4 space-y-3">
          {toEntries(educationSection.items).map((entry, i) => (
            <li key={i} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-[14px] font-semibold text-slate-900">{entry.title}</p>
              {entry.details.map((d, j) => (
                <p key={j} className="mt-0.5 text-[13px] text-slate-600">
                  {d}
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}

      {otherSections.map((section) => (
        <div key={section.heading} className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{section.heading}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {section.items.map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}

      {certItems.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Certifications</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from(new Set(certItems)).map((item) => (
              <span key={item} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[12px] font-medium text-indigo-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
