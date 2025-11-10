"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { prozApi } from "@/lib/api"
import { useAuth } from "./auth-context"
import type { ProzProfileCreate, ProzProfileResponse, ProzProfileUpdate } from "@/types/api"

// Use the actual API response type for consistency
type Profile = ProzProfileResponse

interface ProfileContextProps {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  createProfile: (profileData: ProzProfileCreate) => Promise<ProzProfileResponse>
  updateProfile: (profileData: ProzProfileUpdate) => Promise<ProzProfileResponse>
  calculateProfileCompletion: () => { percentage: number; missingFields: string[] }
}

const ProfileContext = createContext<ProfileContextProps>({
  profile: null,
  isLoading: false,
  error: null,
  fetchProfile: async () => {},
  createProfile: async () => ({} as ProzProfileResponse),
  updateProfile: async () => ({} as ProzProfileResponse),
  calculateProfileCompletion: () => ({ percentage: 0, missingFields: [] }),
})

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const fetchProfile = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const profileData = await prozApi.getOwnProfile(token)
      setProfile(profileData)
      setError(null)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in profile fetch, user may need to re-login")
        // Don't set error state for auth errors, just log a warning
        // The auth context will handle the logout
        setError(null)
      } else {
        // For other errors, set the error state
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const createProfile = async (profileData: ProzProfileCreate): Promise<ProzProfileResponse> => {
    if (!token) {
      throw new Error("You must be logged in to create a profile")
    }

    setIsLoading(true)
    try {
      const newProfile = await prozApi.registerProfile(profileData, token)
      setProfile(newProfile)
      setError(null)
      return newProfile
    } catch (error) {
      console.error("Failed to create profile:", error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile"
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in profile creation, user may need to re-login")
        setError(null)
      } else {
        setError(errorMessage)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: ProzProfileUpdate): Promise<ProzProfileResponse> => {
    if (!token) {
      throw new Error("You must be logged in to update a profile")
    }

    setIsLoading(true)
    try {
      const updatedProfile = await prozApi.updateProfile(profileData, token)
      setProfile(updatedProfile)
      setError(null)
      return updatedProfile
    } catch (error) {
      console.error("Failed to update profile:", error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in profile update, user may need to re-login")
        setError(null)
      } else {
        setError(errorMessage)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProfileCompletion = (): { percentage: number; missingFields: string[] } => {
    if (!profile) {
      return { percentage: 0, missingFields: [] }
    }

    const requiredFields = [
      'first_name',
      'last_name', 
      'email',
      'phone_number',
      'bio',
      'location',
      'years_experience',
      'hourly_rate',
      'availability',
      'education',
      'certifications',
      'website',
      'linkedin',
      'preferred_contact_method'
    ]

    const optionalFields: string[] = []

    const missingRequired: string[] = []
    const missingOptional: string[] = []

    // Check required fields
    requiredFields.forEach(field => {
      const value = profile[field as keyof Profile]
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingRequired.push(field)
      }
    })

    // Check optional fields
    optionalFields.forEach(field => {
      const value = profile[field as keyof Profile]
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingOptional.push(field)
      }
    })

    // Calculate percentage (all fields are required for 100%)
    const totalRequired = requiredFields.length
    const completedRequired = totalRequired - missingRequired.length
    
    // All fields are required for 100% completion
    const totalPercentage = Math.round((completedRequired / totalRequired) * 100)

    return {
      percentage: totalPercentage,
      missingFields: [...missingRequired, ...missingOptional]
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token])

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error, fetchProfile, createProfile, updateProfile, calculateProfileCompletion }}>{children}</ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
