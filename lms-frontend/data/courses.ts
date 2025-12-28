import type { Course } from "../types/course"
import { API_BASE_URL } from "./api"
import { getToken } from "../lib/auth"

export interface Module {
  id: number
  title: string
  description: string
  orderIndex: number
  chapters: Chapter[]
}

export interface Chapter {
  id: number
  title: string
  description: string
  orderIndex: number
  free: boolean
  isVideoContent: boolean
  content: string
  youtubeLink: string
  document: Document | null
}

export interface Document {
  id: number
  name: string
  url: string
  type: string
  size: number
}

export interface Questionnaire {
  id: number
  courseId: number
  title: string
  description: string
  questions: Question[]
}

export interface Question {
  id: number
  questionnaireId: number
  text: string
  type: "multiple-choice" | "true-false" | "open-ended"
  options?: string[]
  correctAnswer?: string | number
}

export async function getCourses(): Promise<Course[]> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers:headers,
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch courses:', response.status, response.statusText)
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Fetched courses:', data)
    return data
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}
export async function getPublishedCourses(): Promise<Course[]> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    const response = await fetch(`${API_BASE_URL}/courses/published`, {
      method: 'GET',
      headers:headers,
      credentials: 'include'
    })

    if (!response.ok) {
      console.error('Failed to fetch courses:', response.status, response.statusText)
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Fetched courses:', data)
    return data
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch course:', response.status, response.statusText)
      throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const token = getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch courses:', response.status, response.statusText)
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export async function updateCourse(id: number, course: Partial<Course> & { duration?: string | number }): Promise<Course> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }

    // Ensure all required number fields have valid values if they exist in the update
    const courseData = { ...course } as any; // Use any temporarily for the transformation
    
    // Handle duration field (may come as duration from form or durationInWeeks from code)
    if (course.hasOwnProperty('duration') && !course.hasOwnProperty('durationInWeeks')) {
      courseData.durationInWeeks = Number(course.duration);
      delete courseData.duration; // Remove the non-standard property
    }
    
    // Convert string numbers to actual numbers
    if (courseData.durationInWeeks && typeof courseData.durationInWeeks === 'string') {
      courseData.durationInWeeks = Number(courseData.durationInWeeks);
    }
    
    if (courseData.fee && typeof courseData.fee === 'string') {
      courseData.fee = Number(courseData.fee);
    }
    
    // Only set these defaults if the field is included in the update
    if ('numberOfModules' in courseData && (courseData.numberOfModules === null || isNaN(Number(courseData.numberOfModules)))) {
      courseData.numberOfModules = 0;
    }
    
    if ('totalChapters' in courseData && (courseData.totalChapters === null || isNaN(Number(courseData.totalChapters)))) {
      courseData.totalChapters = 0;
    }
    
    if ('freeChapters' in courseData && (courseData.freeChapters === null || isNaN(Number(courseData.freeChapters)))) {
      courseData.freeChapters = 0;
    }

    console.log('Updating course with data:', courseData);

    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: headers,
      credentials: "include",
      body: JSON.stringify(courseData)
    })
    
    if (!response.ok) {
      console.error("Failed to update course:", response.status, response.statusText)
      throw new Error(`Failed to update course: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error updating course:", error)
    throw error
  }
}

export async function createChapter(moduleId: number, chapter: Partial<Chapter>): Promise<Chapter> {
  try {
    // Get token from auth helper
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
    // Send all data, including documents if present
    const chapterData: any = {
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex || 0,
      free: (chapter as any).free || false,
      isVideoContent: chapter.isVideoContent || false,
      content: chapter.content || '',
      youtubeLink: chapter.youtubeLink || ''
    };
    if ((chapter as any).documents) {
      chapterData.documents = (chapter as any).documents;
    }
    console.log('Creating chapter with data:', chapterData);
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/chapters`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(chapterData)
    });
    if (!response.ok) {
      console.error('Failed to create chapter:', response.status, response.statusText);
      throw new Error(`Failed to create chapter: ${response.status} ${response.statusText}`);
    }
    // The backend now returns a ChapterCreationResponse
    const createdChapter = await response.json();
    // Convert the DTO response to our Chapter interface
    return {
      id: createdChapter.id,
      title: createdChapter.title,
      description: createdChapter.description,
      orderIndex: createdChapter.orderIndex,
      free: createdChapter.free,
      isVideoContent: createdChapter.isVideoContent,
      content: createdChapter.content,
      youtubeLink: createdChapter.youtubeLink,
      document: null,
      documents: [] // Initialize with empty documents array
    } as unknown as Chapter;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw error;
  }
}

export async function createModule(courseId: number, module: Partial<Module>): Promise<Module> {
  try {
    // Get token from auth helper
    const token = getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }
    
    // Send only the necessary data to create a module
    const moduleData = {
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex || 0
    };
    
    console.log('Creating module with data:', moduleData);
    
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(moduleData)
    });
    
    if (!response.ok) {
      console.error('Failed to create module:', response.status, response.statusText);
      throw new Error(`Failed to create module: ${response.status} ${response.statusText}`);
    }
    
    // The backend now returns a ModuleCreationResponse
    const createdModule = await response.json();
    
    // Convert the DTO response to our Module interface
    return {
      id: createdModule.id,
      title: createdModule.title,
      description: createdModule.description,
      orderIndex: createdModule.orderIndex,
      chapters: [] // Initialize with empty chapters array
    };
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

export async function updateModule(courseId: number, moduleId: number, module: Partial<Module>): Promise<Module> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(module)
    })
    
    if (!response.ok) {
      console.error('Failed to update module:', response.status, response.statusText)
      throw new Error(`Failed to update module: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating module:', error)
    throw error
  }
}

export async function updateChapter(moduleId: number, chapterId: number, chapter: Partial<Chapter>): Promise<Chapter> {
  try {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/chapters/${chapterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(chapter)
    })
    
    if (!response.ok) {
      console.error('Failed to update chapter:', response.status, response.statusText)
      throw new Error(`Failed to update chapter: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating chapter:', error)
    throw error
  }
}

export async function deleteCourse(courseId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to delete course:', response.status, response.statusText)
      throw new Error(`Failed to delete course: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  try {
    // Get token from auth helper
    const token = getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found. Request may fail.');
    }
    
    // Ensure all required number fields have valid values
    const courseData = {
      ...course,
      numberOfModules: course.numberOfModules ?? 0,
      totalChapters: course.totalChapters ?? 0,
      freeChapters: course.freeChapters ?? 0
    };
    
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(courseData)
    });
    
    if (!response.ok) {
      console.error('Failed to create course:', response.status, response.statusText)
      throw new Error(`Failed to create course: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

export async function deleteModule(courseId: number, moduleId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to delete module:', response.status, response.statusText)
      throw new Error(`Failed to delete module: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting module:', error)
    throw error
  }
}

export async function deleteChapter(moduleId: number, chapterId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      console.error('Failed to delete chapter:', response.status, response.statusText)
      throw new Error(`Failed to delete chapter: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting chapter:', error)
    throw error
  }
}

// export const courses: Course[] = [
//     {
//         id: 1,
//         title: "Introduction to Programming",
//         description: "Learn the fundamentals of programming with this comprehensive course.",
//         durationInWeeks: 8,
//         fee: 99.99,
//         numberOfModules: 4,
//         totalChapters: 12,
//         freeChapters: 3,
//         hasAssessment: true,
//         thumbnailUrl: "/images/course1.jpg",
//         published: true,
//         modules: [
//             {
//                 id: 1,
//                 title: "Programming Basics",
//                 description: "Learn the basic concepts of programming",
//                 orderIndex: 1,
//                 chapters: [
//                     {
//                         id: 1,
//                         title: "What is Programming?",
//                         description: "Introduction to programming concepts",
//                         orderIndex: 1,
//                         isFree: true,
//                         isVideoContent: true,
//                         content: "Programming is the process of creating a set of instructions...",
//                         youtubeLink: "https://youtube.com/watch?v=example1",
//                         document: null,
//                         documents: []
//                     },
//                     {
//                         id: 2,
//                         title: "Variables and Data Types",
//                         description: "Understanding variables and data types",
//                         orderIndex: 2,
//                         isFree: false,
//                         isVideoContent: true,
//                         content: "Variables are containers for storing data values...",
//                         youtubeLink: "https://youtube.com/watch?v=example2",
//                         document: null,
//                         documents: []
//                     }
//                 ]
//             }
//         ]
//     },
//     {
//         id: 2,
//         title: "Web Development Fundamentals",
//         description: "Master the basics of web development with HTML, CSS, and JavaScript.",
//         durationInWeeks: 12,
//         fee: 149.99,
//         numberOfModules: 6,
//         totalChapters: 18,
//         freeChapters: 4,
//         hasAssessment: true,
//         thumbnailUrl: "/images/course2.jpg",
//         published: true,
//         modules: [
//             {
//                 id: 2,
//                 title: "HTML Basics",
//                 description: "Learn the structure of web pages",
//                 orderIndex: 1,
//                 chapters: [
//                     {
//                         id: 3,
//                         title: "HTML Introduction",
//                         description: "Getting started with HTML",
//                         orderIndex: 1,
//                         isFree: true,
//                         isVideoContent: true,
//                         content: "HTML is the standard markup language for creating web pages...",
//                         youtubeLink: "https://youtube.com/watch?v=example3",
//                         document: null,
//                         documents: []
//                     }
//                 ]
//             }
//         ]
//     }
// ];


