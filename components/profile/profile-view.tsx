import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, MapPin, Mail, Phone, Globe, Linkedin, Clock, DollarSign, Award } from "lucide-react"
import type { ProzProfileResponse } from "@/types/api"

interface ProfileViewProps {
  profile: ProzProfileResponse
  isPublic?: boolean
}

export function ProfileView({ profile, isPublic = false }: ProfileViewProps) {
  // Safely access profile properties with fallbacks
  const firstName = profile.first_name || ""
  const lastName = profile.last_name || ""
  const fullName = `${firstName} ${lastName}`.trim() || "User"
  const initials = firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : "U"
  const rating = profile.rating !== undefined ? profile.rating : 0
  const reviewCount = profile.review_count !== undefined ? profile.review_count : 0
  const verificationStatus = profile.verification_status || "pending"
  const isFeatured = profile.is_featured || false
  const emailVerified = profile.email_verified || false

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="relative pb-16">
          <div className="absolute inset-x-0 top-0 h-36 rounded-t-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700" />
          <div className="relative flex flex-col md:flex-row gap-4 items-center md:items-end">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage 
                src={profile.profile_image_url || "/placeholder.svg"} 
                alt={fullName}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center md:items-start">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">{fullName}</CardTitle>
              <CardDescription className="text-center md:text-left">
                {profile.location && (
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </span>
                )}
              </CardDescription>
              {Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.specialties.slice(0, 4).map((s) => (
                    <Badge key={s} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{s}</Badge>
                  ))}
                  {profile.specialties.length > 4 && (
                    <Badge variant="outline">+{profile.specialties.length - 4} more</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="md:ml-auto flex gap-2">
              <Badge
                className={
                  verificationStatus === "verified"
                    ? "bg-green-500"
                    : verificationStatus === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }
              >
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
              </Badge>
              {isFeatured && <Badge variant="outline">Featured</Badge>}
            </div>
          </div>
          {/* Stats strip */}
          <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 text-center">
              <div className="text-xs text-muted-foreground">Experience</div>
              <div className="text-lg font-semibold">{profile.years_experience || 0} yrs</div>
            </div>
            <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 text-center">
              <div className="text-xs text-muted-foreground">Hourly Rate</div>
              <div className="text-lg font-semibold">{profile.hourly_rate ? `$${profile.hourly_rate}/hr` : "—"}</div>
            </div>
            <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 text-center">
              <div className="text-xs text-muted-foreground">Rating</div>
              <div className="text-lg font-semibold">{(profile as any).rating ?? 0}</div>
            </div>
            <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 text-center">
              <div className="text-xs text-muted-foreground">Reviews</div>
              <div className="text-lg font-semibold">{(profile as any).review_count ?? 0}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.bio || "No bio provided"}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{profile.years_experience || 0}</strong> years of experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{profile.hourly_rate ? `$${profile.hourly_rate}` : "—"}</strong> per hour
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{profile.availability || "Not specified"}</strong> availability
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Education</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {profile.education || "No education details provided"}
                </p>
              </div>

              {profile.certifications && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.certifications}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email || "No email provided"}</span>
                  </div>
                  {profile.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone_number}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {profile.linkedin && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Preferred Contact Method</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.preferred_contact_method
                    ? profile.preferred_contact_method.charAt(0).toUpperCase() + profile.preferred_contact_method.slice(1)
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Ratings & Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Award
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              </div>

              {!isPublic && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Status</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Email Verification:</span>
                      <Badge variant={emailVerified ? "default" : "outline"}>
                        {emailVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Profile Status:</span>
                      <Badge
                        className={
                          verificationStatus === "verified"
                            ? "bg-green-500"
                            : verificationStatus === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }
                      >
                        {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Featured Status:</span>
                      <Badge variant={isFeatured ? "default" : "outline"}>
                        {isFeatured ? "Featured" : "Not Featured"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
