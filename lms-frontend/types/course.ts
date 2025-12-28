export interface Course {
  id: number
  title: string
  description: string
  durationInWeeks: number
  fee: number
  numberOfModules: number
  totalChapters: number
  freeChapters: number
  hasAssessment: boolean
  thumbnailUrl: string
  published: boolean
  questionnaires: Questionnaire[]
  modules: Module[]
}

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
  youtubeLink?: string
  document?: Document
  documents: Document[]
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
  questionText: string
  questionType: "multiple-choice" | "true-false" | "open-ended"
  options?: string[]
  correctAnswer?: string | number
}
