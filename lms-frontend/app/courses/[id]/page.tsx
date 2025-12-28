'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from "../../../components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit, FileText, Lock, Play, Plus, Unlock } from "lucide-react"
// import { courses } from "../../../data/courses"
import Link from "next/link"
import { Course } from '@/types/course';
import { getCourseById } from '@/data/courses';
import { VideoPlayer } from "@/components/video-player"

// Korean Won symbol component
const KoreanWon = ({ className }: { className?: string }) => (
  <span className={`${className} flex items-center justify-center text-muted-foreground`}>
    &#8361;
  </span>
);

export default function CourseDetailPage({ params }: { params: { id: string } }) {

  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    // Handle params as promise
    Promise.resolve(params).then((resolvedParams) => {
      setCourseId(resolvedParams.id);
    });
  }, [params]);

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if courseId is not available yet
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const parsedCourseId = Number.parseInt(courseId);
        if (isNaN(parsedCourseId)) {
          throw new Error('Invalid course ID');
        }

        const response = await getCourseById(parsedCourseId);
        if (!response) {
          throw new Error('Course not found');
        }
        setCourse(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Course not found</h1>
            <p className="mt-2">The course you are looking for does not exist.</p>
            <Button asChild className="mt-4">
              <Link href="/courses">Back to Courses</Link>
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Rashin한국 말누리 센터</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Course Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{course.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex  flex-1 flex-col gap-4 p-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/courses/${course.id}/modules/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/*<div className="flex items-center gap-2">*/}
                    {/*  <Clock className="h-5 w-5 text-muted-foreground" />*/}
                    {/*  <span>Duration: {course.durationInWeeks}</span>*/}
                    {/*</div>*/}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        &#8361;
                      </span>
                      <span>Fee: {course.fee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>Modules: {course.modules.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="modules" className="mt-6">
                <TabsList>
                  <TabsTrigger value="modules">Modules & Chapters</TabsTrigger>
                  {course.hasAssessment && <TabsTrigger value="questionnaire">Assessment</TabsTrigger>}
                </TabsList>
                <TabsContent value="modules" className="mt-4">
                  {course.modules.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-6">
                          <p className="text-muted-foreground mb-4">No modules have been added to this course yet.</p>
                          <Button asChild>
                            <Link href={`/courses/${course.id}/modules/new`}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Module
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {course.modules
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((module) => (
                          <Card key={module.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle>{module.title}</CardTitle>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/chapters/new`}>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add Chapter
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {module.chapters.length === 0 ? (
                                <div className="text-center py-4">
                                  <p className="text-muted-foreground text-sm">No chapters in this module</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {module.chapters
                                    .sort((a, b) => a.orderIndex - b.orderIndex)
                                    .map((chapter) => (
                                      <div
                                        key={chapter.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                      >
                                        <div className="flex items-center gap-3">
                                          {chapter.free ? (
                                            <Unlock className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Lock className="h-4 w-4 text-amber-500" />
                                          )}
                                          <div>
                                            <p className="font-medium">{chapter.title}</p>
                                            <p className="text-sm text-muted-foreground">{chapter.description}</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          {chapter.youtubeLink && (
                                            <Badge
                                              variant="outline"
                                              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 cursor-pointer"
                                              onClick={() => chapter.youtubeLink && setSelectedVideo(chapter.youtubeLink)}
                                            >
                                              <Play className="h-3 w-3 mr-1" /> Video
                                            </Badge>
                                          )}
                                          <Button variant="ghost" size="sm" asChild>
                                            <Link
                                              href={`/courses/${course.id}/modules/${module.id}/chapters/${chapter.id}/edit`}
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </Link>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </TabsContent>
                {course.hasAssessment && course.questionnaires && course.questionnaires.length > 0 && (
                  <TabsContent value="questionnaire" className="mt-4">
                    {course.questionnaires.map((questionnaire) => (
                      <Card key={questionnaire?.id || 'default-key'}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{questionnaire?.title || 'Assessment'}</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/courses/${course.id}/questionnaire/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Assessment
                              </Link>
                            </Button>
                          </div>
                          <CardDescription>{questionnaire?.description || ''}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {questionnaire?.questions && Array.isArray(questionnaire.questions) && questionnaire.questions.length > 0 ? (
                              questionnaire.questions.map((question, index) => (
                                <div key={question?.id || `question-${index}`} className="border rounded-lg p-4">
                                  <div className="flex justify-between">
                                    <h3 className="font-medium">Question {index + 1}</h3>
                                    <Badge>{question?.questionType || 'Unknown'}</Badge>
                                  </div>
                                  <p className="mt-2">{question?.questionText || ''}</p>
                                  {question?.questionType === "multiple-choice" && question?.options && Array.isArray(question.options) && (
                                    <div className="mt-3 space-y-2">
                                      {question.options.map((option, optIndex) => (
                                        <div key={`option-${optIndex}`} className="flex items-center gap-2">
                                          <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${question.correctAnswer === optIndex
                                              ? "bg-green-100 border-green-500"
                                              : "border-gray-300"
                                              }`}
                                          >
                                            {question.correctAnswer === optIndex && (
                                              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                            )}
                                          </div>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">No questions available in this assessment</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                )}
              </Tabs>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Course Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Modules</p>
                      <p className="text-2xl font-bold">{course.modules.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Chapters</p>
                      <p className="text-2xl font-bold">
                        {course.modules.reduce((acc, module) => acc + module.chapters.length, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Free Chapters</p>
                      <p className="text-2xl font-bold">
                        {course.modules.reduce(
                          (acc, module) => acc + module.chapters.filter((chapter) => chapter.free).length,
                          0,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Video Chapters</p>
                      <p className="text-2xl font-bold">
                        {course.modules.reduce(
                          (acc, module) => acc + module.chapters.filter((chapter) => chapter.youtubeLink).length,
                          0,
                        )}
                      </p>
                    </div>
                    {course.hasAssessment && course.questionnaires && course.questionnaires.length > 0 && course.questionnaires[0]?.questions && Array.isArray(course.questionnaires[0].questions) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Assessment Questions</p>
                        <p className="text-2xl font-bold">{course.questionnaires[0].questions.length}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/*<div className="mt-4">*/}
              {/*  <Button variant="outline" className="w-full" asChild>*/}
              {/*    <Link href={`/courses/${course.id}/questionnaire/new`}>*/}
              {/*      {course.questionnaires && course.questionnaires.length > 0 ? <>Edit Assessment</> : <>Add Assessment</>}*/}
              {/*    </Link>*/}
              {/*  </Button>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
        {selectedVideo && (
          <VideoPlayer
            videoUrl={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
