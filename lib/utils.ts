import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const DEFAULT_MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_DEV_FORCE_LOCALHOST === "true"
    ? "https://app.prozlab.com"
    : process.env.NEXT_PUBLIC_API_URL || "https://app.prozlab.com/"
).replace(/\/+$/, "")

const UNSAFE_MEDIA_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"])

export function normalizeMediaUrl(value?: string | null, baseUrl: string = DEFAULT_MEDIA_BASE_URL): string | null {
  if (!value || typeof value !== "string") return null

  const sanitizedBase = baseUrl.replace(/\/+$/, "")

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value)
      if (UNSAFE_MEDIA_HOSTS.has(parsed.hostname.toLowerCase())) {
        return `${sanitizedBase}${parsed.pathname}${parsed.search}${parsed.hash}`
      }
      return value
    } catch {
      // fall through to relative handling
    }
  }

  const path = value.startsWith("/") ? value : `/${value}`
  return `${sanitizedBase}${path}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
