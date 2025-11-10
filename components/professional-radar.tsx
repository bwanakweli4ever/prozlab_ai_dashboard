"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Play, Pause, RotateCcw, Zap } from "lucide-react"
import { prozProfilesApi, API_BASE_URL } from "@/lib/api"

type ProfessionalProfile = {
  id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  specialties?: string[]
  location?: string
  rating?: number
}

interface RadarStats {
  online_count: number
  avg_response_time: string
  success_rate: number
  active_searches: number
  new_professionals: number
}

export function ProfessionalRadar() {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [currentProfessional, setCurrentProfessional] = useState(0)
  const [isScanning, setIsScanning] = useState(true)
  const [scanSpeed, setScanSpeed] = useState(2500)
  const [stats, setStats] = useState<RadarStats>({
    online_count: 0,
    avg_response_time: "2.3",
    success_rate: 98,
    active_searches: 18,
    new_professionals: 4,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pulseIntensity, setPulseIntensity] = useState(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (professionals.length > 0 && isScanning) {
      intervalRef.current = setInterval(() => {
        setCurrentProfessional((prev) => {
          const next = (prev + 1) % professionals.length
          setPulseIntensity(1.5)
          setTimeout(() => setPulseIntensity(1), 200)
          return next
        })
      }, scanSpeed)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [professionals, isScanning, scanSpeed])

  const getProfileImageUrl = (profile: ProfessionalProfile): string => {
    if (!profile.profile_image_url) {
      return "/placeholder.svg?height=160&width=160"
    }
    if (profile.profile_image_url.startsWith("http")) {
      return profile.profile_image_url
    }
    const base = API_BASE_URL
    return `${base}${profile.profile_image_url.startsWith("/") ? "" : "/"}${profile.profile_image_url}`
  }

  const fetchProfessionals = useCallback(async () => {
    try {
      setIsLoading(true)
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
      } else {
        const mapped: ProfessionalProfile[] = profiles
          .map((p: any) => ({
            id: String(p.id ?? p.profile_id ?? Math.random().toString(36).slice(2)),
            first_name: p.first_name || p.firstName || "Pro",
            last_name: p.last_name || p.lastName || "User",
            profile_image_url: p.profile_image_url || p.avatar_url || p.image_url,
            specialties: Array.isArray(p.specialties) ? p.specialties : [],
            location: p.location || p.city || "Remote",
            rating: Number(p.rating ?? 5),
          }))
          .filter((p: ProfessionalProfile) => true) // already filtered by API to verified
          .slice(0, 8)

        setProfessionals(mapped)
        setStats((prev) => ({
          ...prev,
          online_count: Math.max(mapped.length, 8),
        }))
      }
    } catch (e) {
      setError("Failed to load professionals")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  const toggleScanning = () => setIsScanning(!isScanning)
  const changeScanSpeed = () => {
    const speeds = [1500, 2500, 4000]
    const currentIndex = speeds.indexOf(scanSpeed)
    setScanSpeed(speeds[(currentIndex + 1) % speeds.length])
  }
  const refreshRadar = () => {
    fetchProfessionals()
    setPulseIntensity(2)
    setTimeout(() => setPulseIntensity(1), 500)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 dark:border-blue-500 opacity-30"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Scanning for professionals...</p>
      </div>
    )
  }

  if (error || professionals.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 font-medium">No professionals available</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Check back later for available professionals</p>
        </div>
        <Button onClick={refreshRadar} variant="outline" className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>
    )
  }

  const currentPro = professionals[currentProfessional]
  const speedLabel = scanSpeed === 1500 ? "Fast" : scanSpeed === 2500 ? "Normal" : "Slow"

  return (
    <div className="relative">
      <div className="flex justify-center mb-4 space-x-2">
        <Button variant="outline" size="sm" onClick={toggleScanning} className="flex items-center space-x-1">
          {isScanning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isScanning ? "Pause" : "Resume"}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={changeScanSpeed} className="flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>{speedLabel}</span>
        </Button>
        <Button variant="outline" size="sm" onClick={refreshRadar} className="flex items-center space-x-1">
          <RotateCcw className="w-3 h-3" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="relative w-80 h-80 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 opacity-30 transition-all duration-300" style={{ transform: `scale(${pulseIntensity})` }}></div>
        <div className="absolute inset-4 rounded-full border-2 border-blue-300 opacity-40 transition-all duration-300" style={{ transform: `scale(${pulseIntensity})` }}></div>
        <div className="absolute inset-8 rounded-full border-2 border-orange-300 opacity-50 transition-all duration-300" style={{ transform: `scale(${pulseIntensity})` }}></div>
        <div className="absolute inset-12 rounded-full border-2 border-orange-400 opacity-60 transition-all duration-300" style={{ transform: `scale(${pulseIntensity})` }}></div>

        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isScanning ? "animate-spin" : ""}`} style={{ animationDuration: `${scanSpeed / 1000}s`, opacity: isScanning ? 1 : 0.3 }}>
          <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-b from-blue-500 via-orange-400 to-transparent transform -translate-x-1/2 origin-bottom"></div>
        </div>

        <div className="absolute inset-16 rounded-full bg-white dark:bg-gray-900 shadow-2xl border-4 border-blue-500 overflow-hidden transition-all duration-500">
          {currentPro.profile_image_url ? (
            <Image 
              src={getProfileImageUrl(currentPro) || "/placeholder.svg"} 
              alt={`${currentPro.first_name} ${currentPro.last_name}`} 
              width={160} 
              height={160} 
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement
                if (fallback) fallback.style.display = "flex"
              }}
            />
          ) : null}
          <div className="fallback-avatar w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl" style={{ display: currentPro.profile_image_url ? "none" : "flex" }}>
            {currentPro.first_name?.[0] || "P"}
            {currentPro.last_name?.[0] || "R"}
          </div>
        </div>

        {professionals.map((pro, index) => {
          const angle = (index * 360) / professionals.length - 90
          const radius = 120
          const x = Math.cos((angle * Math.PI) / 180) * radius
          const y = Math.sin((angle * Math.PI) / 180) * radius
          return (
            <div key={pro.id} className={`absolute w-4 h-4 rounded-full transition-all duration-500 cursor-pointer ${index === currentProfessional ? "bg-orange-500 scale-150 animate-pulse shadow-lg" : "bg-blue-400 hover:bg-orange-400 hover:scale-125"}`} style={{ left: `calc(50% + ${x}px - 8px)`, top: `calc(50% + ${y}px - 8px)` }} onClick={() => setCurrentProfessional(index)} title={`${pro.first_name} ${pro.last_name}`} />
          )
        })}
      </div>

      <div className="mt-8 space-y-4">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-blue-200 dark:border-blue-900 shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-all duration-300">
                  {currentPro.first_name} {currentPro.last_name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{currentPro.specialties?.[0] || "Tech Professional"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentPro.location || "Location not specified"}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-2xl">⭐</span>
                  <span className="font-bold text-gray-900 dark:text-white">{currentPro.rating || "N/A"}</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 animate-pulse">Available Now</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.online_count}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Online Now</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.avg_response_time}m</div>
                  <div className="text-xs text-green-700 dark:text-green-300">Avg Response</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.success_rate}%</div>
                  <div className="text-xs text-orange-700 dark:text-orange-300">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.active_searches}</div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Active Searches</div>
                </CardContent>
              </Card>
              <Card className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">+{stats.new_professionals}</div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">New Today</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


