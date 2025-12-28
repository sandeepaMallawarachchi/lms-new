"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  CalendarRange, 
  Mail, 
  Phone, 
  Home, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  Loader2 
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { 
  getStudentRequestById, 
  approveStudentRequest, 
  rejectStudentRequest, 
  approveSelectedCourses,
  StudentRequestResponse, 
  CourseInfo 
} from "@/data/students"

export default function StudentRequestPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = parseInt(params.id as string, 10)
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestData, setRequestData] = useState<StudentRequestResponse | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  
  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setLoading(true)
        
        if (isNaN(requestId)) {
          throw new Error('Invalid request ID')
        }
        
        const data = await getStudentRequestById(requestId)
        if (!data) {
          throw new Error('Failed to fetch request data')
        }
        
        setRequestData(data)
        // Initialize with all courses selected
        setSelectedCourses(data.requestedCourses.map(course => course.courseId))
      } catch (err) {
        console.error('Error fetching request data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load request data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRequestData()
  }, [requestId])
  
  const handleCheckCourse = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId])
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId))
    }
  }
  
  const handleApproveAll = async () => {
    try {
      setProcessing(true)
      await approveStudentRequest(requestId)
      
      toast({
        title: "Success",
        description: "Student request has been approved",
      })
      
      // Update local state
      if (requestData) {
        setRequestData({
          ...requestData,
          status: 'APPROVED'
        })
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: "Error",
        description: "Failed to approve student request",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }
  
  const handleReject = async () => {
    try {
      setProcessing(true)
      await rejectStudentRequest(requestId)
      
      toast({
        title: "Success",
        description: "Student request has been rejected",
      })
      
      // Update local state
      if (requestData) {
        setRequestData({
          ...requestData,
          status: 'REJECTED'
        })
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: "Error",
        description: "Failed to reject student request",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }
  
  const handleApproveSelected = async () => {
    try {
      setProcessing(true)
      
      if (selectedCourses.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one course to approve",
          variant: "destructive",
        })
        return
      }
      
      await approveSelectedCourses(requestId, selectedCourses)
      
      toast({
        title: "Success",
        description: `Approved ${selectedCourses.length} courses for this student`,
      })
      
      // Update local state
      if (requestData) {
        setRequestData({
          ...requestData,
          status: 'APPROVED'
        })
      }
    } catch (error) {
      console.error('Error approving selected courses:', error)
      toast({
        title: "Error",
        description: "Failed to approve selected courses",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }
  
  // Render loading state
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading request data...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  // Render error state
  if (error || !requestData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error || 'Request not found'}</p>
            <Button onClick={() => router.push('/students/requests')}>
              Back to Requests
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  // Status badge styles
  const getStatusBadge = () => {
    switch(requestData.status) {
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
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
                  <BreadcrumbLink href="/students">Student Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/students/requests">Student Requests</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Request #{requestId}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <Button variant="outline" onClick={() => router.push('/students/requests')}>
              Back to Requests
            </Button>
          </div>
        </header>
        
        <div className="flex flex-col gap-8 p-6">
          {/* Status Banner */}
          <div className={`w-full p-4 rounded-lg flex items-center justify-between ${
            requestData.status === 'PENDING' ? 'bg-yellow-50 border border-yellow-200' :
            requestData.status === 'APPROVED' ? 'bg-green-50 border border-green-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {requestData.status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-500" />}
              {requestData.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {requestData.status === 'REJECTED' && <XCircle className="h-5 w-5 text-red-500" />}
              <div>
                <h3 className="font-medium">
                  {requestData.status === 'PENDING' ? 'This request is awaiting review' :
                   requestData.status === 'APPROVED' ? 'This request has been approved' :
                   'This request has been rejected'}
                </h3>
                <p className="text-sm text-muted-foreground">Request submitted on {formatDate(requestData.requestDate)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {requestData.status === 'PENDING' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={processing}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will reject the student's enrollment request for all courses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Reject Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default" disabled={processing}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Approve Enrollment Request</DialogTitle>
                        <DialogDescription>
                          Choose to approve all courses or select specific courses to approve.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-4">
                          <div className="border p-3 rounded-md">
                            <div className="font-medium">Approve all courses</div>
                            <p className="text-sm text-muted-foreground">Approve this student for all {requestData.requestedCourses.length} requested courses</p>
                            <div className="mt-3">
                              <Button onClick={handleApproveAll} disabled={processing}>
                                Approve All Courses
                              </Button>
                            </div>
                          </div>
                          
                          <div className="border p-3 rounded-md">
                            <div className="font-medium mb-2">Select specific courses to approve</div>
                            <div className="space-y-2">
                              {requestData.requestedCourses.map((course) => (
                                <div key={course.courseId} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`course-${course.courseId}`}
                                    checked={selectedCourses.includes(course.courseId)}
                                    onCheckedChange={(checked) => handleCheckCourse(course.courseId, checked as boolean)}
                                  />
                                  <Label htmlFor={`course-${course.courseId}`}>{course.courseName}</Label>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3">
                              <Button onClick={handleApproveSelected} disabled={processing || selectedCourses.length === 0}>
                                Approve Selected Courses
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
          
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                    <div>{requestData.fullName} </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${requestData.email}`} className="text-blue-600 hover:underline">{requestData.email}</a>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Phone Number</div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {requestData.phoneNumber}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</div>
                    <div className="flex items-center gap-1">
                      <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      {formatDate(requestData.dateOfBirth)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      {requestData.address}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Gender</div>
                    <div>{requestData.gender || 'Not specified'}</div>
                  </div>
                  
                  {requestData.bio && (
                    <div className="md:col-span-2 mt-2">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Biography</div>
                      <div className="text-sm">{requestData.bio}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">WhatsAppNumber</div>
                    <div>{requestData.whatsAppNumber}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Knowledge</div>
                    <div>{requestData.knowledge}</div>
                  </div>
                  
                  {/*<div>*/}
                  {/*  <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>*/}
                  {/*  <div className="flex items-center gap-1">*/}
                  {/*    <Phone className="h-4 w-4 text-muted-foreground" />*/}
                  {/*    {requestData.emergencyContactPhone}*/}
                  {/*  </div>*/}
                  {/*</div>*/}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Requested Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Requested Courses
              </CardTitle>
              <CardDescription>
                The student has requested enrollment in the following courses:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requestData.requestedCourses.map((course) => (
                  <div key={course.courseId} className="p-4 border rounded-lg hover:bg-slate-50">
                    <h3 className="font-medium">{course.courseName}</h3>
                    <div className="text-sm text-muted-foreground mt-1">Course ID: {course.courseId}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Total courses requested: {requestData.requestedCourses.length}
              </div>
              
              {requestData.status === 'PENDING' && (
                <Button variant="outline" onClick={() => router.push(`/courses/${requestData.requestedCourses[0]?.courseId}`)}>
                  View Course Details
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  )
} 