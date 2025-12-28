import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit, FileText, Trash } from "lucide-react"
import Link from "next/link"
import type { Course } from "../types/course"
import { deleteCourse } from "@/data/courses"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CourseProps {
  course: Course
  onDelete?: (id: number) => void
}

export function CourseCard({ course, onDelete }: CourseProps) {
  const router = useRouter()
  const totalChapters = course.modules.reduce((acc, module) => acc + module.chapters.length, 0)
  const freeChapters = course.modules.reduce(
    (acc, module) => acc + module.chapters.filter((chapter) => chapter.free).length,
    0,
  )

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      await deleteCourse(course.id)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(course.id)
      } else {
        // Fall back to router.refresh() if no callback is provided
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course, Try with course edit to unpublish the course",
        variant: "destructive",
      })
    }
  }

  return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </div>
            {/* Published/Unpublished badge on the right */}
            {course.published ? (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Published</Badge>
            ) : (
              <Badge variant="destructive" className="ml-2 bg-red-100 text-red-800">Unpublished</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          {/*<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">*/}
          {/*  <Clock className="h-4 w-4" />*/}
          {/*  <span>Duration: {course.durationInWeeks}weeks</span>*/}
          {/*</div>*/}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="text-muted-foreground" style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              &#8361;
            </span>
            <span>Fee: {course.fee}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="h-4 w-4" />
            <span>Modules: {course.modules.length}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">{totalChapters} Chapters</Badge>
            {freeChapters > 0 && <Badge variant="secondary">{freeChapters} Free Chapters</Badge>}
            {course.hasAssessment && (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                  Assessment Included
                </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.id}`}>View Details</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${course.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
  )
}
