"use client"

import { AppSidebar } from "../../../../../../components/app-sidebar"
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
import { getCourseById, updateModule, deleteModule } from "../../../../../../data/courses"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Module } from "../../../../../../data/courses"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Trash } from "lucide-react"

export default function EditModulePage({
  params,
}: {
  params: { id: string; moduleId: string }
}) {
  const router = useRouter()
  const courseId = Number.parseInt(params.id)
  const moduleId = Number.parseInt(params.moduleId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [module, setModule] = useState<Module | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
        
        // Find the module in the course's modules
        const moduleData = courseData.modules.find((m: any) => m.id === moduleId)
        if (!moduleData) {
          throw new Error("Module not found")
        }
        // @ts-ignore
        setModule(moduleData)
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
  }, [courseId, moduleId])

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
      await updateModule(courseId, moduleId, moduleData)
      toast({
        title: "Success",
        description: "Module updated successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error updating module:", error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
      return
    }

    try {
      await deleteModule(courseId, moduleId)
      toast({
        title: "Success",
        description: "Module deleted successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error deleting module:", error)
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      })
    }
  }

  if (!course || !module) {
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
                  <BreadcrumbPage>Edit Module</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Module</h1>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Module
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Module Details</CardTitle>
                <CardDescription>Edit the module details for the {course.title} course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter module title" 
                    defaultValue={module.title}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Enter module description" 
                    rows={2} 
                    defaultValue={module.description}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="Enter module order"
                    defaultValue={module.orderIndex}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${course.id}`}>Cancel</Link>
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
              Deleting this module will permanently remove it from the course. This action cannot be undone.
            </AlertDescription>
            <div className="mt-4">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Module
              </Button>
            </div>
          </Alert>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
