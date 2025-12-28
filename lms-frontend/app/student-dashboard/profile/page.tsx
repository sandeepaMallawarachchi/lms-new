"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft,
  User,
  PencilLine,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCircle,
  Save,
  Upload,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { getCurrentStudentDetails, StudentDetails, updateCurrentStudentProfile, StudentProfileUpdate } from "@/data/students"
import {getToken} from "@/lib/auth";

// Student profile schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
  bio: z.string().optional(),
  profileImageBase64:z.string().optional()
})

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<StudentDetails | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Initialize form
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      bio: "",
      profileImageBase64:""
    },
  })
  
  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const data = await getCurrentStudentDetails()
        if (!data) {
          throw new Error("Failed to fetch student data")
        }
        console.log(data)
        setStudentData(data)
        
        // Update form with student data - using all available fields from API
        form.reset({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.contactNumber || "",
          address: data.address || "",
          dateOfBirth: data.dateOfBirth || "",
          bio: data.bio || "",
          profileImageBase64:data.profileImage || ""
        })
        setAvatarPreview(data.profileImage)
      } catch (err) {
        console.error("Error fetching student data:", err)
        setError(err instanceof Error ? err.message : "Failed to load student data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudentData()
  }, [form])
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setSubmitting(true)
      
      // Prepare the update data
      const updateData: StudentProfileUpdate = {
        fullName: values.fullName,
        contactNumber: values.phoneNumber,
        address: values.address,
        dateOfBirth: values.dateOfBirth,
        bio: values.bio || "",
        profileImageBase64:values.profileImageBase64 || ""
      }
      console.log("updateData"+updateData);
      sendProfileUpdate(updateData)
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Function to send profile update
  const sendProfileUpdate = async (updateData: StudentProfileUpdate) => {
    try {
      const updatedData = await updateCurrentStudentProfile(updateData)
      if (updatedData) {
        setStudentData(updatedData)
        toast({
          title: "Profile updated",
          description: "Your profile information has been successfully updated.",
        })
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
      }
    } catch (err) {
      throw err
    }
  }
  
  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image less than 1MB in size.",
          variant: "destructive",
        })
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, etc.).",
          variant: "destructive",
        })
        return
      }
      
      try {
        // Create FormData and append file
        const formData = new FormData()
        formData.append('file', file)
        
        // Show loading toast
        toast({
          title: "Uploading...",
          description: "Please wait while we upload your image.",
        })
        
        const token = getToken();
        const headers: Record<string, string> = {};

        // Only add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('No authentication token found. Request may fail.');
        }
        
        // Upload to server - Don't set Content-Type header when sending FormData
        const response = await fetch('http://localhost:9091/api/files/upload', {
          method: 'POST',
          headers: headers,
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload image')
        }
        
        const data = await response.json()
        
        // Set the returned URL to profileImageBase64 field
        form.setValue('profileImageBase64', data.url)
        
        // Set preview and file state
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        
        // Show success toast
        toast({
          title: "Upload successful",
          description: "Your profile image has been uploaded.",
        })
        
      } catch (error) {
        console.error('Error uploading image:', error)
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }
  
  // Cancel avatar upload
  const cancelAvatarUpload = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }
  
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading student profile...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  if (error || !studentData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error || "Student data not found"}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold md:text-xl">My Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar>
              {studentData.profileImage ? (
                <AvatarImage 
                  src={studentData.profileImage} 
                  alt={studentData.fullName}
                />
              ) : (
                <AvatarFallback>{studentData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button 
                  variant={isEditing ? "ghost" : "outline"} 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-1"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilLine className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                View and manage your personal information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-4 mb-6 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <Avatar className="h-24 w-24">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt={studentData.fullName} />
                        ) : (
                          <AvatarFallback>{studentData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </Button>
                          
                          {avatarFile && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="gap-1 text-destructive"
                              onClick={cancelAvatarUpload}
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                        
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarChange} 
                        />
                        
                        <p className="text-sm text-muted-foreground">
                          Recommended: Square JPG, PNG. Max 1MB.
                        </p>
                      </div>
                    </div>
                    
                    {/* Student ID and Department (Not editable) */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input 
                          id="studentId" 
                          value={studentData.studentId} 
                          disabled 
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Student ID cannot be changed
                        </p>
                      </div>
                      

                    </div>
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} disabled className="bg-muted" />
                            </FormControl>
                            <FormDescription>
                              Email address cannot be changed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field}  />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={2} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    

                    

                    
                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4} 
                              placeholder="Tell us a bit about yourself..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description about yourself, your interests, and goals
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <CardFooter className="flex justify-end px-0 pt-4">
                      <Button type="submit" className="gap-1" disabled={submitting}>
                        <Save className="h-4 w-4" />
                        {submitting ? "Updating..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  {/* Student Avatar and Basic Info */}
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-24 w-24">
                      {studentData.profileImage ? (
                        <AvatarImage 
                          src={studentData.profileImage} 
                          alt={studentData.fullName}
                        />
                      ) : (
                        <AvatarFallback>{studentData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div>
                      <h2 className="text-xl font-bold">{studentData.fullName}</h2>
                      <p className="text-sm text-muted-foreground">{studentData.email}</p>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-muted-foreground mr-1">Student ID:</span>
                        <span>{studentData.studentId}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-muted-foreground mr-1">Department:</span>
                        <span>{studentData.department}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-muted-foreground mr-1">Enrolled Since:</span>
                        <span>{new Date(studentData.enrollmentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Personal Details */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Email Address</p>
                            <p className="text-sm">{studentData.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Phone Number</p>
                            <p className="text-sm">{studentData.contactNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Address</p>
                            <p className="text-sm">{studentData.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Date of Birth</p>
                            <p className="text-sm">{studentData.dateOfBirth}</p>
                          </div>
                        </div>
                        

                      </div>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Bio</h3>
                    <div className="flex items-start">
                      <UserCircle className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">{studentData.bio}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course Progress Summary */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Course Progress</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                        <p className="text-2xl font-bold">{studentData.overallProgressPercentage}%</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Courses Enrolled</p>
                        <p className="text-2xl font-bold">{studentData.courseProgress.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course List */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Enrolled Courses</h3>
                    <div className="space-y-3">
                      {studentData.courseProgress.map((course) => (
                        <div key={course.courseId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{course.courseTitle}</h4>
                              <p className="text-sm text-muted-foreground">{course.courseDescription}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{course.progressPercentage}% Complete</p>
                              <p className="text-xs text-muted-foreground">
                                {course.completedChapters} of {course.totalChapters} chapters
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="h-2 w-full bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${course.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {studentData.courseProgress.length === 0 && (
                        <div className="border rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 