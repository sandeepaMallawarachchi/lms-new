"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  CalendarDays, 
  ChevronLeft,
  Search,
  FileCheck,
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Filter
} from "lucide-react"

// Define types for assignments
interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  description?: string;
  status: 'pending' | 'completed' | 'late';
  priority?: 'high' | 'medium' | 'low';
  type: 'submission' | 'quiz' | 'exercise';
  submittedDate?: string;
  grade?: string;
  feedback?: string;
  daysLate?: number;
}

// Sample assignments data
const assignmentsData: {
  upcoming: Assignment[];
  completed: Assignment[];
  late: Assignment[];
} = {
  upcoming: [
    {
      id: 1,
      title: "Korean Writing Exercise",
      course: "Korean Beginner Level 1",
      dueDate: "Tomorrow, 11:59 PM",
      description: "Write a short paragraph introducing yourself in Korean using the vocabulary and grammar patterns learned in this module.",
      status: "pending",
      priority: "high",
      type: "submission"
    },
    {
      id: 2,
      title: "Grammar Quiz",
      course: "Korean Grammar Essentials",
      dueDate: "Friday, 3:00 PM",
      description: "Complete the online quiz covering Korean sentence structures and basic verb conjugations.",
      status: "pending",
      priority: "medium",
      type: "quiz"
    },
    {
      id: 3,
      title: "Conversation Recording",
      course: "Conversational Korean",
      dueDate: "Next Monday, 11:59 PM",
      description: "Record a 2-minute audio clip of yourself practicing the dialogue patterns learned in class.",
      status: "pending",
      priority: "low",
      type: "submission"
    }
  ],
  completed: [
    {
      id: 4,
      title: "Hangul Practice Worksheet",
      course: "Korean Beginner Level 1",
      dueDate: "Last Tuesday",
      submittedDate: "Last Monday",
      grade: "95%",
      feedback: "Excellent work! Your handwriting is improving significantly.",
      status: "completed",
      type: "submission"
    },
    {
      id: 5,
      title: "Vocabulary Matching Exercise",
      course: "Korean Beginner Level 1",
      dueDate: "Last Friday",
      submittedDate: "Last Friday",
      grade: "88%",
      feedback: "Good work, but please review the vocabulary related to family members.",
      status: "completed",
      type: "exercise"
    },
    {
      id: 6,
      title: "Numbers and Counting Quiz",
      course: "Korean Beginner Level 1",
      dueDate: "2 weeks ago",
      submittedDate: "2 weeks ago",
      grade: "92%",
      feedback: "Great job! Just a few minor mistakes with the Sino-Korean numbers.",
      status: "completed",
      type: "quiz"
    }
  ],
  late: [
    {
      id: 7,
      title: "Cultural Research Assignment",
      course: "Korean Culture and Society",
      dueDate: "Last Sunday, 11:59 PM",
      description: "Write a 500-word essay on a Korean cultural tradition of your choice.",
      status: "late",
      priority: "high",
      type: "submission",
      daysLate: 3
    }
  ]
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter assignments based on search query
  const filterAssignments = (assignments: Assignment[]): Assignment[] => {
    if (!searchQuery.trim()) return assignments
    
    return assignments.filter(assignment => 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  
  const filteredUpcoming = filterAssignments(assignmentsData.upcoming)
  const filteredCompleted = filterAssignments(assignmentsData.completed)
  const filteredLate = filterAssignments(assignmentsData.late)
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/student-dashboard')}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-lg font-semibold md:text-xl">Assignments</h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/images/students/emily.jpg" alt="Emily Johnson" />
              <AvatarFallback>EJ</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="pl-8 w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button size="sm">
                <FileCheck className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                {assignmentsData.upcoming.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground">{assignmentsData.upcoming.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="late" className="relative">
                Late
                {assignmentsData.late.length > 0 && (
                  <Badge className="ml-1 bg-destructive text-destructive-foreground">{assignmentsData.late.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {filteredUpcoming.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">No upcoming assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredUpcoming.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.course}</CardDescription>
                          </div>
                          <Badge variant={
                            assignment.priority === "high" ? "destructive" : 
                            assignment.priority === "medium" ? "default" :
                            "outline"
                          }>
                            {assignment.priority === "high" ? "Urgent" : 
                             assignment.priority === "medium" ? "Medium Priority" :
                             "Low Priority"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <span>Type: {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full">
                          {assignment.type === 'quiz' ? 'Start Quiz' : 'Submit Assignment'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="late" className="space-y-4">
              {filteredLate.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">No late assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredLate.map((assignment) => (
                    <Card key={assignment.id} className="border-destructive/20">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.course}</CardDescription>
                          </div>
                          <Badge variant="destructive">
                            {assignment.daysLate} {assignment.daysLate === 1 ? 'day' : 'days'} late
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Due: {assignment.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <span>Type: {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full" variant="destructive">
                          Submit Late Assignment
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {filteredCompleted.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">No completed assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredCompleted.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.course}</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Grade: {assignment.grade}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Submitted: {assignment.submittedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <span>Type: {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</span>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Instructor Feedback:</h4>
                          <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          View Submission
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 