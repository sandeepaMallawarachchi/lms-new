"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Student {
  id: number
  name: string
  avatar?: string
  enrolledDate: string
  progress: number
  email?: string
}

interface StudentCourseCardProps {
  courseName: string
  students: Student[]
  color: string
  progressColor: string
  onClick?: () => void
}

export default function StudentCourseCard({
  courseName,
  students,
  color,
  progressColor,
  onClick
}: StudentCourseCardProps) {
  if (students.length === 0) {
    return null
  }

  return (
    <div className={`${color} rounded-lg p-4`} onClick={onClick}>
      {courseName && (
        <div className="pb-2">
          <h3 className="text-lg font-semibold">
            {onClick ? (
              <span className="cursor-pointer hover:underline">Course: {courseName}</span>
            ) : (
              `Course: ${courseName}`
            )}
          </h3>
        </div>
      )}
      <div className="space-y-2">
        {students.map((student) => (
          <Link 
            key={student.id} 
            href={`/students/${student.id}`}
            className="block transition-transform hover:scale-[1.01] hover:shadow-md"
          >
            <div className="bg-white py-2 px-4 rounded-lg flex items-center shadow-sm">
              <Avatar className="h-12 w-12 rounded-full mr-3 bg-gray-100">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-sm">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h4 className="text-base font-medium">{student.name}</h4>
                    <p className="text-xs text-gray-500">Enrolled: {student.enrolledDate}</p>
                  </div>
                
                  <div className="flex items-center gap-2 mt-1 sm:mt-0 sm:ml-2 max-w-[180px] flex-grow">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className={`h-full ${progressColor} rounded-full`}
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap min-w-[32px] text-right">{student.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 