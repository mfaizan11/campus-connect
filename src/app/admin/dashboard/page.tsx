
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpenText, Bell, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { db } from '@/lib/firebase/config';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';

// Chart data remains placeholder for now
const chartData = [
  { month: "January", students: 186, teachers: 80 },
  { month: "February", students: 305, teachers: 200 },
  { month: "March", students: 237, teachers: 120 },
  { month: "April", students: 273, teachers: 190 },
  { month: "May", students: 209, teachers: 130 },
  { month: "June", students: 214, teachers: 140 },
]

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  teachers: {
    label: "Teachers",
    color: "hsl(var(--chart-2))",
  },
}

interface DashboardCounts {
  students: number;
  teachers: number;
  classes: number;
  notices: number;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const studentQuery = query(collection(db, 'students'));
        const studentSnapshot = await getCountFromServer(studentQuery);

        const teacherQuery = query(collection(db, 'teachers'));
        const teacherSnapshot = await getCountFromServer(teacherQuery);

        const classQuery = query(collection(db, 'classes'));
        const classSnapshot = await getCountFromServer(classQuery);
        
        const noticeQuery = query(collection(db, 'notices'), where('status', '==', 'Published'));
        const noticeSnapshot = await getCountFromServer(noticeQuery);

        setCounts({
          students: studentSnapshot.data().count,
          teachers: teacherSnapshot.data().count,
          classes: classSnapshot.data().count,
          notices: noticeSnapshot.data().count,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally set an error state here to show in UI
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderCount = (countValue?: number) => {
    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
    if (countValue === undefined || countValue === null) return <span className="text-muted-foreground">N/A</span>;
    return countValue;
  };

  return (
    <>
      <PageHeader title="Admin Dashboard" description="Overview of school activities and statistics." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCount(counts?.students)}</div>
            {/* <p className="text-xs text-muted-foreground">+5.2% from last month</p> */}
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCount(counts?.teachers)}</div>
            {/* <p className="text-xs text-muted-foreground">+2 new this term</p> */}
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpenText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCount(counts?.classes)}</div>
            <p className="text-xs text-muted-foreground">Total classes registered</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Notices</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderCount(counts?.notices)}</div>
            <p className="text-xs text-muted-foreground">Total active notices</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Student Enrollment Overview (Placeholder)</CardTitle>
            <CardDescription>Monthly student and teacher counts. (Static example data)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="students" fill="var(--color-students)" radius={4} />
                  <Bar dataKey="teachers" fill="var(--color-teachers)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/students/new"><Users className="mr-2 h-4 w-4" /> Add New Student</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/teachers/new"><Users className="mr-2 h-4 w-4" /> Add New Teacher</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/notices/new"><Bell className="mr-2 h-4 w-4" /> Post a Notice</Link>
            </Button>
             <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/classes/new"><BookOpenText className="mr-2 h-4 w-4" /> Add New Class</Link>
            </Button>
             <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/subjects/new"><BookOpenText className="mr-2 h-4 w-4" /> Add New Subject</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
