
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/layout/app-logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarNav, type NavItem } from '@/components/layout/sidebar-nav';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  School,
  BookOpenText,
  Megaphone,
  Sparkles,
  Settings,
  UserCog,
  FileSignature,
  CalendarCheck,
  Globe, // Icon for Website Content
  DollarSign, // Icon for Fee Management
} from 'lucide-react';

const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/teachers', label: 'Teachers', icon: UsersRound },
  { href: '/admin/classes', label: 'Classes', icon: School },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpenText },
  { href: '/admin/results', label: 'Student Results', icon: FileSignature },
  { href: '/admin/fees', label: 'Fee Management', icon: DollarSign },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/admin/notices', label: 'Notices', icon: Megaphone },
  { href: '/admin/manage-parents', label: 'Manage Parents', icon: UserCog },
  { href: '/admin/website-content', label: 'Website Content', icon: Globe },
  { href: '/admin/learning-plan', label: 'Learning Plan AI', icon: Sparkles },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="h-full" collapsible="icon">
        <SidebarHeader className="p-4 justify-between items-center flex">
            <AppLogo />
            <SidebarTrigger className="md:hidden"/>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav items={adminNavItems} />
        </SidebarContent>
        <SidebarFooter className="p-2">
           {/* Example: Settings link in footer for admin */}
           <SidebarNav items={[{ href: '/admin/settings', label: 'Settings', icon: Settings }]} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
          {/* Mobile sidebar trigger can be moved here if needed */}
          {/* <SidebarTrigger className="md:hidden" /> */}
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
