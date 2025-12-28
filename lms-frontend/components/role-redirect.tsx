"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser } from '@/data/user'

export function RoleRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // Skip redirection on login page or if already redirected
        if (pathname === '/login' || sessionStorage.getItem('redirected')) {
          setIsChecking(false)
          return
        }
        
        const userProfile = await getCurrentUser()
        
        if (!userProfile) {
          // If no user profile, redirect to login
          router.push('/login')
          return
        }
        
        // Check if user is admin
        const isAdmin = userProfile.roles?.some(role => role.name === 'ROLE_ADMIN')
          || userProfile.authorities?.some(auth => auth.authority === 'ROLE_ADMIN')
        
        // Set redirected flag to prevent infinite redirects
        sessionStorage.setItem('redirected', 'true')
        
        // Redirect based on role
        if (isAdmin) {
          if (pathname === '/' || pathname === '/login' || pathname.startsWith('/student-dashboard')) {
            router.push('/courses')
          }
        } else {
          if (pathname === '/' || pathname === '/login' || pathname.startsWith('/courses')) {
            router.push('/student-dashboard')
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserAndRedirect()
    
    // Clear the redirected flag when component unmounts
    return () => {
      sessionStorage.removeItem('redirected')
    }
  }, [pathname, router])

  return null // This component doesn't render anything
} 