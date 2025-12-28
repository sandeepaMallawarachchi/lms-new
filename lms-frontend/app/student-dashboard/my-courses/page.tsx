"use client"

import { useEffect, useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { BookOpen, CheckCircle, Clock, AlertCircle, Search, CalendarDays, GraduationCap, Star, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getStudentProgressData, type StudentProgressData, type CourseProgress } from "@/data/student-progress"
import { getCurrentUser } from "@/data/user"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>("all")
  const router = useRouter()
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        
        // Fetch progress data which includes courses
        const progressData = await getStudentProgressData()
        
        if (progressData && progressData.courseProgress) {
          // Filter only active courses
          const activeCourses = progressData.courseProgress.filter(
            course => course.studentCourseEnrollmentStatus === 'ACTIVE'
          )
          setCourses(activeCourses)
        } else {
          setError("Failed to load course data. Please try again later.")
        }
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("An error occurred while loading your courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourses()
  }, [])

  // Filter courses based on search query and active tab
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") {
      return matchesSearch
    } else if (activeTab === "in-progress") {
      return matchesSearch && course.progressPercentage > 0 && course.progressPercentage < 100
    } else if (activeTab === "completed") {
      return matchesSearch && course.progressPercentage === 100
    } else if (activeTab === "not-started") {
      return matchesSearch && course.progressPercentage === 0
    }
    
    return matchesSearch
  })

  // Handle course click - navigate to course details
  const handleCourseClick = (courseId: number) => {
    router.push(`/student-dashboard/my-courses/${courseId}`)
  }

  // Get status badge for a course
  const getStatusBadge = (course: CourseProgress) => {
    if (course.progressPercentage === 100) {
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>
    } else if (course.progressPercentage > 0) {
      return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="mr-1 h-3 w-3" /> In Progress</Badge>
    } else {
      return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" /> Not Started</Badge>
    }
  }

  // Loading state
  if (loading) {
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
                    <BreadcrumbPage>My Courses</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
              </div>
              
              <div className="w-full md:w-1/3">
                <Skeleton className="h-10 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-10 w-72 mb-6" />
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Error state
  if (error) {
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
                    <BreadcrumbPage>My Courses</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-6">
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
                  <BreadcrumbPage>My Courses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                {/*<Button onClick={() => router.push('/student-dashboard/request-course')}>*/}
                {/*  Request New Course*/}
                {/*</Button>*/}
              </div>
              <p className="text-muted-foreground">View all your enrolled courses and track your progress</p>
            </div>
            
            {/*<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">*/}
            {/*  <div className="relative w-full md:w-1/3">*/}
            {/*    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />*/}
            {/*    <Input*/}
            {/*      type="search"*/}
            {/*      placeholder="Search courses..."*/}
            {/*      className="pl-8"*/}
            {/*      value={searchQuery}*/}
            {/*      onChange={(e) => setSearchQuery(e.target.value)}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*  */}
            {/*  <div className="flex items-center gap-2">*/}
            {/*    <Button variant="outline" size="sm">*/}
            {/*      <Filter className="mr-2 h-4 w-4" />*/}
            {/*      Filter*/}
            {/*    </Button>*/}
            {/*    <Button variant="outline" size="sm">*/}
            {/*      Sort by: Latest*/}
            {/*    </Button>*/}
            {/*  </div>*/}
            {/*</div>*/}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="hidden sm:flex w-full sm:w-auto border-b">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">
                  All Courses
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">{courses.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="flex-1 sm:flex-none">
                  In Progress
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">
                    {courses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                  Completed
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">
                    {courses.filter(c => c.progressPercentage === 100).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="not-started" className="flex-1 sm:flex-none">
                  Not Started
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">
                    {courses.filter(c => c.progressPercentage === 0).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {filteredCourses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                      <Card 
                        key={course.id}
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="aspect-video bg-muted relative">
                          {/* Course thumbnail would go here */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <BookOpen className="h-12 w-12 text-white/80" />
                          </div>
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(course)}
                          </div>
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>Enrolled: 2023-09-15</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{course.progressPercentage}%</span>
                            </div>
                            <Progress value={course.progressPercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{course.completedModules} of {course.totalModules} modules</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                <span>{course.completedChapters} of {course.totalChapters} lessons</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button className="w-full mt-4">
                            {course.progressPercentage === 0 ? 'Start Course' : 
                             course.progressPercentage === 100 ? 'View Again' : 'Continue Learning'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No courses found</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      {searchQuery 
                        ? "No courses match your search criteria. Try adjusting your search."
                        : "You don't have any courses in this category yet."}
                    </p>
                    {!searchQuery && activeTab !== "all" && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab("all")}
                      >
                        View all courses
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 