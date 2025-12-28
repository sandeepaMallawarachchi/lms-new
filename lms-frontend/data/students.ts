import { API_BASE_URL } from "./api";
import { getToken } from "@/lib/auth";

export interface StudentRequestResponse {
  id: number;

  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  whatsAppNumber: string;
  knowledge: string;
  gender: string;
  bio: string;
  hasInactiveAccount: boolean;
  requestedCourses: CourseInfo[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface CourseInfo {
  courseId: number;
  courseName: string;
}

export async function getAllStudentRequests(): Promise<StudentRequestResponse[]> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student requests:', response.status, response.statusText);
      throw new Error(`Failed to fetch student requests: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Sort by request_date descending (newest first)
    return data.sort((a: any, b: any) => {
      const dateA = new Date(a.requestDate || a.request_date || 0).getTime();
      const dateB = new Date(b.requestDate || b.request_date || 0).getTime();
      return dateB - dateA; // Descending order
    });

  } catch (error) {
    console.error('Error fetching student requests:', error);
    return [];
  }
}

export async function getPendingStudentRequests(): Promise<StudentRequestResponse[]> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests/pending`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch pending student requests:', response.status, response.statusText);
      throw new Error(`Failed to fetch pending student requests: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending student requests:', error);
    return [];
  }
}

export async function approveStudentRequest(requestId: number): Promise<any> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests/${requestId}/approve`, {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to approve student request:', response.status, response.statusText);
      throw new Error(`Failed to approve student request: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving student request:', error);
    throw error;
  }
}

export async function rejectStudentRequest(requestId: number): Promise<any> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests/${requestId}/reject`, {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to reject student request:', response.status, response.statusText);
      throw new Error(`Failed to reject student request: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting student request:', error);
    throw error;
  }
}

export async function approveSelectedCourses(requestId: number, courseIds: number[]): Promise<any> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests/${requestId}/approve-selected`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ courseIds })
    });

    if (!response.ok) {
      console.error('Failed to approve selected courses:', response.status, response.statusText);
      throw new Error(`Failed to approve selected courses: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving selected courses:', error);
    throw error;
  }
}

// Interface for students by course
export interface StudentsByCourseResponse {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  averageCompletionRate: number;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  students: {
    studentId: number;
    studentName: string;
    email: string;
    profileImage: string;
    enrollmentDate: string;
    progressPercentage: number;
    active: boolean;
    enrollmentStatus: string;
  }[];
}

// Interface for student stats
export interface StudentStatsResponse {
  totalStudents: number;
  enrollmentByCourse: {
    courseId: number;
    courseName: string;
    studentCount: number;
  }[];
  completionRate: number;
}

// Get students by course
export async function getStudentsByCourse(
  courseId: number,
  page: number = 0,
  size: number = 10
): Promise<StudentsByCourseResponse | null> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }
    let url = `${API_BASE_URL}/admin/dashboard/students-by-course/${courseId}?page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!response.ok) {
      console.error('Failed to fetch students by course:', response.status, response.statusText);
      throw new Error(`Failed to fetch students by course: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching students by course:', error);
    return null;
  }
}

// Get student stats
export async function getStudentStats(): Promise<StudentStatsResponse | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/admin/dashboard/student-stats`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student stats:', response.status, response.statusText);
      throw new Error(`Failed to fetch student stats: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return null;
  }
}

// Student profile interfaces
export interface StudentChapter {
  chapterId: number;
  chapterTitle: string;
  completed: boolean;
}

export interface StudentModule {
  moduleId: number;
  moduleTitle: string;
  progressPercentage: number;
  completed: boolean;
  chapters: StudentChapter[];
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  enrollmentDate: string;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
  finalScore: number | null;
  modules: StudentModule[];
}

export interface StudentDetails {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  status: string;
  department: string;
  enrollmentDate: string;
  contactNumber: string;
  address: string;
  profileImage: string;
  dateOfBirth: string;
  bio: string;
  overallProgressPercentage: number;
  courseProgress: CourseProgress[];
}

export interface StudentCourseChapter {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  youtubeLink: string | null;
  progressPercentage: number;
  timeSpentSeconds: number;
  lastUpdated: string | null;
  free: boolean;
  videoContent: boolean;
}

export interface StudentCourseModule {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  progressPercentage: number;
  totalItems: number;
  completedItems: number;
  chapters: StudentCourseChapter[];
}

export interface StudentCourseDetails {
  id: number;
  title: string;
  completed: boolean;
  progressPercentage: number;
  totalItems: number;
  completedItems: number;
  totalModules: number;
  completedModules: number;
  totalChapters: number;
  completedChapters: number;
  items: StudentCourseModule[];
}

// Get student details by ID
export async function getStudentDetails(studentId: number): Promise<StudentDetails | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-details/${studentId}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student details:', response.status, response.statusText);
      throw new Error(`Failed to fetch student details: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student details:', error);
    return null;
  }
}

// Get student course details
export async function getStudentCourseDetails(studentId: number, courseId: number): Promise<StudentCourseDetails | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-details/${studentId}/courses/${courseId}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student course details:', response.status, response.statusText);
      throw new Error(`Failed to fetch student course details: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student course details:', error);
    return null;
  }
}

// Student progress overview interface
export interface StudentChapterProgress {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  youtubeLink: string | null;
  progressPercentage: number;
  timeSpentSeconds: number;
  lastUpdated: string | null;
  free: boolean;
  videoContent: boolean;
}

export interface StudentModuleProgress {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  progressPercentage: number;
  totalItems: number;
  completedItems: number;
  chapters: StudentChapterProgress[];
}

export interface StudentCourseProgress {
  id: number;
  title: string;
  completed: boolean;
  progressPercentage: number;
  totalItems: number;
  completedItems: number;
  totalModules: number;
  completedModules: number;
  totalChapters: number;
  completedChapters: number;
  items: StudentModuleProgress[];
}

export interface StudentProgressResponse {
  overallProgress: {
    id: number | null;
    title: string;
    completed: boolean;
    progressPercentage: number;
    totalItems: number;
    completedItems: number;
    totalModules: number;
    completedModules: number;
    totalChapters: number;
    completedChapters: number;
    items: any[];
  };
  courseProgress: StudentCourseProgress[];
}

// Get student progress
export async function getStudentProgress(): Promise<StudentProgressResponse | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student/progress/courses`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student progress:', response.status, response.statusText);
      throw new Error(`Failed to fetch student progress: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return null;
  }
}

// Get current student details
export async function getCurrentStudentDetails(): Promise<StudentDetails | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-details/current`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch current student details:', response.status, response.statusText);
      throw new Error(`Failed to fetch current student details: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current student details:', error);
    return null;
  }
}

// Student profile update interface
export interface StudentProfileUpdate {
  fullName: string;
  contactNumber: string;
  address: string;
  dateOfBirth: string;
  bio: string;
  profileImageBase64?: string;
}

// Update current student profile
export async function updateCurrentStudentProfile(profileData: StudentProfileUpdate): Promise<StudentDetails | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-details/current`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      console.error('Failed to update student profile:', response.status, response.statusText);
      throw new Error(`Failed to update student profile: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating student profile:', error);
    throw error;
  }
}

export async function getStudentRequestById(requestId: number): Promise<StudentRequestResponse | null> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/student-requests/${requestId}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch student request:', response.status, response.statusText);
      throw new Error(`Failed to fetch student request: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching student request:', error);
    return null;
  }
} 