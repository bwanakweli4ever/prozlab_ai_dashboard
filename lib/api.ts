import type {
  ProzProfileResponse,
  ProzProfileUpdate,
  ProzProfileCreate,
  UserCreate,
  UserLogin,
  User,
  AdminDashboardResponse,
  VerificationStatsAdmin,
  ServiceRequestCreate,
  ServiceRequestResponse,
  TaskAssignmentCreate,
  TaskAssignmentResponse,
  ProfessionalTaskResponse,
  DashboardStatsResponse,
  NotificationResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  FileUploadResponse,
  ProfileImageUpdateRequest,
  ProfileImageResponse,
  PublicProzProfileWithReviews,
  ProfileSearchResponse,
  ProfileCategoriesResponse,
  ProfileStatsResponse,
} from "@/types/api"

// Force localhost in development if explicitly requested via DEV_FORCE_LOCALHOST
const DEV_FORCE_LOCALHOST = process.env.NEXT_PUBLIC_DEV_FORCE_LOCALHOST === 'true'
export const API_BASE_URL = (
  DEV_FORCE_LOCALHOST ? 'https://app.prozlab.com' : (process.env.NEXT_PUBLIC_API_URL || 'https://app.prozlab.com/')
).replace(/\/+$/, "")

const FRONTEND_HOSTNAMES = new Set(["prozlab.com", "www.prozlab.com"])
const DEFAULT_BACKEND_API_BASE = "https://app.prozlab.com"

const getServerBackendBaseUrl = () => {
  if (typeof window !== "undefined") return API_BASE_URL

  const candidates = [
    process.env.PROZLAB_BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    DEFAULT_BACKEND_API_BASE,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const trimmed = candidate.replace(/\/+$/, "")
      const parsed = new URL(trimmed)
      if (FRONTEND_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
        continue
      }
      return trimmed
    } catch {
      continue
    }
  }

  return DEFAULT_BACKEND_API_BASE
}

// Helper to append ngrok bypass query param to avoid splash HTML
const withNgrokBypass = (url: string) => {
  try {
    const u = new URL(url) 
    u.searchParams.set("ngrok-skip-browser-warning", "true")
    return u.toString()
  } catch {
    return url
  }
}

// Helper to handle API responses with improved error handling
async function handleResponse<T>(response: Response): Promise<T> {
  console.log("API Response:", {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type"),
  })

  if (!response.ok) {
    const responseText = await response.text()
    
    // Only log detailed error info for non-authentication, non-404, and non-business-logic errors
    if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
      // Check if it's a business logic response (like duplicate assignment)
      const isBusinessLogicError = responseText && responseText.includes("Task already assigned to this professional")
      
      if (!isBusinessLogicError) {
        console.error("API Error Response Text:", responseText)
      } else {
        console.log("Business logic response:", responseText)
      }
    }

    let errorMessage = `API Error: ${response.status} ${response.statusText}`

    try {
      if (responseText && responseText.trim()) {
        const errorData = JSON.parse(responseText)
        
        // Only log detailed error data for non-authentication, non-404, and non-business-logic errors
        if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
          // Check if it's a business logic response (like duplicate assignment)
          const isBusinessLogicError = errorData.detail && errorData.detail.includes("Task already assigned to this professional")
          
          if (!isBusinessLogicError) {
            console.error("API Error Data:", errorData)
          } else {
            console.log("Business logic response data:", errorData)
          }
        }

        if (errorData.detail) {
          errorMessage = errorData.detail
          
          // Handle specific business logic errors that should not be treated as system errors
          if (errorData.detail.includes("Task already assigned to this professional")) {
            // This is a business logic response, not an error - return it instead of throwing
            console.log("Business logic response:", errorData.detail)
            return { 
              success: false, 
              message: errorData.detail, 
              isBusinessLogic: true 
            } as any
          }
          
          // Handle authentication errors that should trigger logout
          if (errorData.detail.includes("Could not validate credentials") || 
              errorData.detail.includes("Invalid credentials") ||
              errorData.detail.includes("Incorrect email or password") ||
              errorData.detail.includes("Token has expired")) {
            // This is an authentication error - return it instead of throwing
            console.warn("Authentication error response:", errorData.detail)
            return { 
              success: false, 
              message: errorData.detail, 
              isAuthError: true 
            } as any
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData
        } else {
          errorMessage = `API Error: ${JSON.stringify(errorData)}`
        }
      }
    } catch (parseError) {
      // Only log parse errors for non-authentication and non-404 errors
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error("Error parsing API error response:", parseError)
      }
      if (responseText) {
        errorMessage = `API Error: ${responseText}`
      }
    }

    throw new Error(errorMessage)
  }

  try {
    const contentType = response.headers.get("content-type") || ""
    const responseText = await response.text()

    if (!responseText || !responseText.trim()) {
      console.warn("API returned empty response")
      return {} as T
    }

    const looksLikeHtml = responseText.trim().startsWith("<") || contentType.includes("text/html")
    if (looksLikeHtml) {
      const snippet = responseText.slice(0, 200)
      throw new Error(
        `Received non-JSON response from API (content-type: ${contentType}).\n` +
        `Check NEXT_PUBLIC_API_URL and that the backend is reachable.\n` +
        `First 200 chars: ${snippet}`
      )
    }

    try {
      return JSON.parse(responseText) as T
    } catch (parseError) {
      console.error("Error parsing API JSON response:", parseError, "Response text:", responseText)
      throw new Error(
        `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error("Error reading API response:", error)
    throw new Error("Failed to read API response: " + (error instanceof Error ? error.message : String(error)))
  }
}

// Authentication API
export const authApi = {
  register: async (userData: UserCreate): Promise<User> => {
    try {
      console.log("Registering user:", { email: userData.email })

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      console.log("Registration response status:", response.status)
      return handleResponse<User>(response)
    } catch (networkError) {
      console.error("Network error during registration:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  login: async (credentials: UserLogin): Promise<{ access_token: string; token_type: string }> => {
    try {
      console.log("Login request:", {
        url: `${API_BASE_URL}/api/v1/auth/login/json`,
        email: credentials.email,
      })

      // Try JSON login first
      let response = await fetch(`${API_BASE_URL}/api/v1/auth/login/json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      // If JSON fails, try form-urlencoded
      if (!response.ok) {
        console.log("JSON login failed, trying with form-urlencoded")
        const urlEncodedData = new URLSearchParams()
        urlEncodedData.append("username", credentials.email)
        urlEncodedData.append("password", credentials.password)

        response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlEncodedData,
        })
      }

      console.log("Login response status:", response.status)
      return handleResponse<{ access_token: string; token_type: string }>(response)
    } catch (networkError) {
      console.error("Network error during login:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getCurrentUser: async (token: string): Promise<User> => {
    try {
      console.log("Fetching current user with token:", token ? "Token provided" : "No token")

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Get current user response status:", response.status)
      return handleResponse<User>(response)
    } catch (networkError) {
      console.error("Network error while fetching user:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getUsers: async (token: string, skip = 0, limit = 100): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/users?skip=${skip}&limit=${limit}&self=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<User[]>(response)
    } catch (networkError) {
      console.error("Network error while fetching users:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  deleteUser: async (userId: string, reason: string, token: string): Promise<{ message: string }> => {
    try {
      console.log("Deleting user with ID:", userId)
      console.log("Delete reason:", reason)
      console.log("Using endpoint:", `${API_BASE_URL}/api/v1/admin/proz/profiles/${userId}?reason=${encodeURIComponent(reason)}`)
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/proz/profiles/${userId}?reason=${encodeURIComponent(reason)}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
      
      console.log("Delete response status:", response.status)
      return handleResponse<{ message: string }>(response)
    } catch (networkError) {
      console.error("Network error while deleting user:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },


  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      console.log("Sending forgot password request for email:", email)

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/forgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log("Forgot password response status:", response.status)
      return handleResponse<{ message: string }>(response)
    } catch (networkError) {
      console.error("Network error during forgot password:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    try {
      console.log("Resetting password with token")

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })

      console.log("Reset password response status:", response.status)
      return handleResponse<{ message: string }>(response)
    } catch (networkError) {
      console.error("Network error during password reset:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  // OTP-based password reset
  resetPasswordWithOtp: async (
    email: string,
    otpCode: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/reset-with-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })
      return handleResponse<{ message: string }>(response)
    } catch (networkError) {
      console.error("Network error during OTP password reset:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Email Verification API (the OTP functionality is under email verification in the spec)
export const emailApi = {
  getStatus: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/status`)
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching email status:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  sendVerification: async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return handleResponse<EmailVerificationResponse>(response)
    } catch (error) {
      console.error("Network error while sending email verification:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  verifyToken: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while verifying email token:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  resendVerification: async (email: string): Promise<EmailVerificationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      return handleResponse<EmailVerificationResponse>(response)
    } catch (error) {
      console.error("Network error while resending email verification:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  sendVerificationNotification: async (
    email: string,
    firstName: string,
    lastName: string,
    status: "verified" | "rejected",
    adminNotes?: string,
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/send-verification-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          verification_status: status,
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
        }),
      })
      return handleResponse<{ success: boolean; message: string }>(response)
    } catch (error) {
      console.error("Network error while sending verification notification:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Public Profiles API
export const publicApi = {
  searchProfiles: async (params: any): Promise<ProfileSearchResponse> => {
    try {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })

      // Only show verified profiles in public listings
      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/verified-only?${searchParams}`))
      return handleResponse<ProfileSearchResponse>(response)
    } catch (error) {
      console.error("Network error while searching profiles:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getProfile: async (profileId: string, includeUnverified = false): Promise<PublicProzProfileWithReviews> => {
    try {
      const response = await fetch(
        withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/profiles/${profileId}?include_unverified=${includeUnverified}`),
      )
      return handleResponse<PublicProzProfileWithReviews>(response)
    } catch (error) {
      console.error("Network error while fetching profile:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getFeaturedProfiles: async (limit = 6): Promise<any> => {
    try {
      // Prefer verified-only for featured section
      const url = withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/verified-only?limit=${limit}`)
      const response = await fetch(url)
      const data = await handleResponse<any>(response)
      // Extra safety: filter to verified only client-side as well
      if (Array.isArray(data?.items)) {
        data.items = data.items.filter((p: any) => (p?.verification_status || '').toLowerCase() === 'verified')
      }
      return data
    } catch (error) {
      console.error("Network error while fetching featured profiles:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getCategories: async (): Promise<ProfileCategoriesResponse> => {
    try {
      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/categories`))
      return handleResponse<ProfileCategoriesResponse>(response)
    } catch (error) {
      console.error("Network error while fetching categories:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getStats: async (): Promise<ProfileStatsResponse> => {
    try {
      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/stats`))
      return handleResponse<ProfileStatsResponse>(response)
    } catch (error) {
      console.error("Network error while fetching stats:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getVerificationInfo: async (): Promise<any> => {
    try {
      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/verification-info`))
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching verification info:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getVerifiedProfiles: async (params: any): Promise<ProfileSearchResponse> => {
    try {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/verified-only?${searchParams}`))
      return handleResponse<ProfileSearchResponse>(response)
    } catch (error) {
      console.error("Network error while fetching verified profiles:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getPendingVerificationProfiles: async (params: any): Promise<ProfileSearchResponse> => {
    try {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/pending-verification?${searchParams}`))
      return handleResponse<ProfileSearchResponse>(response)
    } catch (error) {
      console.error("Network error while fetching pending profiles:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getProfileReviews: async (profileId: string, page = 1, pageSize = 10): Promise<any[]> => {
    try {
      const response = await fetch(
        withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/profiles/${profileId}/reviews?page=${page}&page_size=${pageSize}`),
      )
      return handleResponse<any[]>(response)
    } catch (error) {
      console.error("Network error while fetching profile reviews:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getSearchSuggestions: async (query: string): Promise<any> => {
    try {
      const response = await fetch(
        withNgrokBypass(`${API_BASE_URL}/api/v1/proz/public/search-suggestions?q=${encodeURIComponent(query)}`),
      )
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching search suggestions:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Profile Media API
export const mediaApi = {
  uploadProfileImage: async (file: File, token: string): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    
    // List of potential endpoints to try
    const endpoints = [
      `${API_BASE_URL}/api/v1/proz/media/upload-profile-image`,
      `${API_BASE_URL}/api/v1/media/upload-profile-image`,
      `${API_BASE_URL}/api/v1/proz/upload-profile-image`,
      `${API_BASE_URL}/api/v1/upload-profile-image`,
      `${API_BASE_URL}/upload-profile-image`
    ]
    
    console.log("API_BASE_URL:", API_BASE_URL)
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Try each endpoint until one works
    for (let i = 0; i < endpoints.length; i++) {
      const url = endpoints[i]
      console.log(`Trying endpoint ${i + 1}/${endpoints.length}:`, url)
      
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        
        console.log("Response status:", response.status)
        console.log("Response URL:", response.url)
        
        if (response.ok) {
          console.log("Upload successful with endpoint:", url)
          return handleResponse<FileUploadResponse>(response)
        } else {
          console.log(`Endpoint ${url} failed with status:`, response.status)
          if (i === endpoints.length - 1) {
            // Last endpoint failed, show error
            const errorText = await response.text()
            console.error("All endpoints failed. Last error:", errorText)
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
          }
        }
      } catch (error) {
        console.error(`Error with endpoint ${url}:`, error)
        if (i === endpoints.length - 1) {
          throw new Error("Network error: Could not connect to any upload endpoint.")
        }
      }
    }
    
    throw new Error("No upload endpoints available")
  },

  deleteProfileImage: async (token: string): Promise<ProfileImageResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/media/delete-profile-image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<ProfileImageResponse>(response)
    } catch (error) {
      console.error("Network error while deleting profile image:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getProfileImageInfo: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/media/profile-image-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching profile image info:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  updateProfileImageUrl: async (data: ProfileImageUpdateRequest, token: string): Promise<ProfileImageResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/media/update-profile-image-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      return handleResponse<ProfileImageResponse>(response)
    } catch (error) {
      console.error("Network error while updating profile image URL:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  cleanupOrphanedImages: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/media/admin/cleanup-orphaned-images?self=true`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while cleaning up orphaned images:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Professional Profile API
export const prozApi = {
  registerProfile: async (profileData: ProzProfileCreate, token: string): Promise<ProzProfileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/proz/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })
      return handleResponse<ProzProfileResponse>(response)
    } catch (networkError) {
      console.error("Network error during profile registration:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getOwnProfile: async (token: string): Promise<ProzProfileResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/proz/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        // Profile not found is a normal case, return null instead of throwing
        return null
      }

      return handleResponse<ProzProfileResponse>(response)
    } catch (networkError) {
      console.error("Network error while fetching profile:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  updateProfile: async (profileData: ProzProfileUpdate, token: string): Promise<ProzProfileResponse> => {
    try {
      const cleanData: ProzProfileUpdate = {}

      Object.keys(profileData).forEach((key) => {
        const typedKey = key as keyof ProzProfileUpdate
        if (Object.prototype.hasOwnProperty.call(profileData, typedKey)) {
          if (
            typedKey === "education" ||
            typedKey === "certifications" ||
            typedKey === "website" ||
            typedKey === "linkedin" ||
            typedKey === "preferred_contact_method"
          ) {
            cleanData[typedKey] = profileData[typedKey] === null ? "" : profileData[typedKey]
          } else {
            cleanData[typedKey] = profileData[typedKey] as any
          }
        }
      })

      const response = await fetch(`${API_BASE_URL}/api/v1/proz/proz/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      })

      return handleResponse<ProzProfileResponse>(response)
    } catch (networkError) {
      console.error("Network error during profile update:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getSpecialties: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/proz/specialties`)
      return handleResponse<string[]>(response)
    } catch (networkError) {
      console.error("Network error while fetching specialties:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Admin API
export const adminApi = {
  getDashboard: async (token: string): Promise<AdminDashboardResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/dashboard?self=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<AdminDashboardResponse>(response)
    } catch (networkError) {
      console.error("Network error while fetching admin dashboard:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getVerificationStats: async (token: string): Promise<VerificationStatsAdmin> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/stats?self=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<VerificationStatsAdmin>(response)
    } catch (networkError) {
      console.error("Network error while fetching verification stats:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getProfilesForVerification: async (
    token: string,
    page = 1,
    pageSize = 20,
    verificationStatus?: string,
    search?: string,
    sortBy = "created_at",
    sortOrder = "desc",
  ): Promise<any> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        self: "true",
      })

      if (verificationStatus) params.append("verification_status", verificationStatus)
      if (search) params.append("search", search)

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/profiles?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (networkError) {
      console.warn("Network error while fetching profiles for verification:", networkError)
      // Return empty data structure as fallback for network errors
      return {
        profiles: [],
        total: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 0
      }
    }
  },

  getProfileForVerification: async (profileId: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/profiles/${profileId}?self=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (networkError) {
      console.error("Network error while fetching profile for verification:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  verifyProfile: async (
    profileId: string,
    verificationStatus: "verified" | "rejected" | "pending",
    token: string,
    adminNotes?: string,
    rejectionReason?: string,
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/profiles/${profileId}/verify?self=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verification_status: verificationStatus,
          admin_notes: adminNotes,
          rejection_reason: rejectionReason,
        }),
      })
      return handleResponse<any>(response)
    } catch (networkError) {
      console.warn("Network error during profile verification:", networkError)
      // Return a special response for network errors instead of throwing
      return {
        success: false,
        message: "Network error: Could not connect to the API.",
        isNetworkError: true,
        profileId,
        verificationStatus,
        adminNotes,
        rejectionReason
      }
    }
  },

  bulkVerifyProfiles: async (
    profileIds: string[],
    verificationStatus: "verified" | "rejected" | "pending",
    token: string,
    adminNotes?: string,
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/proz/profiles/bulk-verify?self=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile_ids: profileIds,
          verification_status: verificationStatus,
          admin_notes: adminNotes,
        }),
      })
      return handleResponse<any>(response)
    } catch (networkError) {
      console.error("Network error during bulk verification:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  toggleProfileFeatured: async (profileId: string, featured: boolean, token: string): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/proz/profiles/${profileId}/feature?featured=${featured}&self=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return handleResponse<any>(response)
    } catch (networkError) {
      console.error("Network error while toggling profile featured status:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  deleteProfile: async (profileId: string, reason: string, token: string): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/proz/profiles/${profileId}?reason=${encodeURIComponent(reason)}&self=true`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return handleResponse<any>(response)
    } catch (networkError) {
      console.error("Network error while deleting profile:", networkError)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Task Management API
export const taskApi = {
  // Service Requests
  createServiceRequest: async (data: ServiceRequestCreate): Promise<ServiceRequestResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/business-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return handleResponse<ServiceRequestResponse>(response)
    } catch (error) {
      console.error("Network error while creating service request:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getServiceRequest: async (requestId: string): Promise<ServiceRequestResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/service-requests/${requestId}`)
      return handleResponse<ServiceRequestResponse>(response)
    } catch (error) {
      console.error("Network error while fetching service request:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  // Admin Task Management
  getServiceRequestsAdmin: async (
    token: string,
    page = 1,
    pageSize = 20,
    status?: string,
    priority?: string,
    category?: string,
  ): Promise<any> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      if (status) params.append("status", status)
      if (priority) params.append("priority", priority)
      if (category) params.append("category", category)

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/service-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.warn("Service requests admin endpoint not available, returning fallback data:", error)
      // Return fallback data when endpoint is not available
      return {
        requests: [],
        total_count: 0,
        page: page,
        page_size: pageSize,
        total_pages: 0,
      }
    }
  },

  assignTask: async (data: TaskAssignmentCreate, token: string): Promise<TaskAssignmentResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/assign-task?self=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      return handleResponse<TaskAssignmentResponse>(response)
    } catch (error) {
      console.error("Network error while assigning task:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getTaskAssignmentsAdmin: async (
    token: string,
    page = 1,
    pageSize = 20,
    status?: string,
    prozId?: string,
  ): Promise<any> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      if (status) params.append("status", status)
      if (prozId) params.append("proz_id", prozId)

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/assignments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.warn("Task assignments admin endpoint not available, returning fallback data:", error)
      // Return fallback data when endpoint is not available
      return {
        assignments: [],
        total_count: 0,
        page: page,
        page_size: pageSize,
        total_pages: 0,
      }
    }
  },

  getAdminTaskStats: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.warn("Admin task stats endpoint not available, returning fallback data:", error)
      // Return fallback data when endpoint is not available
      return {
        total_requests: 0,
        pending_requests: 0,
        assigned_requests: 0,
        completed_requests: 0,
        urgent_requests: 0,
        unassigned_requests: 0,
        active_professionals: 0,
        requests_this_week: 0,
      }
    }
  },

  // Business Requests Management
  getBusinessRequestsAdmin: async (
    token: string,
    page = 1,
    limit = 20,
    status?: string,
    priority?: string,
    companyName?: string,
  ): Promise<any> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (status) params.append("status", status)
      if (priority) params.append("priority", priority)
      if (companyName) params.append("company_name", companyName)

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/business-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching business requests:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  createBusinessRequest: async (data: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/business-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while creating business request:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getBusinessRequest: async (requestId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/business-requests/${requestId}`)
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching business request:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  // Professional Task Management
  getProfessionalTasks: async (token: string, status?: string): Promise<ProfessionalTaskResponse[]> => {
    try {
      const params = status ? `?status=${status}` : ""
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/tasks${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<ProfessionalTaskResponse[]>(response)
    } catch (error) {
      console.warn("Network error while fetching professional tasks:", error)
      // Return empty array as fallback for network errors
      return []
    }
  },

  respondToTaskAssignment: async (assignmentId: string, responseData: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/tasks/${assignmentId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(responseData),
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while responding to task assignment:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  updateTaskStatus: async (assignmentId: string, newStatus: string, token: string, notes?: string): Promise<any> => {
    try {
      const params = new URLSearchParams({
        new_status: newStatus,
      })
      if (notes) params.append("notes", notes)

      const response = await fetch(
        `${API_BASE_URL}/api/v1/tasks/professional/tasks/${assignmentId}/update-status?${params}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while updating task status:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getProfessionalNotifications: async (
    token: string,
    unreadOnly = false,
    limit = 20,
  ): Promise<NotificationResponse[]> => {
    try {
      const params = new URLSearchParams({
        unread_only: unreadOnly.toString(),
        limit: limit.toString(),
      })
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/notifications?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<NotificationResponse[]>(response)
    } catch (error) {
      console.error("Network error while fetching notifications:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  markNotificationRead: async (notificationId: string, token: string): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tasks/professional/notifications/${notificationId}/mark-read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while marking notification as read:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  // New Professional Endpoints
  getMyAssignments: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/my-assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching my assignments:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  getAssignmentDetails: async (assignmentId: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/assignments/${assignmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while fetching assignment details:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  updateAssignmentStatus: async (assignmentId: string, status: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/assignments/${assignmentId}/status?status=${status}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while updating assignment status:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  autoSuggestProfessionals: async (serviceRequestId: string, limit = 5, token: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/auto-suggest-professionals?service_request_id=${serviceRequestId}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while auto-suggesting professionals:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  aiMatchProfessionals: async (serviceRequestId: string, limit = 10, token: string): Promise<
    Array<{
      proz_id: string
      name: string
      email: string
      location: string | null
      rating: number
      years_experience: number | null
      hourly_rate: number | null
      specialties: string[]
      profile_image_url?: string | null
      score: number
      reasons: string[]
    }>
  > => {
    try {
      const url = `${API_BASE_URL}/api/v1/tasks/admin/ai-match?service_request_id=${serviceRequestId}&limit=${limit}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while AI-matching professionals:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },

  assignTaskToProfessional: async (
    assignmentData: {
      service_request_id: string
      proz_id: string
      assignment_notes?: string
      estimated_hours?: number
      proposed_rate?: number
      due_date?: string
    },
    token: string
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/admin/assign-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      })
      return handleResponse<any>(response)
    } catch (error) {
      console.warn("Network error while assigning task to professional:", error)
      // Return a special response for network errors instead of throwing
      return {
        success: false,
        message: "Network error: Could not connect to the API.",
        isNetworkError: true,
        assignmentData
      }
    }
  },

  getProfessionalDashboardStats: async (token: string): Promise<DashboardStatsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/professional/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse<DashboardStatsResponse>(response)
    } catch (error) {
      console.error("Network error while fetching dashboard stats:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}

// Professional Profiles API
export const prozProfilesApi = {
  searchPublicProfiles: async (
    params: {
      page?: number
      page_size?: number
      query?: string
      location?: string
      specialty?: string
      min_rating?: number
      max_hourly_rate?: number
      min_experience?: number
      availability?: string
      is_featured?: boolean
      verification_status?: string
      show_unverified?: boolean
      sort_by?: string
      sort_order?: string
    } = {}
  ): Promise<any> => {
    try {
      const searchParams = new URLSearchParams()
      
      // Add all parameters to the search params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
      
      const queryString = searchParams.toString()
      const isBrowser = typeof window !== "undefined"
      let response: Response | null = null

      const backendBase = getServerBackendBaseUrl()
      const directUrl = withNgrokBypass(
        `${backendBase}/api/v1/proz/public/profiles${queryString ? `?${queryString}` : ""}`,
      )

      if (isBrowser) {
        const proxyUrl = `/api/proz/public/profiles${queryString ? `?${queryString}` : ""}`

        try {
          response = await fetch(proxyUrl, { cache: "no-store" })

          if (!response.ok) {
            console.warn("Proxy fetch failed, falling back to direct API:", response.status)
            response = null
          }
        } catch (proxyError) {
          console.warn("Proxy fetch error, falling back to direct API:", proxyError)
          response = null
        }
      }

      if (!response) {
        response = await fetch(directUrl, {
          cache: "no-store",
        })
      }
      return handleResponse<any>(response)
    } catch (error) {
      console.error("Network error while searching public profiles:", error)
      throw new Error("Network error: Could not connect to the API.")
    }
  },
}
