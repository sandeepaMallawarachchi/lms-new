// "use client"
//
// import type React from "react"
//
// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { AppSidebar } from "../../../../../components/app-sidebar"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { Textarea } from "@/components/ui/textarea"
// import { toast } from "@/components/ui/use-toast"
// import { AlertCircle, Plus, Trash } from "lucide-react"
// import { courses } from "../../../../../data/courses"
// import Link from "next/link"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Badge } from "@/components/ui/badge"
//
// type QuestionType = "multiple-choice" | "true-false" | "open-ended"
//
// interface Option {
//   id: string
//   text: string
// }
//
// interface Question {
//   id: number
//   text: string
//   type: QuestionType
//   options: Option[]
//   correctAnswer?: string | number
// }
//
// export default function EditQuestionnairePage({
//   params,
// }: {
//   params: { id: string }
// }) {
//   const router = useRouter()
//   const courseId = Number.parseInt(params.id)
//   const course = courses.find((c) => c.id === courseId)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [shouldRedirect, setShouldRedirect] = useState(false)
//
//   useEffect(() => {
//     if (!course?.questionnaire) {
//       setShouldRedirect(true)
//     }
//   }, [course])
//
//   useEffect(() => {
//     if (shouldRedirect) {
//       router.push(`/courses/${courseId}/questionnaire/new`)
//     }
//   }, [shouldRedirect, courseId, router])
//
//   if (shouldRedirect) {
//     return null
//   }
//
//   // Initialize state with existing questionnaire data
//   const [formData, setFormData] = useState({
//     title: course?.questionnaire?.title || "",
//     description: course?.questionnaire?.description || "",
//   })
//
//   // Convert existing questions to our internal format
//   const initialQuestions: Question[] =
//     course?.questionnaire?.questions.map((q) => ({
//       id: q.id,
//       text: q.text,
//       type: q.type,
//       options: q.options ? q.options.map((opt, index) => ({ id: `opt-${index}`, text: opt })) : [],
//       correctAnswer: q.correctAnswer,
//     })) || []
//
//   const [questions, setQuestions] = useState<Question[]>(initialQuestions)
//   const [activeQuestionId, setActiveQuestionId] = useState<number | null>(questions.length > 0 ? questions[0].id : null)
//
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value,
//     }))
//   }
//
//   const handleQuestionTextChange = (questionId: number, text: string) => {
//     setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, text } : q)))
//   }
//
//   const handleQuestionTypeChange = (questionId: number, type: QuestionType) => {
//     setQuestions((prev) =>
//       prev.map((q) => {
//         if (q.id === questionId) {
//           // Reset options and correct answer when changing type
//           const updatedQuestion = { ...q, type }
//
//           if (type === "true-false") {
//             updatedQuestion.options = []
//             updatedQuestion.correctAnswer = "false"
//           } else if (type === "multiple-choice" && (!q.options || q.options.length === 0)) {
//             updatedQuestion.options = [
//               { id: `opt-${Date.now()}-1`, text: "" },
//               { id: `opt-${Date.now()}-2`, text: "" },
//             ]
//             updatedQuestion.correctAnswer = 0
//           } else if (type === "open-ended") {
//             updatedQuestion.options = []
//             updatedQuestion.correctAnswer = undefined
//           }
//
//           return updatedQuestion
//         }
//         return q
//       }),
//     )
//   }
//
//   const handleOptionChange = (questionId: number, optionId: string, text: string) => {
//     setQuestions((prev) =>
//       prev.map((q) => {
//         if (q.id === questionId) {
//           return {
//             ...q,
//             options: q.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
//           }
//         }
//         return q
//       }),
//     )
//   }
//
//   const handleCorrectAnswerChange = (questionId: number, value: string | number) => {
//     setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q)))
//   }
//
//   const addOption = (questionId: number) => {
//     setQuestions((prev) =>
//       prev.map((q) => {
//         if (q.id === questionId) {
//           return {
//             ...q,
//             options: [...q.options, { id: `opt-${Date.now()}`, text: "" }],
//           }
//         }
//         return q
//       }),
//     )
//   }
//
//   const removeOption = (questionId: number, optionId: string) => {
//     setQuestions((prev) =>
//       prev.map((q) => {
//         if (q.id === questionId) {
//           const updatedOptions = q.options.filter((opt) => opt.id !== optionId)
//           // Update correctAnswer if the removed option was the correct one
//           let updatedCorrectAnswer = q.correctAnswer
//           if (typeof q.correctAnswer === "number" && updatedOptions.length > 0) {
//             if (q.options[q.correctAnswer as number]?.id === optionId) {
//               updatedCorrectAnswer = 0
//             } else if (q.correctAnswer >= updatedOptions.length) {
//               updatedCorrectAnswer = updatedOptions.length - 1
//             }
//           }
//           return {
//             ...q,
//             options: updatedOptions,
//             correctAnswer: updatedCorrectAnswer,
//           }
//         }
//         return q
//       }),
//     )
//   }
//
//   const addQuestion = () => {
//     const newQuestion: Question = {
//       id: Date.now(),
//       text: "",
//       type: "multiple-choice",
//       options: [
//         { id: `opt-${Date.now()}-1`, text: "" },
//         { id: `opt-${Date.now()}-2`, text: "" },
//       ],
//       correctAnswer: 0,
//     }
//     setQuestions((prev) => [...prev, newQuestion])
//     setActiveQuestionId(newQuestion.id)
//   }
//
//   const removeQuestion = (questionId: number) => {
//     setQuestions((prev) => {
//       const updatedQuestions = prev.filter((q) => q.id !== questionId)
//
//       // If we're removing the active question, select another one
//       if (activeQuestionId === questionId) {
//         if (updatedQuestions.length > 0) {
//           setActiveQuestionId(updatedQuestions[0].id)
//         } else {
//           setActiveQuestionId(null)
//         }
//       }
//
//       return updatedQuestions
//     })
//   }
//
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//
//     // Validate form
//     if (!formData.title || !formData.description) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       })
//       setIsSubmitting(false)
//       return
//     }
//
//     // Validate questions
//     for (const question of questions) {
//       if (!question.text) {
//         toast({
//           title: "Error",
//           description: "All questions must have text",
//           variant: "destructive",
//         })
//         setIsSubmitting(false)
//         return
//       }
//
//       if (question.type === "multiple-choice") {
//         if (question.options.length < 2) {
//           toast({
//             title: "Error",
//             description: "Multiple choice questions must have at least 2 options",
//             variant: "destructive",
//           })
//           setIsSubmitting(false)
//           return
//         }
//
//         for (const option of question.options) {
//           if (!option.text) {
//             toast({
//               title: "Error",
//               description: "All options must have text",
//               variant: "destructive",
//             })
//             setIsSubmitting(false)
//             return
//           }
//         }
//       }
//     }
//
//     // In a real application, you would make an API call here
//     // For now, we'll just simulate success after a short delay
//     setTimeout(() => {
//       toast({
//         title: "Success",
//         description: "Assessment updated successfully",
//       })
//       setIsSubmitting(false)
//       router.push(`/courses/${courseId}`)
//     }, 1000)
//   }
//
//   if (!course) {
//     return (
//       <SidebarProvider>
//         <AppSidebar />
//         <SidebarInset>
//           <div className="p-8">
//             <h1 className="text-2xl font-bold">Course not found</h1>
//             <p className="mt-2">The course you are looking for does not exist.</p>
//             <Button asChild className="mt-4">
//               <Link href="/courses">Back to Courses</Link>
//             </Button>
//           </div>
//         </SidebarInset>
//       </SidebarProvider>
//     )
//   }
//
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem>
//                   <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator />
//                 <BreadcrumbItem>
//                   <BreadcrumbLink href="/courses">Course Management</BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator />
//                 <BreadcrumbItem>
//                   <BreadcrumbLink href={`/courses/${course.id}`}>{course.name}</BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator />
//                 <BreadcrumbItem>
//                   <BreadcrumbPage>Edit Assessment</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold">Edit Assessment</h1>
//           </div>
//
//           <form onSubmit={handleSubmit}>
//             <div className="grid md:grid-cols-3 gap-6">
//               <div className="md:col-span-2">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Assessment Details</CardTitle>
//                     <CardDescription>Edit the assessment for {course.name}.</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="title">
//                         Assessment Title <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         id="title"
//                         placeholder="Enter assessment title"
//                         value={formData.title}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="description">
//                         Description <span className="text-red-500">*</span>
//                       </Label>
//                       <Textarea
//                         id="description"
//                         placeholder="Enter assessment description"
//                         rows={2}
//                         value={formData.description}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>
//
//                 <div className="mt-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-lg font-medium">Questions</h2>
//                     <Button type="button" onClick={addQuestion}>
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add Question
//                     </Button>
//                   </div>
//
//                   {questions.length === 0 ? (
//                     <Card>
//                       <CardContent className="p-6">
//                         <div className="text-center">
//                           <p className="text-muted-foreground mb-4">No questions have been added yet.</p>
//                           <Button type="button" onClick={addQuestion}>
//                             <Plus className="h-4 w-4 mr-2" />
//                             Add First Question
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ) : (
//                     <div className="grid md:grid-cols-3 gap-6">
//                       <div className="space-y-2">
//                         <h3 className="text-sm font-medium mb-2">Question List</h3>
//                         {questions.map((question, index) => (
//                           <div
//                             key={question.id}
//                             className={`p-3 rounded-md border cursor-pointer transition-colors ${
//                               activeQuestionId === question.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
//                             }`}
//                             onClick={() => setActiveQuestionId(question.id)}
//                           >
//                             <div className="flex justify-between items-center">
//                               <span className="font-medium">Question {index + 1}</span>
//                               <Badge variant={activeQuestionId === question.id ? "outline" : "secondary"}>
//                                 {question.type === "multiple-choice"
//                                   ? "Multiple Choice"
//                                   : question.type === "true-false"
//                                     ? "True/False"
//                                     : "Open Ended"}
//                               </Badge>
//                             </div>
//                             <p className="text-sm truncate mt-1">{question.text || "Untitled question"}</p>
//                           </div>
//                         ))}
//                       </div>
//
//                       <div className="md:col-span-2">
//                         {activeQuestionId !== null && (
//                           <Card>
//                             <CardHeader className="pb-2">
//                               <div className="flex justify-between">
//                                 <CardTitle className="text-base">
//                                   Edit Question {questions.findIndex((q) => q.id === activeQuestionId) + 1}
//                                 </CardTitle>
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="sm"
//                                   className="text-destructive h-8 px-2"
//                                   onClick={() => removeQuestion(activeQuestionId)}
//                                 >
//                                   <Trash className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                               {(() => {
//                                 const question = questions.find((q) => q.id === activeQuestionId)
//                                 if (!question) return null
//
//                                 return (
//                                   <>
//                                     <div className="space-y-2">
//                                       <Label htmlFor={`q-${question.id}-text`}>
//                                         Question Text <span className="text-red-500">*</span>
//                                       </Label>
//                                       <Textarea
//                                         id={`q-${question.id}-text`}
//                                         placeholder="Enter question text"
//                                         value={question.text}
//                                         onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
//                                         required
//                                       />
//                                     </div>
//                                     <div className="space-y-2">
//                                       <Label htmlFor={`q-${question.id}-type`}>Question Type</Label>
//                                       <Select
//                                         value={question.type}
//                                         onValueChange={(value) =>
//                                           handleQuestionTypeChange(question.id, value as QuestionType)
//                                         }
//                                       >
//                                         <SelectTrigger id={`q-${question.id}-type`}>
//                                           <SelectValue placeholder="Select question type" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                           <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
//                                           <SelectItem value="true-false">True/False</SelectItem>
//                                           <SelectItem value="open-ended">Open Ended</SelectItem>
//                                         </SelectContent>
//                                       </Select>
//                                     </div>
//
//                                     {question.type === "multiple-choice" && (
//                                       <div className="space-y-2">
//                                         <div className="flex justify-between items-center">
//                                           <Label>
//                                             Options <span className="text-red-500">*</span>
//                                           </Label>
//                                           <Button
//                                             type="button"
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => addOption(question.id)}
//                                           >
//                                             <Plus className="h-4 w-4 mr-2" />
//                                             Add Option
//                                           </Button>
//                                         </div>
//                                         <div className="space-y-2">
//                                           {question.options.map((option, optIndex) => (
//                                             <div key={option.id} className="flex gap-2">
//                                               <RadioGroup
//                                                 value={question.correctAnswer?.toString() || ""}
//                                                 onValueChange={(value) =>
//                                                   handleCorrectAnswerChange(question.id, Number.parseInt(value))
//                                                 }
//                                                 className="flex items-center"
//                                               >
//                                                 <RadioGroupItem
//                                                   value={optIndex.toString()}
//                                                   id={`q-${question.id}-opt-${option.id}-correct`}
//                                                 />
//                                               </RadioGroup>
//                                               <Input
//                                                 id={`q-${question.id}-opt-${option.id}`}
//                                                 placeholder={`Option ${optIndex + 1}`}
//                                                 className="flex-1"
//                                                 value={option.text}
//                                                 onChange={(e) =>
//                                                   handleOptionChange(question.id, option.id, e.target.value)
//                                                 }
//                                                 required
//                                               />
//                                               <Button
//                                                 type="button"
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-10 w-10 text-destructive"
//                                                 onClick={() => removeOption(question.id, option.id)}
//                                                 disabled={question.options.length <= 2}
//                                               >
//                                                 <Trash className="h-4 w-4" />
//                                               </Button>
//                                             </div>
//                                           ))}
//                                         </div>
//                                         <p className="text-xs text-muted-foreground">
//                                           Select the radio button next to the correct answer.
//                                         </p>
//                                       </div>
//                                     )}
//
//                                     {question.type === "true-false" && (
//                                       <div className="space-y-2">
//                                         <Label>Correct Answer</Label>
//                                         <RadioGroup
//                                           value={question.correctAnswer?.toString() || "false"}
//                                           onValueChange={(value) => handleCorrectAnswerChange(question.id, value)}
//                                         >
//                                           <div className="flex items-center space-x-2">
//                                             <RadioGroupItem value="true" id={`q-${question.id}-true`} />
//                                             <Label htmlFor={`q-${question.id}-true`}>True</Label>
//                                           </div>
//                                           <div className="flex items-center space-x-2">
//                                             <RadioGroupItem value="false" id={`q-${question.id}-false`} />
//                                             <Label htmlFor={`q-${question.id}-false`}>False</Label>
//                                           </div>
//                                         </RadioGroup>
//                                       </div>
//                                     )}
//
//                                     {question.type === "open-ended" && (
//                                       <div className="space-y-2">
//                                         <p className="text-sm text-muted-foreground">
//                                           Open-ended questions don't have predefined correct answers. Students'
//                                           responses will need to be manually reviewed.
//                                         </p>
//                                       </div>
//                                     )}
//                                   </>
//                                 )
//                               })()}
//                             </CardContent>
//                           </Card>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//
//               <div>
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Assessment Summary</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       <div>
//                         <p className="text-sm font-medium text-muted-foreground mb-1">Total Questions</p>
//                         <p className="text-2xl font-bold">{questions.length}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-muted-foreground mb-1">Question Types</p>
//                         <div className="flex flex-wrap gap-2 mt-2">
//                           <Badge variant="outline">
//                             {questions.filter((q) => q.type === "multiple-choice").length} Multiple Choice
//                           </Badge>
//                           <Badge variant="outline">
//                             {questions.filter((q) => q.type === "true-false").length} True/False
//                           </Badge>
//                           <Badge variant="outline">
//                             {questions.filter((q) => q.type === "open-ended").length} Open Ended
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                   <CardFooter className="flex flex-col gap-2">
//                     <Button type="submit" className="w-full" disabled={isSubmitting}>
//                       {isSubmitting ? "Saving..." : "Save Assessment"}
//                     </Button>
//                     <Button type="button" variant="outline" className="w-full" asChild>
//                       <Link href={`/courses/${courseId}`}>Cancel</Link>
//                     </Button>
//                   </CardFooter>
//                 </Card>
//
//                 <Alert variant="destructive" className="mt-4">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Danger Zone</AlertTitle>
//                   <AlertDescription>
//                     Deleting this assessment will permanently remove it from the course. This action cannot be undone.
//                   </AlertDescription>
//                   <div className="mt-4">
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => {
//                         toast({
//                           title: "Assessment Deleted",
//                           description: "The assessment has been deleted successfully",
//                         })
//                         router.push(`/courses/${courseId}`)
//                       }}
//                     >
//                       <Trash className="h-4 w-4 mr-2" />
//                       Delete Assessment
//                     </Button>
//                   </div>
//                 </Alert>
//               </div>
//             </div>
//           </form>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }
