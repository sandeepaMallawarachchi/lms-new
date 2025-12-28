"use client"


import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
// import { getCourseById, updateChapter } from "../../../../../../../data/courses"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
// import { Chapter } from "../../../../../../../data/courses"
import { Switch } from "@/components/ui/switch"
import {AppSidebar} from "@/components/app-sidebar";
import {getCourseById, updateChapter, deleteChapter} from "@/data/courses";
import {Chapter} from "@/types/course";
import {AlertCircle, Download, FileText, FileUp, Trash} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox"
import { API_BASE_URL } from "@/data/api";
import { getToken } from "@/lib/auth";

export default function EditChapterPage({
  params,
}: {
  params: { id: string; moduleId: string; chapterId: string }
}) {
  const router = useRouter()
  const courseId = Number.parseInt(params.id)
  const moduleId = Number.parseInt(params.moduleId)
  const chapterId = Number.parseInt(params.chapterId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
        
        // Find the module in the course's modules
        const moduleData = courseData.modules.find((m: any) => m.id === moduleId)
        if (!moduleData) {
          throw new Error("Module not found")
        }
        setModule(moduleData)
        
        // Find the chapter in the module's chapters
        const chapterData = moduleData.chapters.find((c: Chapter) => c.id === chapterId)
        if (!chapterData) {
          throw new Error("Chapter not found")
        }
        setChapter(chapterData)
        if (chapterData) {
          setDocuments(chapterData.documents ? [...chapterData.documents] : [])
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: "Failed to fetch course data",
          variant: "destructive",
        })
      }
    }

    fetchCourse()
  }, [courseId, moduleId, chapterId])

  const handleRemoveDocument = (idx: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx))
  }

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files))
    }
  }

  const uploadDocuments = async (files: File[]) => {
    setUploading(true)
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const uploadedDocs = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch(`${API_BASE_URL}/files/upload`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to upload document')
        const data = await res.json()
        uploadedDocs.push({
          name: file.name,
          url: data.url,
          type: file.type,
          size: file.size,
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: `Failed to upload document: ${file.name}`,
          variant: 'destructive',
        })
        setUploading(false)
        throw err
      }
    }
    setUploading(false)
    return uploadedDocs
  }

  const handleAddNewFiles = async () => {
    if (newFiles.length === 0) return
    try {
      const uploaded = await uploadDocuments(newFiles)
      setDocuments(prev => [...prev, ...uploaded])
      setNewFiles([])
    } catch (err) {
      // error toast already shown in uploadDocuments
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const chapterData: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      orderIndex: Number(formData.get("order")),
      free: formData.get("isFree") === "on",
      isVideoContent: !!formData.get("youtubeLink"),
      content: formData.get("content") as string,
      youtubeLink: formData.get("youtubeLink") as string,
      documents: documents,
    }

    try {
      await updateChapter(moduleId, chapterId, chapterData)
      toast({
        title: "Success",
        description: "Chapter updated successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error updating chapter:", error)
      toast({
        title: "Error",
        description: "Failed to update chapter",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      return
    }

    try {
      await deleteChapter(moduleId, chapterId)
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error deleting chapter:", error)
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      })
    }
  }

  if (!course || !module || !chapter) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>Rashin한국 말누리 센터</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Course Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/courses/${course.id}`}>{course.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/courses/${course.id}/modules/${module.id}/edit`}>
                    {module.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Chapter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Chapter</h1>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Chapter
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
                <CardDescription>Edit the chapter details for the {module.title} module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter chapter title" 
                    defaultValue={chapter.title}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Enter chapter description" 
                    rows={2} 
                    defaultValue={chapter.description}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="Enter chapter order"
                    defaultValue={chapter.orderIndex}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="Enter chapter content" 
                    rows={4} 
                    defaultValue={chapter.content}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeLink">YouTube Link</Label>
                  <Input 
                    id="youtubeLink" 
                    name="youtubeLink" 
                    placeholder="Enter YouTube video link" 
                    defaultValue={chapter.youtubeLink}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Documents</Label>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <div key={doc.url || doc.name || idx} className="border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.url} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive" type="button" onClick={() => handleRemoveDocument(idx)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No documents uploaded for this chapter.</div>
                  )}
                  <div className="mt-4">
                    <Input id="new-documents" type="file" multiple className="hidden" accept=".pdf,.docx,.pptx,.xlsx" onChange={handleNewFileChange} />
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => document.getElementById("new-documents")?.click()}
                      disabled={uploading || isSubmitting}
                    >
                      {newFiles.length > 0 ? `${newFiles.length} file(s) selected` : "Add Document(s)"}
                      {uploading && <span className="ml-2">Uploading...</span>}
                    </Button>
                    {newFiles.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        type="button"
                        className="ml-2"
                        onClick={handleAddNewFiles}
                        disabled={uploading || isSubmitting}
                      >
                        Upload Selected
                      </Button>
                    )}
                    {newFiles.length > 0 && (
                      <ul className="mt-2 text-xs text-muted-foreground">
                        {newFiles.map(file => (
                          <li key={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isFree" 
                    name="isFree" 
                    defaultChecked={chapter.free}
                  />
                  <Label htmlFor="isFree">Free Chapter</Label>
                </div>
                {/*<div className="flex items-center space-x-2">*/}
                {/*  <Switch */}
                {/*    id="isVideoContent" */}
                {/*    name="isVideoContent" */}
                {/*    defaultChecked={chapter.isVideoContent}*/}
                {/*  />*/}
                {/*  <Label htmlFor="isVideoContent">Video Content</Label>*/}
                {/*</div>*/}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${course.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

          </form>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              Deleting this chapter will permanently remove it from the module. This action cannot be undone.
            </AlertDescription>
            <div className="mt-4">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Chapter
              </Button>
            </div>
          </Alert>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
