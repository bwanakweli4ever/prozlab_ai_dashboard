"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import type { User, UserLogin, UserCreate } from "@/types/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: UserLogin) => Promise<void>
  register: (userData: UserCreate) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to validate user data
function isValidUser(data: any): data is User {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "string" &&
    (typeof data.email === "string" || data.email === null) &&
    (typeof data.first_name === "string" || data.first_name === null) &&
    (typeof data.last_name === "string" || data.last_name === null) &&
    (typeof data.is_active === "boolean" || data.is_active === null)
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Handle redirect after user data is loaded
  useEffect(() => {
    if (!isLoading && user && token) {
      // Check if we're currently on an auth page (login, register, forgot-password, reset-password)
      const currentPath = window.location.pathname
      const isOnAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)
      
      // Always redirect after successful authentication, even from auth pages
      // This ensures users go to dashboard after registration/login
      if (user.is_superuser) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, token, isLoading, router])

  const fetchUser = async (authToken: string) => {
    try {
      const userData = await authApi.getCurrentUser(authToken)

      // Validate that userData has the expected shape
      if (isValidUser(userData)) {
        setUser(userData)
      } else {
        console.warn("Invalid user data received, clearing authentication")
        logout()
      }
    } catch (error) {
      // Check if it's an authentication error (401/403)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.log("Authentication token is invalid or expired, clearing session")
        logout()
      } else {
        console.error("Failed to fetch user:", error)
        logout()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: UserLogin) => {
    setIsLoading(true)
    try {
      const result = await authApi.login(credentials)
      console.log("Login successful")

      // Handle different response formats
      const access_token = result.access_token || ""

      if (!access_token) {
        throw new Error("No access token received from the server")
      }

      setToken(access_token)

      // Store token based on remember_me preference
      if (credentials.remember_me) {
        localStorage.setItem("token", access_token)
      } else {
        sessionStorage.setItem("token", access_token)
      }

      await fetchUser(access_token)
      
      // Redirect based on user role
      // Note: We need to check the user data after fetchUser completes
      // The user state will be updated by fetchUser, but we need to wait for it
      // We'll handle the redirect in a useEffect that watches for user changes
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: UserCreate) => {
    setIsLoading(true)
    try {
      await authApi.register(userData)
      // After registration, log the user in with remember_me set to false by default
      // The login function will handle the redirect based on user role
      await login({
        email: userData.email,
        password: userData.password,
        remember_me: false,
      })
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("Logging out user and redirecting to homepage")
    // Clear authentication state first
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    
    // Use push instead of replace to ensure proper navigation
    // and add a small delay to ensure state is cleared
    setTimeout(() => {
      router.push("/")
    }, 50)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
