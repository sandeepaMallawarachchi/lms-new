"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ChevronLeft, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Example quiz data
const quizData = {
  id: 1,
  title: "Basic Korean Vocabulary Quiz",
  courseId: 1,
  courseName: "Korean Beginner Level 1",
  description: "Test your knowledge of basic Korean vocabulary and phrases learned in this module.",
  timeLimit: "20 minutes",
  totalQuestions: 5,
  questions: [
    {
      id: 1,
      type: "multiple-choice",
      text: "What is the Korean word for 'Hello'?",
      options: [
        { id: 'a', text: "안녕하세요 (Annyeonghaseyo)" },
        { id: 'b', text: "감사합니다 (Gamsahamnida)" },
        { id: 'c', text: "미안합니다 (Mianhamnida)" },
        { id: 'd', text: "안녕히 가세요 (Annyeonghi gaseyo)" }
      ],
      correctAnswer: "a",
      explanation: "안녕하세요 (Annyeonghaseyo) is the formal way to say 'Hello' in Korean."
    },
    {
      id: 2,
      type: "multiple-choice",
      text: "Which of the following is the correct way to say 'Thank you' in Korean?",
      options: [
        { id: 'a', text: "안녕하세요 (Annyeonghaseyo)" },
        { id: 'b', text: "감사합니다 (Gamsahamnida)" },
        { id: 'c', text: "미안합니다 (Mianhamnida)" },
        { id: 'd', text: "네 (Ne)" }
      ],
      correctAnswer: "b",
      explanation: "감사합니다 (Gamsahamnida) means 'Thank you' in Korean."
    },
    {
      id: 3,
      type: "multiple-choice",
      text: "How do you say 'My name is...' in Korean?",
      options: [
        { id: 'a', text: "저는 ... 입니다 (Jeoneun ... imnida)" },
        { id: 'b', text: "당신의 이름은 무엇입니까? (Dangsin-ui ileum-eun mueos-ibnikka?)" },
        { id: 'c', text: "만나서 반갑습니다 (Mannaseo bangapseumnida)" },
        { id: 'd', text: "어디에 살아요? (Eodie salayo?)" }
      ],
      correctAnswer: "a",
      explanation: "저는 ... 입니다 (Jeoneun ... imnida) is how you introduce yourself by saying 'My name is...' or 'I am...' in Korean."
    },
    {
      id: 4,
      type: "multiple-choice",
      text: "Which number system is used for counting objects in Korean?",
      options: [
        { id: 'a', text: "Sino-Korean numbers only" },
        { id: 'b', text: "Native Korean numbers only" },
        { id: 'c', text: "Both systems depending on the context" },
        { id: 'd', text: "Neither, a different system is used" }
      ],
      correctAnswer: "c",
      explanation: "Korean uses two number systems: Native Korean numbers (typically for counting up to 99, age, time, etc.) and Sino-Korean numbers (dates, money, phone numbers, etc.)."
    },
    {
      id: 5,
      type: "multiple-choice",
      text: "What is the correct way to say 'Goodbye' to someone who is leaving (while you stay)?",
      options: [
        { id: 'a', text: "안녕히 가세요 (Annyeonghi gaseyo)" },
        { id: 'b', text: "안녕히 계세요 (Annyeonghi gyeseyo)" },
        { id: 'c', text: "또 만나요 (Tto mannayo)" },
        { id: 'd', text: "좋은 하루 되세요 (Joeun haru doeseyo)" }
      ],
      correctAnswer: "a",
      explanation: "안녕히 가세요 (Annyeonghi gaseyo) is used to say goodbye to someone who is leaving, meaning 'Go in peace'."
    }
  ]
}

export default function CourseEvaluation() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  
  const currentQuestion = quizData.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizData.totalQuestions) * 100
  
  // Calculate scores once submitted
  const calculateScore = () => {
    let correctCount = 0
    quizData.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    return {
      score: correctCount,
      total: quizData.totalQuestions,
      percentage: Math.round((correctCount / quizData.totalQuestions) * 100)
    }
  }
  
  const scoreData = submitted ? calculateScore() : null
  
  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    })
  }
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }
  
  const handleSubmit = () => {
    setSubmitted(true)
  }
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

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
            <h1 className="text-lg font-semibold md:text-xl">{quizData.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {!submitted && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <Avatar>
              <AvatarImage src="/images/students/emily.jpg" alt="Emily Johnson" />
              <AvatarFallback>EJ</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {!submitted ? (
            <>
              <Card className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>{quizData.title}</CardTitle>
                    <CardDescription>{quizData.courseName}</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {quizData.totalQuestions}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        Question {currentQuestionIndex + 1}: {currentQuestion.text}
                      </h3>
                      <RadioGroup 
                        value={selectedAnswers[currentQuestion.id] || ""} 
                        onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                        className="space-y-3 mt-4"
                      >
                        {currentQuestion.options.map((option) => (
                          <div key={option.id} className="flex items-start space-x-2">
                            <RadioGroupItem id={`option-${option.id}`} value={option.id} className="mt-1" />
                            <Label 
                              htmlFor={`option-${option.id}`} 
                              className="font-normal cursor-pointer leading-relaxed"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === quizData.totalQuestions - 1 ? (
                    <Button 
                      onClick={handleSubmit}
                      disabled={Object.keys(selectedAnswers).length < quizData.totalQuestions}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswers[currentQuestion.id]}
                    >
                      Next Question
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {Object.keys(selectedAnswers).length < quizData.totalQuestions && currentQuestionIndex === quizData.totalQuestions - 1 && (
                <Alert variant="destructive" className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Please complete all questions</AlertTitle>
                  <AlertDescription>
                    You need to answer all {quizData.totalQuestions} questions before submitting the quiz.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            // Results screen
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> 
                  Quiz Completed: {quizData.title}
                </CardTitle>
                <CardDescription>{quizData.courseName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Quiz Results</h3>
                    <div className="bg-muted rounded-lg p-6 flex flex-col items-center">
                      <div className="text-4xl font-bold text-primary mb-2">{scoreData?.percentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        You answered {scoreData?.score} out of {scoreData?.total} questions correctly
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Feedback</h3>
                    <Textarea 
                      placeholder="Share your thoughts about this quiz..." 
                      className="h-[120px]"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Review Your Answers</h3>
                  
                  {quizData.questions.map((question, index) => {
                    const isCorrect = selectedAnswers[question.id] === question.correctAnswer
                    const selectedOption = question.options.find(opt => opt.id === selectedAnswers[question.id])
                    const correctOption = question.options.find(opt => opt.id === question.correctAnswer)
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          {isCorrect ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Correct
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" /> Incorrect
                            </span>
                          )}
                        </div>
                        
                        <p>{question.text}</p>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Your answer:</span>
                            <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                              {selectedOption?.text || "Not answered"}
                            </span>
                          </div>
                          
                          {!isCorrect && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Correct answer:</span>
                              <span className="text-green-600">{correctOption?.text}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted rounded-md p-3 text-sm">
                          <span className="font-medium">Explanation: </span>
                          {question.explanation}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push('/student-dashboard')}>
                  Return to Dashboard
                </Button>
                <Button onClick={() => router.push('/student-dashboard/my-courses')}>
                  Continue Learning
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 