"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Shield, Award, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { prozProfilesApi } from "@/lib/api"
import Link from "next/link"

type ProfessionalProfile = {
  id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  verification_status?: string
  is_featured?: boolean
  review_count?: number
  hourly_rate?: number
  specialties: string[]
  rating?: number
  location?: string
  years_experience?: number
  availability?: string
  bio?: string
}

export function ProfessionalCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedProfessionals()
  }, [])

  const fetchFeaturedProfessionals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await prozProfilesApi.searchPublicProfiles({ page: 1, page_size: 12, verification_status: "verified", sort_by: "rating", sort_order: "desc" })

      let profiles: any[] = []
      if (response && typeof response === "object") {
        if (Array.isArray((response as any).profiles)) profiles = (response as any).profiles
        else if (Array.isArray((response as any).data)) profiles = (response as any).data
        else if (Array.isArray((response as any).results)) profiles = (response as any).results
        else if (Array.isArray(response)) profiles = response as any[]
      }

      if (!profiles || profiles.length === 0) {
        setProfessionals([])
        return
      }

      const mapped: ProfessionalProfile[] = profiles
        .map((p: any) => ({
          id: String(p.id ?? p.profile_id ?? Math.random().toString(36).slice(2)),
          first_name: p.first_name || p.firstName || "Pro",
          last_name: p.last_name || p.lastName || "User",
          profile_image_url: p.profile_image_url || p.avatar_url || p.image_url,
          verification_status: p.verification_status || p.status,
          is_featured: Boolean(p.is_featured),
          review_count: Number(p.review_count ?? p.reviews ?? 0),
          hourly_rate: Number(p.hourly_rate ?? 0),
          specialties: Array.isArray(p.specialties) ? p.specialties : [],
          rating: Number(p.rating ?? 5),
          location: p.location || p.city || "Remote",
          years_experience: Number(p.years_experience ?? p.experience ?? 0),
          availability: p.availability || "Available",
          bio: p.bio || p.about,
        }))
        .filter((p: ProfessionalProfile) => p.verification_status === "verified")
        .slice(0, 12)

      setProfessionals(mapped)
    } catch (err) {
      console.error("Failed to fetch featured professionals:", err)
      setError("Failed to load professionals")
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const getProfileImageUrl = (profile: ProfessionalProfile): string => {
    if (!profile.profile_image_url) {
      return "/placeholder.svg?height=60&width=60"
    }
    if (profile.profile_image_url.startsWith("http")) {
      return profile.profile_image_url
    }
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return `${base}${profile.profile_image_url.startsWith("/") ? "" : "/"}${profile.profile_image_url}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={fetchFeaturedProfessionals} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (professionals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">No featured professionals available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-700 shadow-lg hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-300 z-10"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-700 shadow-lg hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-300 z-10"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </Button>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {professionals.map((pro) => (
          <Card key={pro.id} className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="p-0">
              <div className="relative h-24 bg-blue-600 dark:bg-blue-500 p-4">
                <div className="absolute top-2 right-2 flex gap-1">
                  {pro.verification_status === "verified" && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs px-2 py-0.5">
                      <Shield className="w-2 h-2 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {pro.is_featured && (
                    <Badge className="bg-yellow-400/20 text-yellow-100 border-yellow-300/30 backdrop-blur-sm text-xs px-2 py-0.5">
                      <Award className="w-2 h-2 mr-1" />
                      Top
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2 left-4 right-4">
                  <div className="flex justify-between items-end text-white">
                    <div>
                      <div className="text-lg font-bold">{pro.review_count ?? 0}</div>
                      <div className="text-xs opacity-90">Reviews</div>
                    </div>
                    {/* Hourly rate removed per request */}
                  </div>
                </div>
              </div>

              <div className="px-4 pt-0 pb-4">
                <div className="relative -mt-8 mb-3">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {pro.profile_image_url ? (
                          <Image
                            src={getProfileImageUrl(pro) || "/placeholder.svg"}
                            alt={`${pro.first_name} ${pro.last_name}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement
                              if (fallback) fallback.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <div className="fallback-avatar w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl" style={{ display: pro.profile_image_url ? "none" : "flex" }}>
                          {pro.first_name[0]}
                          {pro.last_name[0]}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                    {pro.first_name} {pro.last_name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-2">{pro.specialties[0] || "Tech Professional"}</p>

                  <div className="flex items-center justify-center mb-2">
                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{pro.rating ?? 5}</span>
                      <span className="text-gray-600 dark:text-gray-300 text-xs ml-1">({pro.review_count ?? 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-3 text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{pro.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="font-medium">{pro.years_experience || 0}+ years</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 px-3 py-1 text-xs">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                      {pro.availability || "Available"}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap justify-center gap-1">
                    {pro.specialties.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs px-2 py-0.5 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                        {skill}
                      </Badge>
                    ))}
                    {pro.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                        +{pro.specialties.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed text-center italic">
                    "{pro.bio?.slice(0, 80) || "Professional tech support specialist ready to help."}..."
                  </p>
                </div>

                <div className="mt-4 flex justify-center">
                  <Link href={`/proz/user-profile?id=${pro.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-2 rounded-full">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">← Scroll to see more professionals →</div>
      </div>
    </div>
  )
}


