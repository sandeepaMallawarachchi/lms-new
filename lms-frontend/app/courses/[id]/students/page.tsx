"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Search, RefreshCw, UserPlus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { API_BASE_URL } from "@/data/api";
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  StudentsByCourseResponse, 
  getStudentsByCourse, 
  getStudentStats, 
  StudentStatsResponse 
} from "@/data/students"
import { toast } from "@/components/ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getToken } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"

// Define types for our data matching the students page
interface Student {
  id: number
  name: string
  avatar?: string
  enrolledDate: string
  progress: number
  email: string
  active: boolean
  enrollmentStatus: string
}

interface CourseData {
  courseId: number
  count: number
  icon: any
  color: string
  iconColor: string
  progressColor: string
  students: Student[]
  totalPages: number
  currentPage: number
  totalElements: number
}

export default function StudentsInCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number(params.id)

  const [courseData, setCourseData] = useState<StudentsByCourseResponse | null>(null)
  const [studentStats, setStudentStats] = useState<StudentStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'DROPPED' | 'COMPLETED'>('ACTIVE')
  
  // Processed data for consistent format with students page
  const [processedData, setProcessedData] = useState<{
    total: number,
    courses: Record<string, CourseData>,
    completionRate: number
  }>({
    total: 0,
    courses: {},
    completionRate: 0
  })

  // Add loading state for toggling status
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStudentsData();
  }, [courseId, currentPage]);

  const fetchStudentsData = async () => {
    try {
      setIsLoading(true);
      // Fetch student statistics to get course info
      const stats = await getStudentStats();
      if (stats) {
        setStudentStats(stats);
      }
      // Fetch students for this course, using statusFilter
      const data = await getStudentsByCourse(courseId, currentPage, 10);
      if (data) {
        setCourseData(data);
        processApiData(stats, data);
      } else {
        setError("Failed to load students data. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching course students:", error);
      setError("Failed to load students data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Process API data into the format used by students page
  const processApiData = (stats: StudentStatsResponse | null, courseData: StudentsByCourseResponse) => {
    if (!stats) return;
    
    const courses: Record<string, CourseData> = {};
    
    // Use the same icons and colors logic as students page
    const icons = [Loader2, Search, RefreshCw];
    const colors = [
      { bg: "bg-green-50", icon: "text-green-500", progress: "bg-green-500" },
      { bg: "bg-purple-50", icon: "text-purple-500", progress: "bg-purple-500" },
      { bg: "bg-blue-50", icon: "text-blue-500", progress: "bg-blue-500" }
    ];
    
    // Get the course from stats
    const courseStat = stats.enrollmentByCourse.find(c => c.courseId === courseId);
    
    if (courseStat && courseData) {
      const iconIndex = 0;  // just use the first icon/color for simplicity
      const colorIndex = 0;
      
      courses[courseData.courseTitle] = {
        courseId,
        count: courseData.activeStudents,
        icon: icons[iconIndex],
        color: colors[colorIndex].bg,
        iconColor: colors[colorIndex].icon,
        progressColor: colors[colorIndex].progress,
        students: courseData.students.map(student => ({
          id: student.studentId,
          name: student.studentName,
          email: student.email,
          enrolledDate: new Date(student.enrollmentDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long'
          }),
          progress: student.progressPercentage,
          active: student.active,
          enrollmentStatus: student.enrollmentStatus
        })),
        totalPages: courseData.totalPages,
        currentPage: courseData.page,
        totalElements: courseData.activeStudents
      };
    }
    
    setProcessedData({
      total: courseData.totalStudents,
      courses,
      completionRate: courseData.averageCompletionRate
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudentsData();
    setRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "The student data has been updated.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Just filter locally as we're doing in students page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Find the current course name from stats
  const getCurrentCourseName = () => {
    if (studentStats) {
      const course = studentStats.enrollmentByCourse.find(c => c.courseId === courseId);
      return course ? course.courseName : "Unknown Course";
    }
    return courseData?.courseTitle || "Course";
  };

  // Custom Spinner component
  const Spinner = ({ className }: { className?: string }) => (
    <Loader2 className={`h-5 w-5 animate-spin ${className || ""}`} />
  );

  const renderPagination = () => {
    if (!courseData) return null;

    const { page, totalPages } = courseData;
    
    // Logic for showing page numbers with ellipsis
    const maxVisiblePages = 5;
    const startPage = Math.max(0, Math.min(page - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);
    
    // Previous button
    const hasPrevious = page > 0;
    
    // Next button
    const hasNext = page < totalPages - 1;
    
    // Show ellipsis at start if needed
    const showStartEllipsis = startPage > 0;
    
    // Show ellipsis at end if needed
    const showEndEllipsis = endPage < totalPages - 1;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {hasPrevious && (
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page - 1);
                }} 
              />
            </PaginationItem>
          )}
          
          {showStartEllipsis && (
            <>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(0);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}
          
          {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
            const pageNum = startPage + index;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  href="#" 
                  isActive={pageNum === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {showEndEllipsis && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages - 1);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          {hasNext && (
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page + 1);
                }} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Spinner className="mx-auto h-8 w-8" />
            <p className="mt-4 text-muted-foreground">Loading students data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchStudentsData}>Try Again</Button>
          </CardContent>
        </Card>
      );
    }

    if (!courseData || Object.keys(processedData.courses).length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground mb-4">No course data available</p>
            <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
          </CardContent>
        </Card>
      );
    }

    // Get the current course data from processed data
    const courseName = Object.keys(processedData.courses)[0]; 
    const currentCourseData = processedData.courses[courseName];

    // Filter students based on status and search
    const filteredStudents = currentCourseData.students
      .filter(student => student.enrollmentStatus === statusFilter)
      .filter(student => {
        if (searchQuery.trim() === "") return true;
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
        );
      });

    // Add helper function to count students by enrollment status
    const getStudentCountByStatus = (status: string) => {
      if (!courseData) return 0;
      return courseData.students.filter(student => student.enrollmentStatus === status).length;
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <h2 className="text-3xl font-bold">{courseData?.totalStudents || 0}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <h2 className="text-3xl font-bold">{getStudentCountByStatus('ACTIVE')}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dropped Students</p>
                <h2 className="text-3xl font-bold">{getStudentCountByStatus('DROPPED')}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <ToggleGroup type="single" value={statusFilter} onValueChange={val => val && setStatusFilter(val as 'ACTIVE' | 'DROPPED' | 'COMPLETED')}>
            <ToggleGroupItem value="ACTIVE">Active</ToggleGroupItem>
            <ToggleGroupItem value="DROPPED">Dropped</ToggleGroupItem>
            <ToggleGroupItem value="COMPLETED">Completed</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              {filteredStudents.length > 0 
                ? `Showing ${filteredStudents.length} of ${currentCourseData.totalElements} students`
                : "No students found matching your criteria"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium" onClick={() => router.push(`/students/${student.id}`)}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => router.push(`/students/${student.id}`)}>{student.email}</TableCell>
                      <TableCell onClick={() => router.push(`/students/${student.id}`)}>{student.enrolledDate}</TableCell>
                      <TableCell onClick={() => router.push(`/students/${student.id}`)}>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-[80px]" />
                          <span className="text-sm text-muted-foreground">
                            {student.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.enrollmentStatus === 'ACTIVE' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={togglingId === student.id}
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleStudentStatus(student.id);
                            }}
                          >
                            {togglingId === student.id ? <Spinner className="mr-2 h-4 w-4" /> : null}
                            Drop Student
                          </Button>
                        )}
                        {student.enrollmentStatus === 'DROPPED' && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={togglingId === student.id}
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleStudentStatus(student.id);
                            }}
                          >
                            {togglingId === student.id ? <Spinner className="mr-2 h-4 w-4" /> : null}
                            Re-Activate
                          </Button>
                        )}
                        {student.enrollmentStatus === 'COMPLETED' && (
                          <Badge variant="default" className="bg-green-500">
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery.trim() !== "" 
                    ? "No students found matching your search criteria." 
                    : statusFilter === 'ACTIVE' 
                      ? "No active students in this course."
                      : statusFilter === 'DROPPED'
                        ? "No dropped students in this course."
                        : "No completed students in this course."}
                </p>
                {searchQuery.trim() !== "" && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          {currentCourseData.totalPages > 1 && filteredStudents.length > 0 && (
            <CardFooter className="flex justify-center border-t pt-6">
              {renderPagination()}
            </CardFooter>
          )}
        </Card>
      </div>
    );
  };

  const handleToggleStudentStatus = async (studentId: number) => {
    setTogglingId(studentId);
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/toggle-enrollment-status/${studentId}/${courseId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to toggle enrollment status');
      
      // Refresh the data after successful toggle
      await fetchStudentsData();
      
      toast({
        title: 'Status Updated',
        description: `Student enrollment status has been updated.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to update enrollment status.`,
        variant: 'destructive',
      });
    } finally {
      setTogglingId(null);
    }
  };

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
                  <BreadcrumbLink href="/courses">Course Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/courses/${courseId}`}>{getCurrentCourseName()}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Students</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button
              variant="ghost"
              className="gap-1"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Course
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 