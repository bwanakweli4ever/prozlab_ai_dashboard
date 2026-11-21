import type { ProzProfileCreate } from "@/types/api"

/**
 * New accounts must verify their email before the API allows a login, so the
 * sign-up wizard can't create the profile right away. Its answers are kept here
 * and applied the first time that account signs in.
 */
const STORAGE_KEY = "prozlab.pendingOnboardingProfile"

type PendingOnboarding = { email: string; profile: ProzProfileCreate; savedAt: string }

const normalizeEmail = (email: string) => email.trim().toLowerCase()

/** True when a login was refused only because the account's email isn't verified yet. */
export function isEmailVerificationRequired(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return /verify your email/i.test(message)
}

export function savePendingOnboarding(email: string, profile: ProzProfileCreate): void {
  try {
    const record: PendingOnboarding = { email: normalizeEmail(email), profile, savedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Storage unavailable: the professional can still complete the profile from the dashboard.
  }
}

/** The saved answers for this email, if any. Clear them only once the profile exists. */
export function peekPendingOnboarding(email: string): ProzProfileCreate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const record = JSON.parse(raw) as PendingOnboarding
    return record.email === normalizeEmail(email) ? record.profile : null
  } catch {
    return null
  }
}

export function clearPendingOnboarding(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}
