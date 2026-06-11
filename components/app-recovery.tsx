"use client"

import { useEffect } from "react"

const RELOAD_KEY = "prozlab-chunk-reload-ts"

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false
  const name = reason instanceof Error ? reason.name : ""
  const message = reason instanceof Error ? reason.message : String(reason)
  return (
    name === "ChunkLoadError" ||
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module")
  )
}

function isEventLike(value: unknown): value is Event {
  return typeof value === "object" && value !== null && "type" in value && typeof (value as Event).type === "string"
}

function reloadForStaleChunks() {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0")
  const now = Date.now()
  // Allow one auto-reload every 15s to avoid infinite loops
  if (now - last < 15_000) return

  sessionStorage.setItem(RELOAD_KEY, String(now))
  const url = new URL(window.location.href)
  url.searchParams.set("_chunk", String(now))
  window.location.replace(url.toString())
}

/**
 * Recovers from stale Next.js chunks after .next rebuilds or dev server restarts.
 */
export function AppRecovery() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Clean up ?_chunk= from URL after successful load
    const url = new URL(window.location.href)
    if (url.searchParams.has("_chunk")) {
      url.searchParams.delete("_chunk")
      window.history.replaceState({}, "", url.pathname + url.search + url.hash)
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister())
      })
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      if (!isChunkLoadError(reason) && !isEventLike(reason)) return

      event.preventDefault()
      console.warn("[AppRecovery] Stale chunk detected, reloading…", reason)
      reloadForStaleChunks()
    }

    const onScriptError = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLScriptElement)) return
      if (!target.src.includes("/_next/")) return

      event.preventDefault()
      console.warn("[AppRecovery] Failed to load script:", target.src)
      reloadForStaleChunks()
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection)
    window.addEventListener("error", onScriptError, true)

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
      window.removeEventListener("error", onScriptError, true)
    }
  }, [])

  return null
}
