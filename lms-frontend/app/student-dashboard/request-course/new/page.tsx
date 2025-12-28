"use client"

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import { getCurrentUser } from "@/data/user"
import { getPublishedCourses} from "@/data/courses"
import { Course } from "@/types/course"
import { getToken } from "@/lib/auth"
import { API_BASE_URL } from "@/data/api"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [userData, setUserData] = useState<{name: string, email: string} | null>(null)
  const [formData, setFormData] = useState({
    courseIds: [] as string[],
    reason: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userProfile = await getCurrentUser()
        if (userProfile) {
          setUserData({
            name: userProfile.firstName && userProfile.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : userProfile.username,
            email: userProfile.email
          })
        }

        // Fetch available courses
        const availableCourses = await getPublishedCourses()
        setCourses(availableCourses)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/student/course-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseIds: formData.courseIds.map(id => parseInt(id)),
          reason: formData.reason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit course request')
      }

      toast({
        title: "Success",
        description: "Your course request has been submitted successfully.",
      })
      
      router.push('/student-dashboard/request-course')
    } catch (error) {
      console.error('Error submitting course request:', error)
      toast({
        title: "Error",
        description: "Failed to submit course request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      courseIds: [...prev.courseIds, value]
    }))
  }

  const handleCourseRemove = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.filter(id => id !== courseId)
    }))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/student-dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/student-dashboard/request-course">Course Requests</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Request</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Request a New Course</h1>
              <p className="text-muted-foreground">
                Select courses from the list below to request enrollment.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Request Form
                </CardTitle>
                <CardDescription>
                  Choose the courses you would like to enroll in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* User Information (Read-only) */}
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={userData?.name || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={userData?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Select Courses</Label>
                    <Select
                      onValueChange={handleCourseSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter(course => !formData.courseIds.includes(course.id.toString()))
                          .map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Courses */}
                    {formData.courseIds.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label>Selected Courses</Label>
                        <div className="space-y-2">
                          {formData.courseIds.map(courseId => {
                            const course = courses.find(c => c.id.toString() === courseId)
                            return course ? (
                              <div key={courseId} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <span>{course.title}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCourseRemove(courseId)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reason Field */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Request</Label>
                    <Textarea
                      id="reason"
                      placeholder="Why do you want to enroll in these courses?"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>

                  <CardFooter className="flex justify-end gap-4 px-0 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || formData.courseIds.length === 0 || !formData.reason}
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 