import { NextResponse, type NextRequest } from "next/server"

import { SPECIALTIES } from "@/lib/constants"

const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://api.prozlab.com"

const isFrontendHost = (host: string) => {
  const normalized = host.toLowerCase()
  return normalized === "prozlab.com" || normalized === "www.prozlab.com"
}

const getBackendBaseUrl = (requestHost?: string | null) => {
  const candidates = [
    process.env.PROZLAB_BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    DEFAULT_BACKEND_URL,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue

    try {
      const trimmed = candidate.replace(/\/+$/, "")
      const parsed = new URL(trimmed)
      const hostname = parsed.hostname.toLowerCase()
      if (
        isFrontendHost(hostname) ||
        hostname === "app.prozlab.com" ||
        (isFrontendHost(parsed.host) && (!requestHost || isFrontendHost(requestHost)))
      ) {
        continue
      }
      return trimmed
    } catch {
      continue
    }
  }

  return DEFAULT_BACKEND_URL
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const backendBaseUrl = getBackendBaseUrl(request.headers.get("host"))
  const targetUrl = new URL("/api/v1/proz/specialties", backendBaseUrl)
  targetUrl.searchParams.set("ngrok-skip-browser-warning", "true")

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`)
    }

    const payload = await response.text()
    return new NextResponse(payload, {
      status: response.status,
      headers: jsonHeaders,
    })
  } catch (error) {
    console.error("Proxy error fetching specialties:", error)
    console.info("Serving fallback specialties from shared constants")
    return NextResponse.json([...SPECIALTIES], {
      status: 200,
      headers: jsonHeaders,
    })
  }
}
