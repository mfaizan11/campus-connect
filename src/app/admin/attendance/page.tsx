
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function AdminAttendancePage() {
  return (
    <>
      <PageHeader 
        title="Manage Attendance" 
        description="Student attendance records will be managed here."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Attendance Management
          </CardTitle>
          <CardDescription>
            This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon!</h2>
            <p className="text-muted-foreground">
              We are working hard to bring you a comprehensive attendance tracking system.
            </p>
            <p className="text-muted-foreground mt-1">
              You'll be able to view, add, and manage student attendance records from this section.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
