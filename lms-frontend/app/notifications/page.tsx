"use client"

import { useState } from "react"
import { 
  Bell, 
  Check, 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  User, 
  FileText,
  Settings,
  Clock,
  Filter
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Type definition for notifications
interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: 'course' | 'message' | 'assessment' | 'system' | 'comment';
  link: string;
  user?: {
    name: string;
    avatar: string;
  }
}

export default function NotificationsPage() {
  // Notifications data with empty array for no notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Sample notifications data that can be used later
  const sampleNotifications: Notification[] = [
    {
      id: "1",
      title: "New course enrollment",
      description: "A new student enrolled in \"Introduction to Web Development\"",
      timestamp: "10 minutes ago",
      read: false,
      category: "course",
      link: "/courses/web-dev-101",
    },
    {
      id: "2",
      title: "Assessment completed",
      description: "5 students completed the \"React Knowledge Check\"",
      timestamp: "1 hour ago",
      read: false,
      category: "assessment",
      link: "/courses/react-fundamentals/assessments",
    },
    {
      id: "3",
      title: "New message",
      description: "John Smith sent you a message",
      timestamp: "3 hours ago",
      read: true,
      category: "message",
      link: "/messages/dm-123",
      user: {
        name: "John Smith",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&auto=format&fit=crop",
      }
    },
    {
      id: "4",
      title: "Comment on your module",
      description: "Sarah Lee commented on your \"CSS Styling\" module",
      timestamp: "5 hours ago",
      read: true,
      category: "comment",
      link: "/courses/web-dev-101/module/css-styling",
      user: {
        name: "Sarah Lee",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop",
      }
    },
    {
      id: "5",
      title: "System maintenance",
      description: "The system will be under maintenance on Sunday, 5:00 PM - 7:00 PM",
      timestamp: "1 day ago",
      read: true,
      category: "system",
      link: "/announcements/system-maintenance",
    },
    {
      id: "6",
      title: "New course available",
      description: "A new course \"Advanced JavaScript Patterns\" is now available",
      timestamp: "2 days ago",
      read: true,
      category: "course",
      link: "/courses/advanced-js-patterns",
    },
    {
      id: "7",
      title: "Feedback requested",
      description: "Please provide feedback for the \"React Hooks Workshop\"",
      timestamp: "3 days ago",
      read: true,
      category: "course",
      link: "/courses/react-hooks/feedback",
    },
    {
      id: "8",
      title: "Assessment deadline approaching",
      description: "The \"JavaScript Basics\" assessment deadline is tomorrow",
      timestamp: "3 days ago",
      read: true,
      category: "assessment",
      link: "/courses/js-basics/assessments",
    }
  ];
  
  // State for active filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  // Load sample notifications (this function could be used later)
  const loadSampleNotifications = () => {
    setNotifications(sampleNotifications);
  };
  
  // Filter notifications based on active filter and search query
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = activeFilter ? notification.category === activeFilter : true;
    const matchesSearch = searchQuery 
      ? notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        notification.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });
  
  // Get count of unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Get icon for notification category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'course': return <BookOpen className="h-5 w-5" />;
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'assessment': return <FileText className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'comment': return <MessageSquare className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
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
                  <BreadcrumbLink href="/">Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge className="ml-2 h-6 px-2 bg-red-500 text-white">
                    {unreadCount} New
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Stay updated with your latest activities and announcements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFilter && (
                      <Badge className="ml-2" variant="secondary">1</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={!activeFilter ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter(null)}
                  >
                    All notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={activeFilter === "course" ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter("course")}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Course updates
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={activeFilter === "assessment" ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter("assessment")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Assessments
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={activeFilter === "message" ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter("message")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={activeFilter === "comment" ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter("comment")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={activeFilter === "system" ? "bg-accent" : ""} 
                    onClick={() => setActiveFilter("system")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="w-full sm:w-auto border-b">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 sm:flex-none">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-2 h-5 px-1" variant="secondary">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  {filteredNotifications.length > 0 ? (
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`flex items-start gap-4 p-4 hover:bg-accent/10 transition-colors cursor-pointer ${!notification.read ? 'bg-accent/5' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                            {getCategoryIcon(notification.category)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {notification.timestamp}
                            </div>
                          </div>
                          {notification.user && (
                            <div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                                <AvatarFallback>{notification.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No notifications found</h3>
                      <p className="text-muted-foreground text-center mt-2">
                        {activeFilter || searchQuery ? 
                          "Try changing your filter or search query." :
                          "You're all caught up! Check back later for new notifications."}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <p>Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</p>
                    {notifications.length === 0 ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs font-normal"
                        onClick={loadSampleNotifications}
                      >
                        Load sample notifications
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-normal">
                        View all
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="unread">
              <Card>
                <CardContent className="p-0">
                  {filteredNotifications.filter(n => !n.read).length > 0 ? (
                    <div className="divide-y">
                      {filteredNotifications
                        .filter(notification => !notification.read)
                        .map((notification) => (
                          <div 
                            key={notification.id} 
                            className="flex items-start gap-4 p-4 hover:bg-accent/10 transition-colors cursor-pointer bg-accent/5"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-primary">
                                  {notification.title}
                                </p>
                                <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" /> {notification.timestamp}
                              </div>
                            </div>
                            {notification.user && (
                              <div>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                                  <AvatarFallback>{notification.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Check className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No unread notifications</h3>
                      <p className="text-muted-foreground text-center mt-2">
                        You're all caught up! Check back later for new notifications.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <p>
                      {unreadCount > 0 ? 
                        `Showing ${filteredNotifications.filter(n => !n.read).length} unread notification${filteredNotifications.filter(n => !n.read).length !== 1 ? 's' : ''}` : 
                        'No unread notifications'}
                    </p>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs font-normal"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 