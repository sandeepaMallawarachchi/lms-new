'use client'

import { AppSidebar } from "../../components/app-sidebar"
import { CourseCard } from "../../components/course-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import { getCourses } from "@/data/courses"
import { useEffect, useState } from "react"
import { Course } from "@/types/course"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Handler to remove a course from the state after deletion
  const handleCourseDelete = (deletedCourseId: number) => {
    setCourses(currentCourses => currentCourses.filter(course => course.id !== deletedCourseId))
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
                  <BreadcrumbPage>Course Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Courses</h1>
            <Button asChild>
              <a href="/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Course
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : courses && courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onDelete={handleCourseDelete}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">No published courses found</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
