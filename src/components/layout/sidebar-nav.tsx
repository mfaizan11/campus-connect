
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
  tooltip?: string
  subItems?: NavItem[] // For nested navigation, if needed in future
}

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  if (!items?.length) {
    return null
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')

        return (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.tooltip || item.label}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
            {/* Add sub-item rendering here if item.subItems exists */}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
