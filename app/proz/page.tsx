"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Star, MapPin, Clock, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { prozProfilesApi } from "@/lib/api"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { SPECIALTIES, AVAILABILITY_OPTIONS, SPECIALTY_SYNONYMS } from "@/lib/constants"

export default function BrowseProz() {
  const [experienceRange, setExperienceRange] = useState([0])
  const [hourlyRateRange, setHourlyRateRange] = useState([150])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [professionals, setProfessionals] = useState<any[]>([])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  // Filter professionals by all selected filters
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals

    // Filter by specialties (case-insensitive, substring + synonyms)
    if (selectedSpecialties.length > 0) {
      const normalize = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

      const expanded = new Set<string>()
      selectedSpecialties.forEach((s) => {
        const n = normalize(s)
        expanded.add(n)
        const syns = SPECIALTY_SYNONYMS[n]
        if (syns) syns.forEach((x) => expanded.add(normalize(x)))
      })

      const matches = (candidate: string) => {
        const c = normalize(candidate)
        for (const sel of expanded) {
          if (c === sel || c.includes(sel) || sel.includes(c)) return true
        }
        return false
      }

      filtered = filtered.filter((p) => Array.isArray(p.specialties) && p.specialties.some((s: string) => matches(s)))
    }

    // Filter by availability
    if (selectedAvailability.length > 0) {
      filtered = filtered.filter((p) => {
        const availability = String(p.availability || '').toLowerCase()
        
        // Check if professional's availability matches any selected filter
        return selectedAvailability.some((selected) => {
          const selectedLower = selected.toLowerCase()
          
          // Exact match or contains match
          if (availability.includes(selectedLower)) return true
          
          // Map common availability terms
          if (selectedLower === 'full-time' && (
            availability.includes('full time') || 
            availability.includes('fulltime') ||
            availability.includes('full-time')
          )) return true
          
          if (selectedLower === 'part-time' && (
            availability.includes('part time') ||
            availability.includes('parttime') ||
            availability.includes('part-time')
          )) return true
          
          if (selectedLower === 'contract' && (
            availability.includes('contractor') ||
            availability.includes('contract')
          )) return true
          
          if (selectedLower === 'freelance' && (
            availability.includes('freelancer') ||
            availability.includes('freelance') ||
            availability.includes('self-employed')
          )) return true
          
          if (selectedLower === 'not available' && (
            availability.includes('unavailable') ||
            availability.includes('not available') ||
            availability.includes('closed') ||
            availability.includes('none')
          )) return true
          
          return false
        })
      })
    }

    // Filter by experience range
    if (experienceRange[0] > 0) {
      filtered = filtered.filter((p) => p.experience >= experienceRange[0])
    }

    // Filter by hourly rate range
    if (hourlyRateRange[0] < 200) {
      filtered = filtered.filter((p) => p.hourlyRate <= hourlyRateRange[0])
    }

    return filtered
  }, [professionals, selectedSpecialties, selectedAvailability, experienceRange, hourlyRateRange])

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await prozProfilesApi.searchPublicProfiles({ page, page_size: pageSize, verification_status: "verified", sort_by: "rating", sort_order: "desc" })
        let profiles: any[] = []
        let totalItems = 0
        if (response && typeof response === "object") {
          if (Array.isArray((response as any).profiles)) {
            profiles = (response as any).profiles
            totalItems = Number((response as any).total ?? profiles.length)
          } else if (Array.isArray((response as any).data)) {
            profiles = (response as any).data
            totalItems = Number((response as any).total ?? profiles.length)
          } else if (Array.isArray((response as any).results)) {
            profiles = (response as any).results
            totalItems = Number((response as any).count ?? profiles.length)
          } else if (Array.isArray(response)) {
            profiles = response as any[]
            totalItems = profiles.length
          }
        }
        const mapped = profiles
          .map((p: any) => ({
            id: String(p.id ?? p.profile_id ?? Math.random().toString(36).slice(2)),
            name: `${p.first_name || p.firstName || "Pro"} ${p.last_name || p.lastName || "User"}`,
            location: p.location || p.city || "Remote",
            hourlyRate: Number(p.hourly_rate ?? 0),
            rating: Number(p.rating ?? 5),
            reviews: Number(p.review_count ?? p.reviews ?? 0),
            experience: Number(p.years_experience ?? p.experience ?? 0),
            specialties: (() => {
              const chunks: string[] = []
              const pushChunks = (val: unknown) => {
                if (!val) return
                if (Array.isArray(val)) {
                  val.forEach((v) => pushChunks(v))
                } else if (typeof val === "string") {
                  val
                    .split(/[,/;|\n]+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .forEach((s) => chunks.push(s))
                }
              }
              pushChunks((p as any).specialties)
              pushChunks((p as any).skills)
              pushChunks((p as any).expertise)
              pushChunks((p as any).categories)
              pushChunks((p as any).tags)
              // de-duplicate by lowercased form
              const seen = new Set<string>()
              const result: string[] = []
              chunks.forEach((s) => {
                const key = s.toLowerCase()
                if (!seen.has(key)) {
                  seen.add(key)
                  result.push(s)
                }
              })
              return result
            })(),
            description: p.bio || p.about || "Professional tech support specialist ready to help.",
            availability: p.availability || "Available",
          }))
        setProfessionals(mapped)
        setTotal(totalItems)
      } catch (e) {
        setError("Failed to load professionals")
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [page, pageSize])

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties((prev) => (prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]))
  }

  const handleAvailabilityChange = (avail: string) => {
    setSelectedAvailability((prev) => (prev.includes(avail) ? prev.filter((a) => a !== avail) : [...prev, avail]))
  }

  const resetFilters = () => {
    setExperienceRange([0])
    setHourlyRateRange([150])
    setSelectedSpecialties([])
    setSelectedAvailability([])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-500 dark:bg-blue-600 text-white border-b border-blue-600/20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 md:py-5">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <Link href="/" className="flex items-center">
              <ProzLabLogo size="md" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-6 md:pb-8">
        {/* Mobile filters toggle */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verified Professionals</h2>
          <Button variant="outline" size="sm" onClick={() => setShowFiltersMobile((v) => !v)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        {showFiltersMobile && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6 lg:hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filter Professionals</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Reset</Button>
              </div>
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Location</Label>
                  <Input placeholder="City or Remote" className="w-full" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Minimum Years of Experience: {experienceRange[0]}</Label>
                  <Slider value={experienceRange} onValueChange={setExperienceRange} max={15} step={1} className="w-full" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Maximum Hourly Rate: ${hourlyRateRange[0]}</Label>
                  <Slider value={hourlyRateRange} onValueChange={setHourlyRateRange} max={200} step={5} className="w-full" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Specialties</Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {SPECIALTIES.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox id={`m-${specialty}`} checked={selectedSpecialties.includes(specialty)} onCheckedChange={() => handleSpecialtyChange(specialty)} className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                        <Label htmlFor={`m-${specialty}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{specialty}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Availability</Label>
                  <div className="space-y-3">
                    {AVAILABILITY_OPTIONS.map((avail) => (
                      <div key={avail} className="flex items-center space-x-2">
                        <Checkbox id={`m-${avail}`} checked={selectedAvailability.includes(avail)} onCheckedChange={() => handleAvailabilityChange(avail)} className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                        <Label htmlFor={`m-${avail}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{avail}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 lg:sticky lg:top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filter Professionals</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Reset</Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Location</Label>
                    <Input placeholder="City or Remote" className="w-full" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Minimum Years of Experience: {experienceRange[0]}</Label>
                    <Slider value={experienceRange} onValueChange={setExperienceRange} max={15} step={1} className="w-full" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Maximum Hourly Rate: ${hourlyRateRange[0]}</Label>
                    <Slider value={hourlyRateRange} onValueChange={setHourlyRateRange} max={200} step={5} className="w-full" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Specialties</Label>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {SPECIALTIES.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox id={specialty} checked={selectedSpecialties.includes(specialty)} onCheckedChange={() => handleSpecialtyChange(specialty)} className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                          <Label htmlFor={specialty} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{specialty}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">Availability</Label>
                    <div className="space-y-3">
                      {AVAILABILITY_OPTIONS.map((avail) => (
                        <div key={avail} className="flex items-center space-x-2">
                          <Checkbox id={avail} checked={selectedAvailability.includes(avail)} onCheckedChange={() => handleAvailabilityChange(avail)} className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                          <Label htmlFor={avail} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{avail}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verified Professionals</h2>
              <p className="text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" /></div>
            ) : error ? (
              <div className="text-center text-red-600 dark:text-red-400 py-12">{error}</div>
            ) : (
            <div className="space-y-4">
              {/* Active filters display */}
              {(selectedSpecialties.length > 0 || selectedAvailability.length > 0 || experienceRange[0] > 0 || hourlyRateRange[0] < 200) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Active Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs h-7"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Specialty filters */}
                    {selectedSpecialties.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Specialties:</span>
                        {selectedSpecialties.map((sp) => (
                          <Badge 
                            key={sp} 
                            className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 border border-blue-300 dark:border-blue-600 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700"
                            onClick={() => handleSpecialtyChange(sp)}
                          >
                            {sp} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Availability filters */}
                    {selectedAvailability.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Availability:</span>
                        {selectedAvailability.map((av) => (
                          <Badge 
                            key={av} 
                            className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-1 border border-green-300 dark:border-green-600 cursor-pointer hover:bg-green-200 dark:hover:bg-green-700"
                            onClick={() => handleAvailabilityChange(av)}
                          >
                            {av} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Experience filter */}
                    {experienceRange[0] > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Min Experience:</span>
                        <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 border border-purple-300 dark:border-purple-600">
                          {experienceRange[0]}+ years
                        </Badge>
                      </div>
                    )}
                    
                    {/* Hourly rate filter */}
                    {hourlyRateRange[0] < 200 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Max Rate:</span>
                        <Badge className="bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 border border-orange-300 dark:border-orange-600">
                          ${hourlyRateRange[0]}/hr
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    Showing {filteredProfessionals.length} of {professionals.length} professionals
                  </div>
                </div>
              )}

              {filteredProfessionals.length === 0 && professionals.length > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center">
                      <Filter className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No professionals match your filters</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your filters to see more results
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              )}

              {filteredProfessionals.map((pro) => (
                <Card key={pro.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="sm:flex-shrink-0">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-medium mb-3 sm:mb-4">${pro.hourlyRate}/hr</div>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg">
                          {pro.profile_image_url ? (
                            <img
                              src={pro.profile_image_url}
                              alt={pro.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement
                                if (fallback) fallback.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div className="fallback-avatar w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl" style={{ display: pro.profile_image_url ? "none" : "flex" }}>
                            {pro.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pro.name}</h3>
                            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2"><MapPin className="w-4 h-4 mr-1" /><span className="text-sm">{pro.location}</span></div>
                          </div>
                          <div className="sm:text-right">
                            <div className="flex items-center mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-4 h-4 ${star <= pro.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`} />))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">({pro.reviews} reviews)</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{pro.experience} years experience</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {pro.specialties.map((skill: string) => (
                            <Badge
                              key={skill}
                              role="button"
                              aria-pressed={selectedSpecialties.includes(skill)}
                              onClick={() => {
                                setSelectedSpecialties((prev) => (prev.includes(skill) ? prev : [...prev, skill]))
                                if (typeof window !== "undefined") {
                                  window.scrollTo({ top: 0, behavior: "smooth" })
                                }
                              }}
                              className={
                                `cursor-pointer select-none bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 border ` +
                                (selectedSpecialties.includes(skill)
                                  ? "border-blue-400 dark:border-blue-500 ring-1 ring-blue-300 dark:ring-blue-600"
                                  : "border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50")
                              }
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{pro.description}</p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability:</span>
                            <Badge
                              role="button"
                              onClick={() => {
                                // Try to match the availability to our filter options
                                const availLower = pro.availability.toLowerCase()
                                let filterToAdd = ''
                                
                                if (availLower.includes('full-time') || availLower.includes('full time') || availLower.includes('fulltime')) {
                                  filterToAdd = 'Full-time'
                                } else if (availLower.includes('part-time') || availLower.includes('part time') || availLower.includes('parttime')) {
                                  filterToAdd = 'Part-time'
                                } else if (availLower.includes('contract') || availLower.includes('contractor')) {
                                  filterToAdd = 'Contract'
                                } else if (availLower.includes('freelance') || availLower.includes('freelancer') || availLower.includes('self-employed')) {
                                  filterToAdd = 'Freelance'
                                } else if (availLower.includes('not available') || availLower.includes('unavailable') || availLower.includes('closed')) {
                                  filterToAdd = 'Not available'
                                }
                                
                                if (filterToAdd && !selectedAvailability.includes(filterToAdd)) {
                                  setSelectedAvailability((prev) => [...prev, filterToAdd])
                                  if (typeof window !== "undefined") {
                                    window.scrollTo({ top: 0, behavior: "smooth" })
                                  }
                                }
                              }}
                              className={
                                `cursor-pointer select-none bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 border hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-700`
                              }
                            >
                              {pro.availability}
                            </Badge>
                          </div>
                          <Link href={`/proz/user-profile?id=${pro.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto">View Profile</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Previous</Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


