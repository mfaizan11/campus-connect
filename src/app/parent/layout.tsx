
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
  CheckSquare,
  ClipboardCheck,
  MessageCircle,
  FileText,
  CalendarDays,
  UserCircle,
  DollarSign, // Icon for Fees
} from 'lucide-react';

const parentNavItems: NavItem[] = [
  { href: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/parent/attendance', label: 'Attendance', icon: CheckSquare },
  { href: '/parent/grades', label: 'Grades', icon: ClipboardCheck },
  { href: '/parent/fees', label: 'My Fees', icon: DollarSign },
  { href: '/parent/remarks', label: 'Teacher Remarks', icon: MessageCircle },
  { href: '/parent/reports', label: 'Report Cards', icon: FileText },
  { href: '/parent/schedule', label: 'Class Schedule', icon: CalendarDays },
];

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="h-full print:hidden" collapsible="icon"> {/* Added print:hidden */}
        <SidebarHeader className="p-4 justify-between items-center flex">
          <AppLogo />
          <SidebarTrigger className="md:hidden"/>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav items={parentNavItems} />
        </SidebarContent>
         <SidebarFooter className="p-2">
           <SidebarNav items={[{ href: '/parent/profile', label: 'My Profile', icon: UserCircle }]} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 print:hidden"> {/* Added print:hidden */}
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
