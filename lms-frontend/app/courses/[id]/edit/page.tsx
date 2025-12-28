"use client"

import { AppSidebar } from "../../../../components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { getCourseById, updateCourse, deleteCourse } from "../../../../data/courses"
import { Course } from "../../../../types/course"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export default function EditCoursePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [courseId, setCourseId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)

  // Handle params as promise
  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      const parsedId = Number.parseInt(resolvedParams.id);
      if (!isNaN(parsedId)) {
        setCourseId(parsedId);
      }
    });
  }, [params]);

  // Fetch course only when courseId is available
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
      } catch (error) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: "Failed to fetch course data",
          variant: "destructive",
        })
      }
    }

    fetchCourse()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID is missing",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      const courseData: any = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        fee: formData.get("fee") as string,
        published: formData.get("published") === "on",
        numberOfModules: course?.numberOfModules || 0,
        totalChapters: course?.totalChapters || 0,
        freeChapters: course?.freeChapters || 0,
        thumbnailUrl: course?.thumbnailUrl
      }

      console.log('Submitting course update:', courseData);

      await updateCourse(courseId, courseData)
      toast({
        title: "Success",
        description: "Course updated successfully",
      })
      router.push("/courses")
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!courseId) return;

    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      await deleteCourse(courseId)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      router.push("/courses")
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course, Try with course edit to unpublish the course",
        variant: "destructive",
      })
    }
  }

  if (!course) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Loading...</h1>
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
                  <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Course Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/courses/${course.id}`}>{course.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Course</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Course</h1>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Course
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Edit the course details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter course title"
                    defaultValue={course.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter course description"
                    rows={2}
                    defaultValue={course.description}
                    required
                  />
                </div>
                {/*<div className="space-y-2">*/}
                {/*  <Label htmlFor="duration">Duration (weeks)</Label>*/}
                {/*  <Input*/}
                {/*    id="duration"*/}
                {/*    name="duration"*/}
                {/*    type="number"*/}
                {/*    placeholder="Enter course duration in weeks"*/}
                {/*    defaultValue={course.durationInWeeks}*/}
                {/*    required*/}
                {/*  />*/}
                {/*</div>*/}
                <div className="space-y-2">
                  <Label htmlFor="fee">Fee</Label>
                  <Input
                    id="fee"
                    name="fee"
                    type="number"
                    placeholder="Enter course fee"
                    defaultValue={course.fee}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    name="published"
                    defaultChecked={course.published}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/courses">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              Deleting this course will permanently remove it and all its modules and chapters. This action cannot be undone.
            </AlertDescription>
            <div className="mt-4">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Course
              </Button>
            </div>
          </Alert>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
