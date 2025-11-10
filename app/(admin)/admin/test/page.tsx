"use client"

import { useAuth } from "@/contexts/auth-context"

export default function AdminTestPage() {
  const { user, token } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Route Test</h1>
      <div className="space-y-2">
        <p>
          <strong>Route:</strong> /admin/test
        </p>
        <p>
          <strong>User ID:</strong> {user?.id || "Not logged in"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "N/A"}
        </p>
        <p>
          <strong>Is Superuser:</strong> {user?.is_superuser ? "Yes" : "No"}
        </p>
        <p>
          <strong>Token:</strong> {token ? "Present" : "Missing"}
        </p>
        <p>
          <strong>Current Time:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}
