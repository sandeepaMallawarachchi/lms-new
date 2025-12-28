"use client"

import { AppSidebar } from "../../../components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Filter, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  StudentRequestResponse,
  getAllStudentRequests,
  approveStudentRequest,
  rejectStudentRequest
} from "@/data/students"

export default function RequestsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [requests, setRequests] = useState<StudentRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  // Fetch student requests on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const data = await getAllStudentRequests()
        setRequests(data)
      } catch (error) {
        console.error("Error fetching student requests:", error)
        toast({
          title: "Error",
          description: "Failed to fetch student requests",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  // Handle approve request
  const handleApprove = async (id: number) => {
    try {
      setProcessing(id)
      await approveStudentRequest(id)
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status: 'APPROVED' } : req
        )
      )
      
      toast({
        title: "Success",
        description: "Student request approved successfully",
      })
    } catch (error) {
      console.error("Error approving student request:", error)
      toast({
        title: "Error",
        description: "Failed to approve student request",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  // Handle reject request
  const handleReject = async (id: number) => {
    try {
      setProcessing(id)
      await rejectStudentRequest(id)
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === id ? { ...req, status: 'REJECTED' } : req
        )
      )
      
      toast({
        title: "Success",
        description: "Student request rejected successfully",
      })
    } catch (error) {
      console.error("Error rejecting student request:", error)
      toast({
        title: "Error",
        description: "Failed to reject student request",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const fullName = `${request.fullName}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      request.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      request.status === statusFilter
    
    const matchesCourse = 
      courseFilter === "all" || 
      request.requestedCourses.some(course => 
        course.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      )

    return matchesSearch && matchesStatus && matchesCourse
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      default:
        return null
    }
  }

  // Get formatted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
                  <BreadcrumbLink href="/students">Student Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Requests</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">New Student Requests</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h2 className="text-3xl font-bold">{requests.filter(r => r.status === 'PENDING').length}</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <h2 className="text-3xl font-bold">{requests.filter(r => r.status === 'APPROVED').length}</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <h2 className="text-3xl font-bold">{requests.filter(r => r.status === 'REJECTED').length}</h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
            
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {Array.from(new Set(requests.flatMap(r => r.requestedCourses.map(c => c.courseName)))).map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Requests Table */}
          <Card className="mt-6">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-muted-foreground">Loading student requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <p className="text-muted-foreground">No student requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.fullName?.substring(0,2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.fullName}</p>
                              {/*<p className="text-xs text-muted-foreground">{request.department || 'No department'}</p>*/}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {request.requestedCourses.map((course, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {course.courseName}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {request.status === 'PENDING' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processing === request.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                  disabled={processing === request.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              asChild
                            >
                              <Link href={`/students/requests/${request.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 