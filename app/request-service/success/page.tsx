"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function RequestServiceSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setRequestId(id)
    } else {
      // Redirect to request service page if no ID
      router.push("/request-service")
    }
  }, [searchParams, router])

  const copyRequestId = () => {
    if (requestId) {
      navigator.clipboard.writeText(requestId)
      toast({
        title: "Copied!",
        description: "Request ID copied to clipboard",
      })
    }
  }

  if (!requestId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Request Submitted Successfully!</h1>
          <p className="text-gray-600 mt-2">
            Your service request has been received and is being processed.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Please save your request ID for tracking and future reference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Request ID</p>
                  <p className="text-lg font-mono text-blue-700 break-all">{requestId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRequestId}
                  className="flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Request Review</p>
                    <p className="text-sm text-gray-600">
                      Our team will review your request and match you with qualified professionals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Professional Matching</p>
                    <p className="text-sm text-gray-600">
                      We'll connect you with verified professionals who match your requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Project Kickoff</p>
                    <p className="text-sm text-gray-600">
                      Once matched, you can start collaborating with your assigned professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-yellow-800">Important Note</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    You will receive an email confirmation shortly. Please check your spam folder if you don't see it in your inbox.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={() => router.push("/")} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/request-service")}
                className="flex-1"
              >
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
