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
// import { Plus, Trash } from "lucide-react"
// import { courses } from "../../../../../data/courses"
// import Link from "next/link"
//
// export default function NewQuestionnairePage({
//   params,
// }: {
//   params: { id: string }
// }) {
//   const courseId = Number.parseInt(params.id)
//   const course = courses.find((c) => c.id === courseId)
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
//                   <BreadcrumbPage>Add Assessment</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold">Add Course Assessment</h1>
//           </div>
//
//           <Card>
//             <CardHeader>
//               <CardTitle>Assessment Details</CardTitle>
//               <CardDescription>Create an assessment for {course.name}.</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Assessment Title</Label>
//                 <Input id="title" placeholder="Enter assessment title" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea id="description" placeholder="Enter assessment description" rows={2} />
//               </div>
//
//               <div className="pt-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-medium">Questions</h3>
//                   <Button size="sm">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Question
//                   </Button>
//                 </div>
//
//                 <div className="space-y-6">
//                   {/* Sample Question 1 */}
//                   <Card>
//                     <CardHeader className="pb-2">
//                       <div className="flex justify-between">
//                         <CardTitle className="text-base">Question 1</CardTitle>
//                         <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
//                           <Trash className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="q1-text">Question Text</Label>
//                         <Textarea id="q1-text" placeholder="Enter question text" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="q1-type">Question Type</Label>
//                         <Select defaultValue="multiple-choice">
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select question type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
//                             <SelectItem value="true-false">True/False</SelectItem>
//                             <SelectItem value="open-ended">Open Ended</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//
//                       <div className="space-y-2">
//                         <Label>Options</Label>
//                         <div className="space-y-2">
//                           <div className="flex gap-2">
//                             <RadioGroup defaultValue="0" className="flex items-center">
//                               <RadioGroupItem value="0" id="q1-option1-correct" />
//                             </RadioGroup>
//                             <Input id="q1-option1" placeholder="Option 1" className="flex-1" />
//                             <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive">
//                               <Trash className="h-4 w-4" />
//                             </Button>
//                           </div>
//                           <div className="flex gap-2">
//                             <RadioGroup defaultValue="0" className="flex items-center">
//                               <RadioGroupItem value="1" id="q1-option2-correct" />
//                             </RadioGroup>
//                             <Input id="q1-option2" placeholder="Option 2" className="flex-1" />
//                             <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive">
//                               <Trash className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                         <Button variant="outline" size="sm" className="mt-2">
//                           <Plus className="h-4 w-4 mr-2" />
//                           Add Option
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//
//                   {/* Sample Question 2 */}
//                   <Card>
//                     <CardHeader className="pb-2">
//                       <div className="flex justify-between">
//                         <CardTitle className="text-base">Question 2</CardTitle>
//                         <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
//                           <Trash className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="q2-text">Question Text</Label>
//                         <Textarea id="q2-text" placeholder="Enter question text" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="q2-type">Question Type</Label>
//                         <Select defaultValue="true-false">
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select question type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
//                             <SelectItem value="true-false">True/False</SelectItem>
//                             <SelectItem value="open-ended">Open Ended</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//
//                       <div className="space-y-2">
//                         <Label>Correct Answer</Label>
//                         <RadioGroup defaultValue="true">
//                           <div className="flex items-center space-x-2">
//                             <RadioGroupItem value="true" id="q2-true" />
//                             <Label htmlFor="q2-true">True</Label>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <RadioGroupItem value="false" id="q2-false" />
//                             <Label htmlFor="q2-false">False</Label>
//                           </div>
//                         </RadioGroup>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex justify-end gap-2">
//               <Button variant="outline" asChild>
//                 <Link href={`/courses/${course.id}`}>Cancel</Link>
//               </Button>
//               <Button>Save Assessment</Button>
//             </CardFooter>
//           </Card>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }
