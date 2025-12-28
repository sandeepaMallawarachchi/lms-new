"use client"

import { AppSidebar } from "../../components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Laptop, BarChart2, Users, ChevronLeft, ChevronRight } from "lucide-react"
import StudentCourseCard from "../../components/student-course-card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { StudentStatsResponse, getStudentStats, getStudentsByCourse, StudentsByCourseResponse } from "@/data/students"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Define types for our data
interface Student {
  id: number
  name: string
  avatar?: string
  enrolledDate: string
  progress: number
  email: string
}

interface CourseData {
  courseId: number
  count: number
  icon: any // Using any for simplicity, ideally would be more specific
  color: string
  iconColor: string
  progressColor: string
  students: Student[]
  totalPages: number
  currentPage: number
  totalElements: number
}

export default function StudentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("All Courses")
  const [progressFilter, setProgressFilter] = useState("Any")
  const [enrollmentFilter, setEnrollmentFilter] = useState("All Time")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state for each course
  const [coursePages, setCoursePages] = useState<Record<number, number>>({})
  
  // State for API data
  const [studentStats, setStudentStats] = useState<StudentStatsResponse | null>(null)
  const [courseStudents, setCourseStudents] = useState<Record<string, StudentsByCourseResponse>>({})
  const [processedData, setProcessedData] = useState<{
    total: number,
    courses: Record<string, CourseData>,
    completionRate: number
  }>({
    total: 0,
    courses: {},
    completionRate: 0
  })

  // Fetch data from API
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
      try {
      setLoading(true);
        
        // Fetch student stats
      const stats = await getStudentStats();
        if (!stats) {
        throw new Error("Failed to fetch student statistics");
        }
      setStudentStats(stats);
      
      // Initialize course pages state
      const initialCoursePages: Record<number, number> = {};
      stats.enrollmentByCourse.forEach(course => {
        initialCoursePages[course.courseId] = 0; // Start at page 0
      });
      setCoursePages(initialCoursePages);
      
      // Fetch initial students for each course
      await fetchCourseStudents(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async (stats: StudentStatsResponse) => {
    try {
        // Fetch students for each course
      const courseStudentsData: Record<string, StudentsByCourseResponse> = {};
        for (const course of stats.enrollmentByCourse) {
          if (course.studentCount > 0) {
          const pageNumber = coursePages[course.courseId] || 0;
          const courseData = await getStudentsByCourse(course.courseId, pageNumber);
            if (courseData) {
            courseStudentsData[course.courseName] = courseData;
            }
          }
        }
      setCourseStudents(courseStudentsData);
      processApiData(stats, courseStudentsData);
    } catch (err) {
      console.error("Error fetching course students:", err);
    }
  };

  // Handle page change for a specific course
  const handlePageChange = async (courseId: number, courseName: string, newPage: number) => {
    try {
      setLoading(true);
      // Update the page for this course
      setCoursePages(prev => ({
        ...prev,
        [courseId]: newPage
      }));
      
      // Fetch new data for this course
      const courseData = await getStudentsByCourse(courseId, newPage);
      if (courseData) {
        // Update only this course's data
        setCourseStudents(prev => ({
          ...prev,
          [courseName]: courseData
        }));
        
        // Update processed data
        if (studentStats) {
          const updatedCourseStudents = {
            ...courseStudents,
            [courseName]: courseData
          };
          processApiData(studentStats, updatedCourseStudents);
        }
      }
    } catch (err) {
      console.error(`Error changing page for course ${courseName}:`, err);
      } finally {
      setLoading(false);
      }
  };
  
  // Process API data into the format needed for the UI
  const processApiData = (stats: StudentStatsResponse, courseStudentsData: Record<string, StudentsByCourseResponse>) => {
    const courses: Record<string, CourseData> = {};
      
      // Generate random icon for each course
    const icons = [Laptop, BarChart2, GraduationCap];
      const colors = [
        { bg: "bg-green-50", icon: "text-green-500", progress: "bg-green-500" },
        { bg: "bg-purple-50", icon: "text-purple-500", progress: "bg-purple-500" },
        { bg: "bg-blue-50", icon: "text-blue-500", progress: "bg-blue-500" }
    ];
    
    stats.enrollmentByCourse.forEach((enrollmentCourse, index) => {
      const courseName = enrollmentCourse.courseName;
      const courseId = enrollmentCourse.courseId;
      const courseData = courseStudentsData[courseName];
      
      if (courseData) {
        const iconIndex = index % icons.length;
        const colorIndex = index % colors.length;
        
        courses[courseName] = {
          courseId,
          count: courseData.totalStudents,
          icon: icons[iconIndex],
          color: colors[colorIndex].bg,
          iconColor: colors[colorIndex].icon,
          progressColor: colors[colorIndex].progress,
          students: courseData.students.map(student => ({
            id: student.studentId,
            name: student.studentName,
            avatar:student.profileImage,
            email: student.email,
            enrolledDate: new Date(student.enrollmentDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long'
            }),
            progress: student.progressPercentage
          })),
          totalPages: courseData.totalPages,
          currentPage: courseData.page,
          totalElements: courseData.totalElements
        };
        }
    });
      
      setProcessedData({
      total: stats.totalStudents,
        courses,
      completionRate: stats.completionRate
    });
  };

  // Navigate to course students page
  const handleCourseCardClick = (courseId: number) => {
    router.push(`/courses/${courseId}/students`);
  };

  // Filter students based on search and filters
  const filteredStudents = Object.entries(processedData.courses).reduce<Record<string, CourseData>>(
    (acc, [courseName, courseData]) => {
      if (selectedCourse !== "All Courses" && selectedCourse !== courseName) {
        return acc;
      }

      const filteredCourseStudents = courseData.students.filter((student) => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             student.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Progress filter
        let matchesProgress = true;
        if (progressFilter === "High (>75%)") {
          matchesProgress = student.progress > 75;
        } else if (progressFilter === "Medium (50-75%)") {
          matchesProgress = student.progress >= 50 && student.progress <= 75;
        } else if (progressFilter === "Low (<50%)") {
          matchesProgress = student.progress < 50;
        }

        // Enrollment filter - simplified implementation
        let matchesEnrollment = true;
        if (enrollmentFilter === "Last 3 Months") {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const enrollmentDate = new Date(student.enrolledDate);
          matchesEnrollment = enrollmentDate >= threeMonthsAgo;
        }

        return matchesSearch && matchesProgress && matchesEnrollment;
      });

      return {
        ...acc,
        [courseName]: {
          ...courseData,
          students: filteredCourseStudents,
        },
      };
    },
    {}
  );

  // Render pagination for a course
  const renderPagination = (courseName: string, courseData: CourseData) => {
    const { currentPage, totalPages, courseId } = courseData;
    
    // Don't show pagination if there's only one page
    if (totalPages <= 1) return null;
    
    // Logic for showing page numbers with ellipsis
    const maxVisiblePages = 5;
    const startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);
    
    // Previous button
    const hasPrevious = currentPage > 0;
    
    // Next button
    const hasNext = currentPage < totalPages - 1;
    
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
                  handlePageChange(courseId, courseName, currentPage - 1);
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
                    handlePageChange(courseId, courseName, 0);
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
                  isActive={pageNum === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(courseId, courseName, pageNum);
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
                    handlePageChange(courseId, courseName, totalPages - 1);
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
                  handlePageChange(courseId, courseName, currentPage + 1);
                }} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
                  <BreadcrumbPage>Student Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Student Management</h1>
            {/*<Button className="bg-green-600 hover:bg-green-700">Add Student</Button>*/}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <h2 className="text-3xl font-bold">{processedData.total}</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
              </CardContent>
            </Card>
            
            {Object.entries(processedData.courses).slice(0, 2).map(([courseName, courseData], index) => (
              <Card 
                key={courseName} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleCourseCardClick(courseData.courseId)}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{courseName}</p>
                    <h2 className="text-3xl font-bold">{courseData.count}</h2>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${index === 0 ? "bg-blue-100" : "bg-purple-100"} flex items-center justify-center`}>
                    <courseData.icon className={`h-6 w-6 ${courseData.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <h2 className="text-3xl font-bold">{processedData.completionRate.toFixed(2)}%</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div>
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Course: All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Courses">All Courses</SelectItem>
                  {Object.keys(processedData.courses).map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Progress: Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Progress: Any</SelectItem>
                  <SelectItem value="High (>75%)">High (&gt;75%)</SelectItem>
                  <SelectItem value="Medium (50-75%)">Medium (50-75%)</SelectItem>
                  <SelectItem value="Low (<50%)">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={enrollmentFilter} onValueChange={setEnrollmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Enrollment: All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Time">Enrollment: All Time</SelectItem>
                  <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                  <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                  <SelectItem value="This Year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Course Cards - now as tabs */}
          <div className="mt-6">
            <Tabs value={selectedCourse === "All Courses" ? Object.keys(processedData.courses)[0] : selectedCourse} onValueChange={setSelectedCourse}>
              <TabsList className="mb-4">
                {Object.keys(processedData.courses).map((course) => (
                  <TabsTrigger key={course} value={course}>
                    {course}
                  </TabsTrigger>
                ))}
              </TabsList>
            {Object.entries(filteredStudents).map(([courseName, courseData]) => (
                <TabsContent key={courseName} value={courseName}>
                  <div className="space-y-4">
              <StudentCourseCard 
                courseName={courseName}
                students={courseData.students}
                color={courseData.color}
                progressColor={courseData.progressColor}
                      onClick={() => handleCourseCardClick(courseData.courseId)}
              />
                    {renderPagination(courseName, courseData)}
                  </div>
                </TabsContent>
            ))}
            {Object.keys(filteredStudents).length === 0 && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">No students match your current filters.</p>
              </div>
            )}
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 