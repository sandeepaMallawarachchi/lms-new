"use client"

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GraduationCap } from "lucide-react"

interface LMSHeaderProps {
  showBackButton?: boolean
  backUrl?: string
  backLabel?: string
}

export function LMSHeader({ 
  showBackButton = false,
  backUrl = "/dashboard",
  backLabel = "Back to Dashboard"
}: LMSHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-6" />
        <Link href="/" className="flex items-center gap-2 transition-colors hover:text-foreground/80">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-blue-600">Rashin</span>
            <span className="text-green-600">한국 말누리 센터</span>
          </span>
        </Link>
      </div>
      
      {showBackButton && (
        <Button variant="outline" size="sm" asChild>
          <Link href={backUrl}>{backLabel}</Link>
        </Button>
      )}
    </header>
  )
} 