import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const DEFAULT_MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://api.prozlab.com")
).replace(/\/+$/, "")

const UNSAFE_MEDIA_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"])

export function normalizeMediaUrl(value?: string | null, baseUrl: string = DEFAULT_MEDIA_BASE_URL): string | null {
  if (!value || typeof value !== "string") return null

  const sanitizedBase = baseUrl.replace(/\/+$/, "")

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value)
      if (UNSAFE_MEDIA_HOSTS.has(parsed.hostname.toLowerCase())) {
        let path = `${parsed.pathname}${parsed.search}${parsed.hash}`
        if (path.startsWith("/uploads/")) {
          path = `/static/${path.slice("/uploads/".length)}`
        }
        return `${sanitizedBase}${path}`
      }
      return value
    } catch {
      // fall through to relative handling
    }
  }

  let path = value.startsWith("/") ? value : `/${value}`
  if (path.startsWith("/uploads/")) {
    path = `/static/${path.slice("/uploads/".length)}`
  }
  return `${sanitizedBase}${path}`
}

export function getProfileImageUrl(
  value?: string | null,
  fallback = "/placeholder.svg"
): string {
  return normalizeMediaUrl(value) ?? fallback
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
