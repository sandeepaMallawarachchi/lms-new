"use client"

import { useEffect, useState } from "react"
import { AudioWaveform, BookOpen, Calendar, Command, FileText, GalleryVerticalEnd, GraduationCap, Home, MessageSquare, Settings, SquareTerminal, Users, User, Shield } from "lucide-react"

import { NavMain, type NavSection } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { getCurrentUser, type UserProfile } from "@/data/user"

// Admin navigation section
const adminNavSections: NavSection[] = [
  {
    title: "Administration",
    items: [
      {
        title: "Student Management",
        url: "/students",
        icon: Users,
        isActive: true,
        items: [
          {
            title: "Students",
            url: "/students",
          },
          {
            title: "New Requests",
            url: "/students/requests",
          },
        ],
      },
      {
        title: "Course Management",
        url: "/courses",
        icon: BookOpen,
        isActive: false,
        items: [
          {
            title: "All Courses",
            url: "/courses",
          },
          {
            title: "Add New Course",
            url: "/courses/new",
          },
          // {
          //   title: "Categories",
          //   url: "/courses/categories",
          // },
        ],
      },
    ],
  }
]

// Student navigation section
const studentNavSections: NavSection[] = [
  {
    title: "Student Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/student-dashboard",
        icon: Home,
        isActive: false,
      },
      {
        title: "My Courses",
        url: "/student-dashboard/my-courses",
        icon: BookOpen,
        isActive: false,
      },
      // {
      //   title: "Course Requests",
      //   url: "/student-dashboard/request-course",
      //   icon: FileText,
      //   isActive: false,
      // },false
      // {
      //   title: "Assignments",
      //   url: "/student-dashboard/assignments",
      //   icon: FileText,
      //   isActive: false,
      // },
      // {
      //   title: "Evaluations",
      //   url: "/student-dashboard/evaluation",
      //   icon: GraduationCap,
      //   isActive: false,
      // },
      // {
      //   title: "Schedule",
      //   url: "/student-dashboard/schedule",
      //   icon: Calendar,
      //   isActive: false,
      // },
      {
        title: "Messages",
        url: "/student-dashboard/messages",
        icon: MessageSquare,
        isActive: false,
      },
      {
        title: "My Profile",
        url: "/student-dashboard/profile",
        icon: User,
        isActive: false,
      },
      // {
      //   title: "Security Settings",
      //   url: "/student-dashboard/security",
      //   icon: Shield,
      //   isActive: false,
      // },
    ],
  }
]

// Default data for the initial render
const defaultData = {
  user: {
    name: "Loading...",
    email: "",
    avatar: "/avatars/user-placeholder.jpg",
  },
  teams: [
    {
      name: "Admin Portal",
      logo: GraduationCap,
      plan: "Administration",
    },
    {
      name: "Student Portal",
      logo: Users,
      plan: "Learning",
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState(defaultData.user);
  const [loading, setLoading] = useState(true);
  const [navSections, setNavSections] = useState<NavSection[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teams, setTeams] = useState(defaultData.teams);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userProfile = await getCurrentUser();

        if (userProfile) {
          // Set user data
          setUserData({
            name: userProfile.firstName && userProfile.lastName
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : userProfile.username,
            email: userProfile.email,
            avatar: userProfile.profileImage || "/avatars/user-placeholder.jpg",
          });

          // Check if user has ROLE_ADMIN
          const isAdmin = userProfile.roles?.some(role => role.name === 'ROLE_ADMIN')
            || userProfile.authorities?.some(auth => auth.authority === 'ROLE_ADMIN');

          // Log role detection for debugging
          console.log('User roles:', userProfile.roles?.map(r => r.name));
          console.log('User authorities:', userProfile.authorities?.map(a => a.authority));
          console.log('Is admin:', isAdmin);

          setUserRole(isAdmin ? 'ROLE_ADMIN' : 'ROLE_STUDENT');

          // Mark appropriate sections as active based on role
          const adminSection = JSON.parse(JSON.stringify(adminNavSections),
            (key, value) => {
              // Preserve functions like icon components during JSON parsing
              if (key === 'icon' && typeof value === 'object') {
                return undefined; // We'll reassign icons after parsing
              }
              return value;
            }
          );
          const studentSection = JSON.parse(JSON.stringify(studentNavSections),
            (key, value) => {
              // Preserve functions like icon components during JSON parsing
              if (key === 'icon' && typeof value === 'object') {
                return undefined; // We'll reassign icons after parsing
              }
              return value;
            }
          );

          // Reassign the icons directly from the original navSections
          adminNavSections[0].items.forEach((originalItem, itemIndex) => {
            if (originalItem.icon && adminSection[0].items[itemIndex]) {
              adminSection[0].items[itemIndex].icon = originalItem.icon;
            }
          });

          studentNavSections[0].items.forEach((originalItem, itemIndex) => {
            if (originalItem.icon && studentSection[0].items[itemIndex]) {
              studentSection[0].items[itemIndex].icon = originalItem.icon;
            }
          });

          // Show only the relevant section based on role
          if (isAdmin) {
            // Admin users only see the Administration section
            setNavSections(adminSection);
            // Make first item active
            if (adminSection[0]?.items?.length > 0) {
              adminSection[0].items[0].isActive = true;
            }
            // Show only Admin Portal in team switcher
            setTeams([defaultData.teams[0]]);
          } else {
            // Student users only see the Student Dashboard section
            setNavSections(studentSection);
            // Make first item active
            if (studentSection[0]?.items?.length > 0) {
              studentSection[0].items[0].isActive = true;
            }
            // Show only Student Portal in team switcher
            setTeams([defaultData.teams[1]]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to student navigation if error occurs
        setNavSections(studentNavSections);
        setTeams([defaultData.teams[1]]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
