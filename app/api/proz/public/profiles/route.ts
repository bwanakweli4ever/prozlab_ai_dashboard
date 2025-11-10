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

    const responseText = await response.text()

    const headers = new Headers()
    headers.set("Content-Type", response.headers.get("content-type") || "application/json")
    headers.set("Cache-Control", "no-store")
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "*")

    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Proxy error fetching public profiles:", error)
    return new NextResponse(
      JSON.stringify({
        detail: "Upstream API unavailable",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      },
    )
  }
}

