"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"
import { AlertCircle } from "lucide-react"

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error?: string | null
  className?: string
}

export function LoginForm({
  onSubmit,
  isLoading,
  error,
  className,
  ...props
}: LoginFormProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'>) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    await onSubmit(email, password)
  }

  return (
    <div className="mx-auto max-w-sm space-y-8" {...props}>
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to <span className="text-blue-600">Rashin</span><span className="text-green-600">한국 말누리 센터</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                name="email"
                placeholder="Enter your username"
                required
                type="text"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/*<Link*/}
                {/*  href="#"*/}
                {/*  className="text-sm font-medium underline underline-offset-4"*/}
                {/*>*/}
                {/*  Forgot password?*/}
                {/*</Link>*/}
              </div>
              <Input
                id="password"
                name="password"
                required
                type="password"
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2">Signing In</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 