"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowLeft, MapPin, Clock, DollarSign, Award, Shield, Mail, Phone, Globe, Linkedin, CalendarDays, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { publicApi } from "@/lib/api"

export default function UserProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      setError("No profile ID provided")
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load profile data
        const data = await publicApi.getProfile(id)
        setProfile(data)
        
        // Load reviews
        setReviewsLoading(true)
        try {
          const reviewsData = await publicApi.getProfileReviews(id, 1, 20)
          setReviews(Array.isArray(reviewsData) ? reviewsData : [])
        } catch (reviewError) {
          console.warn("Could not load reviews:", reviewError)
          setReviews([])
        } finally {
          setReviewsLoading(false)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const getImageUrl = (url?: string) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "")
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">User Profile</div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-600 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
            <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
          </div>
        ) : !profile ? (
          <div className="flex justify-center items-center h-64 text-gray-600 dark:text-gray-300">Profile not found</div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Profile Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {profile.profile_image_url ? (
                      <Image src={getImageUrl(profile.profile_image_url) || "/placeholder.svg"} alt={`${profile.first_name || ""} ${profile.last_name || ""}`} width={128} height={128} className="w-32 h-32 object-cover" />
                    ) : (
                      <span className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
                        {(profile.first_name || "").charAt(0)}
                        {(profile.last_name || "").charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(profile.first_name || "Pro")} {(profile.last_name || "User")}
                      </h1>
                      {profile.verification_status === "verified" && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 px-3 py-1">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profile.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 px-3 py-1">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      {profile.location && (
                        <span className="inline-flex items-center"><MapPin className="w-4 h-4 mr-1" /> {profile.location}</span>
                      )}
                      <span className="inline-flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">{profile.rating ?? 5}</span>
                        <span className="ml-1 text-xs">({profile.review_count ?? 0} reviews)</span>
                      </span>
                      {profile.years_experience && (
                        <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" /> {profile.years_experience}+ years experience</span>
                      )}
                      {profile.hourly_rate && (
                        <span className="inline-flex items-center"><DollarSign className="w-4 h-4 mr-1" /> ${profile.hourly_rate}/hour</span>
                      )}
                    </div>
                    {profile.availability && (
                      <div className="mt-3">
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 px-3 py-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          {profile.availability}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-sm px-3 py-1 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.bio && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(profile.email || profile.phone || profile.website || profile.linkedin) && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-200">{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-200">{profile.phone}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.linkedin && (
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education & Certifications */}
            {(profile.education || profile.certifications) && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education & Certifications</h3>
                  <div className="space-y-4">
                    {profile.education && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Education</h4>
                        <p className="text-gray-700 dark:text-gray-200">{profile.education}</p>
                      </div>
                    )}
                    {profile.certifications && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Certifications</h4>
                        <p className="text-gray-700 dark:text-gray-200">{profile.certifications}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews ({profile.review_count || 0})</h3>
                {reviewsLoading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading reviews...</div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= (review.rating || 5) ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {review.reviewer_name || "Anonymous"} • {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently"}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-300">No reviews yet</div>
                )}
              </CardContent>
            </Card>

            {/* Additional Profile Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {profile.created_at && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Member since:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-200">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {profile.preferred_contact_method && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Preferred contact:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-200">{profile.preferred_contact_method}</span>
                    </div>
                  )}
                  {profile.verification_status && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Verification status:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-200 capitalize">{profile.verification_status}</span>
                    </div>
                  )}
                  {profile.is_featured && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Featured professional:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">Yes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
