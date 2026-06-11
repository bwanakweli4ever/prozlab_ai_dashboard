export function isAuthErrorPayload(data: unknown): data is { isAuthError: true; message?: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "isAuthError" in data &&
    (data as { isAuthError?: boolean }).isAuthError === true
  )
}

export function assertAuthResponse<T>(data: T): T {
  if (isAuthErrorPayload(data)) {
    throw new Error(data.message || "Session expired — please sign in again")
  }
  return data
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === "string") return new Error(error)
  if (error && typeof error === "object" && "type" in error) {
    return new Error("A network or script loading error occurred. Refresh the page and try again.")
  }
  return new Error(String(error))
}
