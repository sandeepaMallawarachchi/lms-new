"use client"

import { notFound, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CalendarDays, BookOpen, GraduationCap, Clock, CheckCircle, XCircle, LoaderCircle } from "lucide-react"
import { getStudentDetails, getStudentCourseDetails, StudentDetails, StudentCourseDetails } from "@/data/students"

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<StudentDetails | null>(null)
  const [courseDetails, setCourseDetails] = useState<Record<number, StudentCourseDetails>>({})

  // Handle params as promise
  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      const parsedId = Number.parseInt(resolvedParams.id);
      if (!isNaN(parsedId)) {
        setStudentId(parsedId);
      }
    });
  }, [params]);

  useEffect(() => {
    if (!studentId) return

    const fetchStudentData = async () => {
      try {
        setLoading(true)

        if (isNaN(studentId)) {
          throw new Error('Invalid student ID')
        }

        // Fetch student profile data
        const data = await getStudentDetails(studentId)
        if (!data) {
          throw new Error('Failed to fetch student data')
        }
        setStudentData(data)

        // Fetch course details for each course
        const courseDetailsData: Record<number, StudentCourseDetails> = {}
        for (const course of data.courseProgress) {
          const courseData = await getStudentCourseDetails(studentId, course.courseId)
          if (courseData) {
            courseDetailsData[course.courseId] = courseData
          }
        }
        setCourseDetails(courseDetailsData)

      } catch (err) {
        console.error('Error fetching student data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId])

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading student data...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !studentData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error || 'Student not found'}</p>
            <Button onClick={() => router.push('/students')}>
              Back to Students
            </Button>
          </div>
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
                  <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/students">Students</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{studentData.fullName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <Button variant="outline" onClick={() => router.push('/students')}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Student Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white rounded-xl p-6 shadow-sm">
            <div className="flex gap-4 items-center">
              <Avatar className="h-24 w-24 rounded-full border-4 border-blue-100">
                <AvatarFallback className="text-3xl">{studentData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{studentData.fullName}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${studentData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {studentData.status}
                  </span>
                </div>
                <p className="text-gray-500">{studentData.email}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-3">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-2">Student ID:</span>
                    <span>{studentData.studentId}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-2">Department:</span>
                    <span>{studentData.department}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-2">Enrolled Since:</span>
                    <span>{new Date(studentData.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 mr-2">Overall Progress:</span>
                    <span>{studentData.overallProgressPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="course-progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="course-progress">Course Progress</TabsTrigger>
              <TabsTrigger value="enrollment-details">Enrollment Details</TabsTrigger>
            </TabsList>

            {/* Course Progress Tab */}
            <TabsContent value="course-progress" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Course Progress</h2>

              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium">Overall Completion</h3>
                  <span className="font-medium">{studentData.overallProgressPercentage}%</span>
                </div>
                <Progress className="h-3" value={studentData.overallProgressPercentage} />
              </div>

              {/* Individual Course Progress */}
              <div className="space-y-6">
                {studentData.courseProgress.map((course) => {
                  const detailedCourse = courseDetails[course.courseId];

                  return (
                    <div key={course.courseId} className="border rounded-lg overflow-hidden">
                      <div className="flex items-start justify-between bg-gray-50 p-4 border-b">
                        <div>
                          <h4 className="text-lg font-medium">{course.courseTitle}</h4>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <CalendarDays className="h-4 w-4 mr-1" />
                            Enrolled: {new Date(course.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{course.progressPercentage}%</div>
                          <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Completed: {course.completedChapters}/{course.totalChapters} chapters
                          </p>
                          {course.finalScore !== null && (
                            <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              Final Score: {course.finalScore}%
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-2 relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div className="text-xs font-semibold text-blue-700">
                              {course.progressPercentage < 30 ? 'Getting Started' :
                                course.progressPercentage < 70 ? 'In Progress' : 'Almost Complete'}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${course.progressPercentage >= 70 ? 'bg-green-500' :
                                course.progressPercentage >= 40 ? 'bg-blue-500' : 'bg-blue-400'
                                }`}
                              style={{ width: `${course.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Course Modules */}
                        {course.modules && course.modules.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {course.modules.map((module) => (
                              <div key={module.moduleId} className="py-2">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                  <div className="flex items-center">
                                    {module.completed ?
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> :
                                      <Clock className="h-5 w-5 text-orange-400 mr-2" />
                                    }
                                    <span className="font-medium">{module.moduleTitle}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">{module.progressPercentage}%</span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${module.completed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                      }`}>
                                      {module.completed ? 'Completed' : 'In Progress'}
                                    </span>
                                  </div>
                                </div>

                                {/* Chapter list for this module */}
                                <div className="ml-6 space-y-1">
                                  {module.chapters.map((chapter) => (
                                    <div key={chapter.chapterId} className="flex items-center justify-between text-sm py-1">
                                      <span>{chapter.chapterTitle}</span>
                                      {chapter.completed ?
                                        <CheckCircle className="h-4 w-4 text-green-500" /> :
                                        <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                                      }
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {studentData.courseProgress.length === 0 && (
                  <div className="border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No courses enrolled yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Enrollment Details Tab */}
            <TabsContent value="enrollment-details" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Enrollment Details</h2>

              {studentData.courseProgress.map((course) => {
                const detailedCourse = courseDetails[course.courseId];

                return detailedCourse ? (
                  <Card key={course.courseId}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">{detailedCourse.title}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Total Modules</p>
                          <p className="text-2xl font-bold">{detailedCourse.totalModules}</p>
                          <p className="text-xs text-gray-500 mt-1">Completed: {detailedCourse.completedModules}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Total Chapters</p>
                          <p className="text-2xl font-bold">{detailedCourse.totalChapters}</p>
                          <p className="text-xs text-gray-500 mt-1">Completed: {detailedCourse.completedChapters}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">Progress</p>
                          <p className="text-2xl font-bold">{detailedCourse.progressPercentage}%</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {detailedCourse.completed ? 'Completed' : 'In Progress'}
                          </p>
                        </div>
                      </div>

                      {/* Module List */}
                      <div className="space-y-4 mt-6">
                        <h4 className="text-md font-medium">Module Details</h4>
                        {detailedCourse.items.map((module) => (
                          <div key={module.id} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                              <h5 className="font-medium">{module.title}</h5>
                              <span className="text-sm">{module.progressPercentage}% complete</span>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-gray-500 mb-2">{module.description}</p>
                              <p className="text-xs mb-3">Completed {module.completedItems} of {module.totalItems} items</p>

                              {/* Module chapters */}
                              <div className="space-y-2 mt-3">
                                {module.chapters.map((chapter) => (
                                  <div key={chapter.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                    <div>
                                      <p>{chapter.title}</p>
                                      {chapter.videoContent && (
                                        <p className="text-xs text-gray-500">
                                          {chapter.timeSpentSeconds > 0
                                            ? `Time spent: ${Math.floor(chapter.timeSpentSeconds / 60)} min ${chapter.timeSpentSeconds % 60} sec`
                                            : 'Not started yet'}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-xs mr-2">{chapter.progressPercentage}%</span>
                                      {chapter.completed ?
                                        <CheckCircle className="h-4 w-4 text-green-500" /> :
                                        <Clock className="h-4 w-4 text-amber-500" />
                                      }
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })}

              {Object.keys(courseDetails).length === 0 && (
                <div className="border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No detailed course information available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 