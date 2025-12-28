"use client"

import { useEffect, useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, BookOpen, PlayCircle, FileText, CheckCircle, Clock, AlertCircle, Bell, BookText, Lock } from "lucide-react"
import Link from "next/link"
import { getStudentProgressData, type StudentProgressData, type CourseProgress } from "@/data/student-progress"
import { getCurrentUser } from "@/data/user"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<StudentProgressData | null>(null)
  const [userData, setUserData] = useState<{name: string, email: string, avatar: string} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch both user data and progress data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userProfile = await getCurrentUser()
        if (userProfile) {
          setUserData({
            name: userProfile.firstName && userProfile.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : userProfile.username,
            email: userProfile.email,
            avatar: userProfile.profileImage || "/avatars/user-placeholder.jpg",
          })
        }
        
        // Fetch progress data
        const progress = await getStudentProgressData()
        if (progress) {
          setProgressData(progress)
        } else {
          setError("Failed to load progress data. Please try again later.")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("An error occurred while loading your dashboard. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Handle loading state
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold md:text-xl">Student Dashboard</h1>
            </div>
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full md:h-20 md:w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex-1 md:ml-auto">
                <Card className="border-none shadow-none">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Skeleton loaders for tabs content */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-72" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Handle error state
  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold md:text-xl">Student Dashboard</h1>
            </div>
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Add a function to filter active courses
  const getActiveCourses = () => {
    if (!progressData?.courseProgress) return [];
    return progressData.courseProgress.filter(course => course.studentCourseEnrollmentStatus === 'ACTIVE');
  };

  // Add a function to get in-progress courses
  const getInProgressCourses = () => {
    const activeCourses = getActiveCourses();
    return activeCourses.filter(course => course.progressPercentage > 0 && course.progressPercentage < 100);
  };

  // Get courses with content (have at least one item/module)
  const coursesWithContent = progressData?.courseProgress.filter(
    course => course.items && course.items.length > 0
  ) || []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold md:text-xl">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={userData?.avatar} alt={userData?.name || 'User'} />
              <AvatarFallback>{userData?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src={userData?.avatar} alt={userData?.name || 'User'} />
                <AvatarFallback>{userData?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData?.name || 'Student'}</h2>
                <p className="text-muted-foreground">{userData?.email || ''}</p>
              </div>
            </div>
            <div className="flex-1 md:ml-auto">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Overall Progress</div>
                      <div className="text-sm font-medium">{progressData?.overallProgress.progressPercentage || 0}%</div>
                    </div>
                    <Progress value={progressData?.overallProgress.progressPercentage || 0} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {progressData?.overallProgress.completedChapters || 0} of {progressData?.overallProgress.totalChapters || 0} chapters completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* In Progress Courses */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Courses in Progress</CardTitle>
                    <CardDescription>Your active courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getInProgressCourses().length > 0 ? (
                      <div className="space-y-4">
                        {getInProgressCourses().map((course) => (
                          <div key={course.id} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{course.title}</div>
                              <Badge variant="outline">{course.progressPercentage}%</Badge>
                            </div>
                            <Progress value={course.progressPercentage} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {course.completedChapters} of {course.totalChapters} chapters completed
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <BookText className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No courses in progress</p>
                        <p className="text-xs text-muted-foreground">Start learning to see your progress here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Overall Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Progress Overview</CardTitle>
                    <CardDescription>Your learning statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Active Courses</div>
                          <div className="text-sm text-muted-foreground">
                            {getActiveCourses().length} courses enrolled
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Completed</div>
                          <div className="text-sm text-muted-foreground">
                            {progressData?.overallProgress.completedChapters || 0} chapters complete
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">In Progress</div>
                          <div className="text-sm text-muted-foreground">
                            {(progressData?.overallProgress.totalChapters || 0) - (progressData?.overallProgress.completedChapters || 0)} chapters remaining
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Continue Learning */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Continue Learning</CardTitle>
                    <CardDescription>Pick up where you left off</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getInProgressCourses().length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">{getInProgressCourses()[0].title}</div>
                          <Progress value={getInProgressCourses()[0].progressPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mb-4">
                            {getInProgressCourses()[0].progressPercentage}% complete
                          </div>
                          
                          <Link href={`/student-dashboard/my-courses/${getInProgressCourses()[0].id}`}>
                            <Button className="w-full">
                              Continue Course
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <PlayCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No courses to continue</p>
                        <p className="text-xs text-muted-foreground">Enroll in a course to get started.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* My Courses Tab */}
            <TabsContent value="my-courses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getActiveCourses().map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progressPercentage} className="flex-1 h-2" />
                          <span className="text-xs font-medium">{course.progressPercentage}%</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Modules:</span>
                          <span>{course.completedModules} / {course.totalModules}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Chapters:</span>
                          <span>{course.completedChapters} / {course.totalChapters}</span>
                        </div>
                        
                        <Link href={`/student-dashboard/my-courses/${course.id}`}>
                          <Button className="w-full mt-4">
                            {course.progressPercentage === 0 ? 'Start Course' : 
                             course.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {progressData?.courseProgress.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No courses enrolled</h3>
                    <p className="text-muted-foreground mt-2">You haven't enrolled in any courses yet.</p>
                    <Link href="/courses">
                      <Button className="mt-6">Browse Available Courses</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 