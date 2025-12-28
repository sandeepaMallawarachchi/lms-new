"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  MapPin,
  BookOpen,
  Video,
  CalendarDays,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay, startOfToday } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Define types for schedule
interface ScheduleEvent {
  id: number;
  title: string;
  course: string;
  type: 'class' | 'tutorial' | 'exam' | 'workshop' | 'consultation';
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: string;
  description?: string;
  meetingLink?: string;
  isOnline: boolean;
}

// Sample schedule data
const scheduleData: ScheduleEvent[] = [
  {
    id: 1,
    title: "Korean Language Class",
    course: "Korean Beginner Level 1",
    type: "class",
    date: addDays(startOfToday(), 0), // Today
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    location: "Room 201, Building A",
    instructor: "Professor Kim",
    description: "Regular class session covering Lesson 5: Basic Vocabulary.",
    isOnline: false
  },
  {
    id: 2,
    title: "Pronunciation Workshop",
    course: "Korean Beginner Level 1",
    type: "workshop",
    date: addDays(startOfToday(), 0), // Today
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    location: "Language Lab, Building B",
    instructor: "Ms. Park",
    description: "Special workshop focusing on pronunciation practice.",
    isOnline: false
  },
  {
    id: 3,
    title: "Grammar Tutorial",
    course: "Korean Grammar Essentials",
    type: "tutorial",
    date: addDays(startOfToday(), 1), // Tomorrow
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    meetingLink: "https://zoom.us/j/123456789",
    instructor: "Mr. Lee",
    description: "Online tutorial session focusing on verb conjugation patterns.",
    isOnline: true
  },
  {
    id: 4,
    title: "Conversation Practice",
    course: "Conversational Korean",
    type: "class",
    date: addDays(startOfToday(), 2), // Day after tomorrow
    startTime: "04:00 PM",
    endTime: "05:30 PM",
    location: "Room 305, Building A",
    instructor: "Ms. Choi",
    description: "In-person conversation practice session, focusing on everyday dialogues.",
    isOnline: false
  },
  {
    id: 5,
    title: "Midterm Exam",
    course: "Korean Beginner Level 1",
    type: "exam",
    date: addDays(startOfToday(), 3),
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    location: "Examination Hall, Main Building",
    description: "Written and oral midterm examination covering Lessons 1-5.",
    isOnline: false
  },
  {
    id: 6,
    title: "Office Hours",
    course: "Korean Grammar Essentials",
    type: "consultation",
    date: addDays(startOfToday(), 4),
    startTime: "01:00 PM",
    endTime: "03:00 PM",
    meetingLink: "https://zoom.us/j/987654321",
    instructor: "Mr. Lee",
    description: "Virtual office hours for personalized help.",
    isOnline: true
  },
  {
    id: 7,
    title: "Cultural Workshop",
    course: "Korean Culture and Society",
    type: "workshop",
    date: addDays(startOfToday(), 6),
    startTime: "11:00 AM",
    endTime: "01:00 PM",
    location: "Cultural Center, Building C",
    instructor: "Professor Song",
    description: "Workshop on Korean traditional customs and festivals.",
    isOnline: false
  }
];

// Function to get events for a specific date
const getEventsForDate = (events: ScheduleEvent[], date: Date): ScheduleEvent[] => {
  return events.filter(event => isSameDay(event.date, date));
};

// Function to get today's events
const getTodayEvents = (events: ScheduleEvent[]): ScheduleEvent[] => {
  return getEventsForDate(events, new Date());
};

// Function to get this week's events
const getThisWeekEvents = (events: ScheduleEvent[]): ScheduleEvent[] => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);
  
  return events.filter(event => 
    event.date >= startOfCurrentWeek && 
    event.date <= endOfCurrentWeek
  );
};

// Function to get upcoming events
const getUpcomingEvents = (events: ScheduleEvent[]): ScheduleEvent[] => {
  const today = new Date();
  return events.filter(event => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export default function SchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState("today");
  const [courseFilter, setCourseFilter] = useState("all");
  
  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(currentWeekStart, i)
  );
  
  // Get unique courses for the filter
  const courseOptions = Array.from(
    new Set(scheduleData.map(event => event.course))
  );
  
  // Filter events based on selected course
  const filteredEvents = courseFilter === "all" 
    ? scheduleData 
    : scheduleData.filter(event => event.course === courseFilter);
  
  // Navigate to previous/next week
  const goToPrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };
  
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
            <h1 className="text-lg font-semibold md:text-xl">Class Schedule</h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/images/students/emily.jpg" alt="Emily Johnson" />
              <AvatarFallback>EJ</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(currentWeekStart, 'MMMM yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={courseFilter} 
                onValueChange={setCourseFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseOptions.map(course => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            
            {/* Today's Schedule */}
            <TabsContent value="today" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{format(new Date(), 'EEEE, MMMM d, yyyy')}</h2>
              </div>
              
              {getTodayEvents(filteredEvents).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">No classes or events scheduled for today</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {getTodayEvents(filteredEvents)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(event => (
                      <Card key={event.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{event.title}</CardTitle>
                              <CardDescription>{event.course}</CardDescription>
                            </div>
                            <Badge variant={
                              event.type === 'class' ? 'default' :
                              event.type === 'exam' ? 'destructive' :
                              event.type === 'workshop' ? 'secondary' :
                              'outline'
                            }>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{event.startTime} - {event.endTime}</span>
                            </div>
                            
                            {event.instructor && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{event.instructor}</span>
                              </div>
                            )}
                            
                            {event.isOnline ? (
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Online Class</span>
                                {event.meetingLink && (
                                  <Button variant="link" size="sm" className="h-auto p-0">
                                    Join Meeting
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                            )}
                            
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
            
            {/* Weekly Schedule */}
            <TabsContent value="week" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Week of {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={goToPrevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4">
                {weekDates.map(date => {
                  const eventsForDay = getEventsForDate(filteredEvents, date);
                  const isToday = isSameDay(date, new Date());
                  
                  return (
                    <Card key={date.toString()} className={isToday ? "border-primary" : ""}>
                      <CardHeader className={`pb-2 ${isToday ? "bg-primary/5" : ""}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {format(date, 'EEEE')}
                              {isToday && <Badge variant="outline">Today</Badge>}
                            </CardTitle>
                            <CardDescription>{format(date, 'MMMM d, yyyy')}</CardDescription>
                          </div>
                          {eventsForDay.length > 0 && (
                            <Badge>{eventsForDay.length} {eventsForDay.length === 1 ? 'event' : 'events'}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {eventsForDay.length === 0 ? (
                          <div className="py-4 text-center text-muted-foreground">
                            No events scheduled
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {eventsForDay
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map(event => (
                                <div key={event.id} className="flex gap-3 py-2">
                                  <div className="w-16 flex-shrink-0 text-sm font-medium">
                                    {event.startTime}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm text-muted-foreground">{event.course}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                      {event.isOnline ? (
                                        <span className="flex items-center gap-1">
                                          <Video className="h-3 w-3" />
                                          Online
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {event.location}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {event.startTime} - {event.endTime}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant={
                                    event.type === 'class' ? 'default' :
                                    event.type === 'exam' ? 'destructive' :
                                    event.type === 'workshop' ? 'secondary' :
                                    'outline'
                                  } className="ml-auto h-fit">
                                    {event.type}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            {/* Upcoming Events */}
            <TabsContent value="upcoming" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Upcoming Events</h2>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="class">Classes</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="consultation">Consultations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {getUpcomingEvents(filteredEvents).map(event => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>{event.course}</CardDescription>
                        </div>
                        <Badge variant={
                          event.type === 'class' ? 'default' :
                          event.type === 'exam' ? 'destructive' :
                          event.type === 'workshop' ? 'secondary' :
                          'outline'
                        }>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{format(event.date, 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.startTime} - {event.endTime}</span>
                        </div>
                        
                        {event.instructor && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.instructor}</span>
                          </div>
                        )}
                        
                        {event.isOnline ? (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Online Class</span>
                            {event.meetingLink && (
                              <Button variant="link" size="sm" className="h-auto p-0">
                                Join Meeting
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 