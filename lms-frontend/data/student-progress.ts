import { API_BASE_URL } from "./api";
import { getToken } from "@/lib/auth";

export interface Chapter {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  free: boolean;
}

export interface ModuleProgress {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  progressPercentage: number;
  totalItems: number;
  completedItems: number;
  chapters: Chapter[];
}

export interface CourseProgress {
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
  studentCourseEnrollmentStatus:string;
  items: ModuleProgress[];
}

export interface OverallProgress {
  id: null;
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
}

export interface StudentProgressData {
  overallProgress: OverallProgress;
  courseProgress: CourseProgress[];
}

/**
 * Fetch student progress data for courses
 */
export async function getStudentProgressData(): Promise<StudentProgressData | null> {
  try {
    const token = getToken();
    
    if (!token) {
      console.warn('No authentication token found. Request may fail.');
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE_URL}/student/progress/courses`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch student progress:', response.status, response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student progress data:', error);
    return null;
  }
} 