"use client"

import { AppSidebar } from "../../../../../components/app-sidebar"
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
import { createModule, getCourseById } from "../../../../../data/courses"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Module } from "../../../../../data/courses"

export default function NewModulePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const courseId = Number.parseInt(params.id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
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
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const moduleData: Partial<Module> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      orderIndex: Number(formData.get("order")),
    }

    try {
      await createModule(courseId, moduleData)
      toast({
        title: "Success",
        description: "Module created successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error creating module:", error)
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
                  <BreadcrumbPage>Add New Module</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Add New Module</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Module Details</CardTitle>
                <CardDescription>Create a new module for the {course.title} course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input id="title" name="title" placeholder="Enter module title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter module description" rows={2} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="Enter module order"
                    defaultValue={course.modules.length + 1}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${course.id}/edit`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Module"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
