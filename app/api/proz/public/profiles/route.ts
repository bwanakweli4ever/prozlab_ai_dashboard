import { promises as fs } from "fs"
import path from "path"
import { NextResponse, type NextRequest } from "next/server"

const DEFAULT_BACKEND_URL = "https://app.prozlab.com"

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
      if (isFrontendHost(parsed.host) && (!requestHost || isFrontendHost(requestHost))) {
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
  const fallbackHeaders = new Headers()
  fallbackHeaders.set("Content-Type", "application/json")
  fallbackHeaders.set("Cache-Control", "no-store")
  fallbackHeaders.set("Access-Control-Allow-Origin", "*")
  fallbackHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  fallbackHeaders.set("Access-Control-Allow-Headers", "*")

  const incomingUrl = new URL(request.url)
  const targetUrl = new URL("/api/v1/proz/public/profiles", backendBaseUrl)

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value)
  })

  // Ensure ngrok bypass param is present for hosted tunnels
  targetUrl.searchParams.set("ngrok-skip-browser-warning", "true")

  try {
    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn("Upstream public profiles responded with non-OK status:", response.status)
      throw new Error(`Upstream returned ${response.status}`)
    }

    const responseText = await response.text()

    const headers = new Headers(fallbackHeaders)
    headers.set("Content-Type", response.headers.get("content-type") || "application/json")

    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Proxy error fetching public profiles:", error)

    try {
      const fallbackPath = path.join(process.cwd(), "proz.json")
      const fallbackPayload = await fs.readFile(fallbackPath, "utf-8")
      console.info("Serving fallback public profiles data from proz.json")
      return new NextResponse(fallbackPayload, {
        status: 200,
        headers: fallbackHeaders,
      })
    } catch (fallbackError) {
      console.error("Failed to load fallback public profiles dataset:", fallbackError)
      return new NextResponse(
        JSON.stringify({
          detail: "Upstream API unavailable",
        }),
        {
          status: 502,
          headers: fallbackHeaders,
        },
      )
    }
  }
}

