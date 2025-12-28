"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, CheckCircle, Clock, LucideIcon, PlayCircle, BookOpen, FileText, LockIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { getStudentProgressData, type CourseProgress, type ModuleProgress } from "@/data/student-progress"
import { type StudentChapterProgress } from "@/data/students"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function CourseContentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.courseId)
  
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<CourseProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null)
  
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        
        const progressData = await getStudentProgressData()
        if (!progressData) {
          setError("Failed to load course data. Please try again later.")
          return
        }
        
        // Find the course by ID
        const foundCourse = progressData.courseProgress.find(c => c.id === courseId)
        if (!foundCourse) {
          setError(`Course with ID ${courseId} not found.`)
          return
        }
        
        setCourse(foundCourse)
        
        // Set the first module as active by default
        if (foundCourse.items && foundCourse.items.length > 0) {
          setActiveModuleId(foundCourse.items[0].id)
        }
      } catch (err) {
        console.error("Error fetching course data:", err)
        setError("An error occurred while loading the course. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])
  
  // Get the active module
  const activeModule = course?.items.find(module => module.id === activeModuleId) || null
  const chapters = activeModule?.chapters as StudentChapterProgress[] || []
  
  // Handle loading state
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/student-dashboard/my-courses">My Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Skeleton className="h-5 w-24" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-4">
              <Skeleton className="md:col-span-1 h-[500px]" />
              <Skeleton className="md:col-span-3 h-[500px]" />
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
          <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/student-dashboard/my-courses">My Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Course Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/student-dashboard/my-courses">
                      Back to My Courses
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  // Function to get chapter icon
  const getChapterIcon = (chapter: StudentChapterProgress): LucideIcon => {
    if (chapter.completed) {
      return CheckCircle
    }
    return PlayCircle
  }
  
  // Function to get chapter status color
  const getChapterStatus = (chapter: StudentChapterProgress) => {
    if (chapter.completed) {
      return {
        icon: CheckCircle,
        iconColor: "text-green-500",
        bgColor: "bg-green-50"
      }
    }
    return {
      icon: Clock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50"
    }
  }

  // Function to render video thumbnail
  const renderVideoThumbnail = (chapter: StudentChapterProgress) => {
    // Extract YouTube video ID from youtubeLink
    const getYoutubeVideoId = (url: string) => {
      if (!url) return null;
      
      // Match YouTube URL patterns
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11)
        ? match[2]
        : null;
    };

    // Fallback thumbnails if no YouTube link is available
    const videoThumbnails = [
      "https://i.ytimg.com/vi/s5aobqyEaMQ/hqdefault.jpg",
      "https://i.ytimg.com/vi/v14JSpyCDs0/hqdefault.jpg",
      "https://i.ytimg.com/vi/ANyNA_SMHwI/hqdefault.jpg",
      "https://i.ytimg.com/vi/Cw95YELX1AI/hqdefault.jpg",
      "https://i.ytimg.com/vi/KN-_q-JNI_w/hqdefault.jpg"
    ];
    
    // Use actual YouTube thumbnail if available, otherwise fallback to placeholders
    // Access youtubeLink safely, as it might not be in the Chapter type
    const youtubeLink = (chapter as any).youtubeLink;
    const videoId = youtubeLink ? getYoutubeVideoId(youtubeLink) : null;
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : videoThumbnails[chapter.id % videoThumbnails.length];
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/student-dashboard/my-courses">My Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{course?.title}</h1>
              <div className="flex items-center gap-2">
                <Progress value={course?.progressPercentage || 0} className="w-40 h-2" />
                <span className="text-sm text-muted-foreground">{course?.progressPercentage || 0}% Complete</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
              <Link href="/student-dashboard">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
            {/* Module List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>
                  {course?.completedModules || 0} of {course?.totalModules || 0} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {course?.items.map((module) => (
                    <button
                      key={module.id}
                      className={`flex items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        activeModuleId === module.id 
                          ? "border-l-primary bg-muted/50" 
                          : "border-l-transparent"
                      }`}
                      onClick={() => setActiveModuleId(module.id)}
                    >
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 shrink-0" />
                      ) : (
                        <BookOpen className="h-5 w-5 mt-0.5 text-blue-500 shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{module.title}</span>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1">
                            <Progress value={module.progressPercentage} className="h-1.5 w-full" />
                          </div>
                          <span className="text-xs text-muted-foreground">{module.progressPercentage}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {module.chapters.length} chapters
                        </span>
                      </div>
                    </button>
                  ))}
                  
                  {course?.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center px-4">
                      <p className="text-muted-foreground">No modules found in this course.</p>
                    </div>
                  )}
                </nav>
              </CardContent>
            </Card>
            
            {/* Chapter List */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>{activeModule?.title || "Module Content"}</CardTitle>
                <CardDescription>
                  {activeModule?.description || "Select a module to view its content"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeModule ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        Module Progress: {activeModule.progressPercentage}%
                      </div>
                      <Badge variant={activeModule.completed ? "secondary" : "outline"}>
                        {activeModule.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    
                    <Progress value={activeModule.progressPercentage} className="h-2 mb-6" />
                    
                    <div className="space-y-4">
                      {chapters.map((chapter, index) => {
                        const { icon: ChapterIcon, iconColor, bgColor } = getChapterStatus(chapter)
                        const thumbnailUrl = renderVideoThumbnail(chapter);
                        
                        // Check if previous chapter is completed
                        const isPreviousChapterCompleted = index === 0 || 
                          chapters[index - 1].progressPercentage === 100;
                        const isDisabled = !isPreviousChapterCompleted;
                        
                        return (
                          <div key={chapter.id}>
                            {index > 0 && <Separator className="my-4" />}
                            <div className="flex gap-4">
                              <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                <img src={thumbnailUrl} alt="" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <PlayCircle className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{chapter.title}</h3>
                                  {chapter.completed && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {chapter.description}
                                </p>
                                <div className="flex gap-3 mt-3">
                                  <Button 
                                    variant={chapter.completed ? "outline" : "default"}
                                    size="sm"
                                    disabled={isDisabled}
                                    onClick={() => router.push(`/student-dashboard/my-courses/${courseId}/${chapter.id}`)}
                                  >
                                    {chapter.completed ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        View Again
                                      </>
                                    ) : (
                                      <>
                                        <PlayCircle className="h-4 w-4 mr-1" />
                                        Start Chapter
                                      </>
                                    )}
                                  </Button>
                                  {chapter.completed && (
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-1" />
                                      View Notes
                                    </Button>
                                  )}
                                </div>
                                {isDisabled && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Complete the previous chapter to unlock this chapter
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {chapters.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <p className="text-muted-foreground">No chapters found in this module.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No module selected</h3>
                    <p className="text-muted-foreground mt-2">Please select a module from the sidebar to view its content.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 