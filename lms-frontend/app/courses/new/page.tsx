"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "../../../components/app-sidebar"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createCourse } from "../../../data/courses"
import { Switch } from "@/components/ui/switch"
import env from "@/config/env"

export default function NewCoursePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // durationInWeeks: "",
    fee: "",
    // hasAssessment: false,
    // thumbnailUrl: "",
  })

  // Check for token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem(env.tokenKey)
    setToken(storedToken)
    
    // Redirect if no token found
    if (!storedToken) {
      toast({
        title: "Authentication required",
        description: "Please login to create a course",
        variant: "destructive",
      })
      router.push('/login')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      // hasAssessment: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.title || !formData.description || !formData.fee) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Check token again before submission
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    try {
      // Create the course object to match the backend's expected format
      const courseData = {
        title: formData.title,
        description: formData.description,
        // durationInWeeks: parseInt(formData.durationInWeeks),
        fee: parseFloat(formData.fee),
        // hasAssessment: formData.hasAssessment,
        // thumbnailUrl: formData.thumbnailUrl || undefined,
        // Initialize with numeric values to prevent null pointer exceptions
        numberOfModules: 0,
        totalChapters: 0,
        freeChapters: 0,
        published: false,
        active: true
      }

      // Call the API to create the course
      const newCourse = await createCourse(courseData)
      
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      
      // Redirect to the courses page
      router.push("/courses")
    } catch (error) {
      console.error("Error creating course:", error)
      
      // Check if error is due to unauthorized access
      if (error instanceof Error && error.message.includes('401')) {
        toast({
          title: "Authentication failed",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        })
        localStorage.removeItem(env.tokenKey)
        router.push('/login')
      } else {
        toast({
          title: "Error",
          description: "Failed to create course. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (token === null) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
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
                  <BreadcrumbPage>Add New Course</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h1 className="text-2xl font-bold">Add New Course</h1>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Enter the information for the new course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter course description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/*<div className="space-y-2">*/}
                  {/*  <Label htmlFor="durationInWeeks">*/}
                  {/*    Duration (weeks) <span className="text-red-500">*</span>*/}
                  {/*  </Label>*/}
                  {/*  <Input*/}
                  {/*    id="durationInWeeks"*/}
                  {/*    placeholder="e.g., 8"*/}
                  {/*    type="number"*/}
                  {/*    min="1"*/}
                  {/*    value={formData.durationInWeeks}*/}
                  {/*    onChange={handleChange}*/}
                  {/*    required*/}
                  {/*  />*/}
                  {/*</div>*/}
                  <div className="space-y-2">
                    <Label htmlFor="fee">
                      Fee <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="fee" 
                      placeholder="e.g., 299.99" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fee} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                {/*<div className="space-y-2">*/}
                {/*  <Label htmlFor="thumbnailUrl">*/}
                {/*    Thumbnail URL*/}
                {/*  </Label>*/}
                {/*  <Input*/}
                {/*    id="thumbnailUrl"*/}
                {/*    placeholder="Enter thumbnail URL"*/}
                {/*    value={formData.thumbnailUrl}*/}
                {/*    onChange={handleChange}*/}
                {/*  />*/}
                {/*</div>*/}
                {/*<div className="flex items-center space-x-2">*/}
                {/*  <Switch*/}
                {/*    id="hasAssessment"*/}
                {/*    checked={formData.hasAssessment}*/}
                {/*    onCheckedChange={handleSwitchChange}*/}
                {/*  />*/}
                {/*  <Label htmlFor="hasAssessment">Course includes assessments</Label>*/}
                {/*</div>*/}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/courses")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Course"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
