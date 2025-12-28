"use client"

import { AppSidebar } from "../../../../../../../components/app-sidebar"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, FileText, Download, Trash } from "lucide-react"
import { createChapter, getCourseById } from "../../../../../../../data/courses"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Chapter } from "../../../../../../../data/courses"
import { API_BASE_URL } from "@/data/api"
import { getToken } from "@/lib/auth"

export default function NewChapterPage({
  params,
}: {
  params: { id: string; moduleId: string }
}) {
  const router = useRouter()
  const courseId = Number.parseInt(params.id)
  const moduleId = Number.parseInt(params.moduleId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
        const moduleData = courseData.modules.find((m: any) => m.id === moduleId)
        if (!moduleData) {
          throw new Error("Module not found")
        }
        setModule(moduleData)
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
  }, [courseId, moduleId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  }

  const uploadDocuments = async (files: File[]) => {
    setUploading(true);
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const uploadedDocs = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API_BASE_URL}/files/upload`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to upload document');
        const data = await res.json();
        uploadedDocs.push({
          name: file.name,
          url: data.url,
          type: file.type,
          size: file.size,
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: `Failed to upload document: ${file.name}`,
          variant: 'destructive',
        });
        setUploading(false);
        throw err;
      }
    }
    setUploading(false);
    return uploadedDocs;
  };

  const handleUploadSelected = async () => {
    if (selectedFiles.length === 0) return;
    try {
      const docs = await uploadDocuments(selectedFiles);
      setUploadedDocuments(prev => [...prev, ...docs]);
      setSelectedFiles([]);
    } catch (err) {
      // error toast already shown in uploadDocuments
    }
  };

  const handleRemoveUploadedDocument = (idx: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const chapterData: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      orderIndex: Number(formData.get("order")),
      content: formData.get("content") as string,
      youtubeLink: formData.get("youtubeLink") as string,
      free: formData.get("free") === "on",
      videoContent: !!formData.get("youtubeLink"),
    }

    // Upload documents if selected
    if (uploadedDocuments.length > 0) {
      chapterData.documents = uploadedDocuments;
    }

    try {
      await createChapter(moduleId, chapterData)
      toast({
        title: "Success",
        description: "Chapter created successfully",
      })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error creating chapter:", error)
      toast({
        title: "Error",
        description: "Failed to create chapter",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!course || !module) {
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
                  <BreadcrumbPage>Add New Chapter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Add New Chapter</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
                <CardDescription>Create a new chapter for the {module.title} module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input id="title" name="title" placeholder="Enter chapter title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter chapter description" rows={2} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="Enter chapter order"
                    defaultValue={module.chapters.length + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" placeholder="Enter chapter content" rows={8} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeLink">YouTube Link (Optional)</Label>
                  <Input id="youtubeLink" name="youtubeLink" placeholder="e.g., https://www.youtube.com/watch?v=..." />
                  <p className="text-sm text-muted-foreground">Add a YouTube video link for this chapter.</p>
                </div>
                <div className="space-y-2">
                  <Label>Documents</Label>
                  {uploadedDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, idx) => (
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
                            <Button variant="outline" size="sm" className="text-destructive" type="button" onClick={() => handleRemoveUploadedDocument(idx)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No documents uploaded yet.</div>
                  )}
                  <div className="mt-4">
                    <Input id="document" name="document" type="file" className="hidden" accept=".pdf,.docx,.pptx,.xlsx" multiple onChange={handleFileChange} />
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => document.getElementById("document")?.click()}
                      disabled={uploading || isSubmitting}
                    >
                      {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Add Document(s)"}
                      {uploading && <span className="ml-2">Uploading...</span>}
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        type="button"
                        className="ml-2"
                        onClick={handleUploadSelected}
                        disabled={uploading || isSubmitting}
                      >
                        Upload Selected
                      </Button>
                    )}
                    {selectedFiles.length > 0 && (
                      <ul className="mt-2 text-xs text-muted-foreground">
                        {selectedFiles.map(file => (
                          <li key={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="free" name="free" />
                  <Label htmlFor="free">Make this chapter free</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Chapter"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
