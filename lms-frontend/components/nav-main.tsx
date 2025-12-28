"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export function NavMain({
  sections,
}: {
  sections: NavSection[]
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const pathname = usePathname()
  const router = useRouter()

  // Check if the current path matches the item or any of its subitems
  const isItemActive = (item: NavItem) => {
    if (pathname === item.url) return true
    if (item.items?.some(subItem => pathname === subItem.url)) return true
    return false
  }

  // Check if a specific subitem is active
  const isSubItemActive = (url: string) => pathname === url

  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.title}>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              const active = isItemActive(item)
              
              return (
                <div 
                  key={item.title} 
                  className="relative group"
                >
                  {isCollapsed ? (
                    // When collapsed, show a simple button with tooltip
                    <SidebarMenuItem>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link 
                              href={item.url}
                              className={`flex h-12 w-12 items-center justify-center rounded-md hover:bg-sidebar-accent ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                            >
                              {item.icon && <item.icon className="size-6" />}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            align="center" 
                            sideOffset={20}
                            className="w-48 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="font-medium border-b p-2">{item.title}</div>
                            {item.items && item.items.length > 0 && (
                              <div className="p-1">
                                {item.items.map((subItem) => {
                                  const subActive = isSubItemActive(subItem.url)
                                  return (
                                    <Link 
                                      key={subItem.title} 
                                      href={subItem.url}
                                      className={`block px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm ${subActive ? 'bg-accent text-accent-foreground font-medium' : ''}`}
                                    >
                                      {subItem.title}
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  ) : (
                    // When expanded, show the full collapsible menu
                    <Collapsible 
                      asChild 
                      defaultOpen={true}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            isActive={active}
                            onClick={() => {
                              // If no subitems, navigate directly
                              if (!item.items || item.items.length === 0) {
                                router.push(item.url);
                              }
                            }}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item.items && item.items.length > 0 && (
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => {
                              const subActive = isSubItemActive(subItem.url)
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={subActive}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )}
                </div>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
