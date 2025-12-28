"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoginForm } from "@/components/login-02"
import { login } from "@/lib/auth"
import { getCurrentUser } from "@/data/user"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Use the login service to authenticate
      const { token } = await login({ username, password })
      
      // Store the token in a cookie and localStorage
      document.cookie = `auth=${token}; path=/; max-age=86400`; // 24 hours
      localStorage.setItem('token', token);
      
      console.log('Authentication successful, token stored.')
      
      // Get user profile to determine role
      const userProfile = await getCurrentUser()
      
      // Redirect based on user role
      if (userProfile) {
        const isAdmin = userProfile.roles?.some(role => role.name === 'ROLE_ADMIN')
          || userProfile.authorities?.some(auth => auth.authority === 'ROLE_ADMIN')
        
        if (isAdmin) {
          router.push("/courses")
        } else {
          router.push("/student-dashboard")
        }
      } else {
        // Default redirect if user profile not available
        router.push("/courses")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        <LoginForm 
          onSubmit={handleLogin} 
          isLoading={isLoading} 
          error={error}
        />
      </div>
    </div>
  )
} 