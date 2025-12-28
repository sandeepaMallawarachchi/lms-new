"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
        >
          <div
            className={`flex aspect-square ${isCollapsed ? "size-10" : "size-8"} items-center justify-center rounded-lg bg-blue-600 text-white transition-all`}
          >
            <GraduationCap className={isCollapsed ? "size-5" : "size-4"} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {isCollapsed ? (
              <span className="truncate font-semibold">Rashin</span>
            ) : (
              <>
                <span className="truncate font-semibold">
                  <span className="text-blue-600">Rashin</span>
                  <span className="text-green-600">한국 말누리 센터</span>
                </span>
                <span className="truncate text-xs">RashinHanguk Malnuri center</span>
              </>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
