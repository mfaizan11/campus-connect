
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { CheckSquare, ClipboardCheck, MessageCircle, FileText, Bell, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, type DocumentData } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

interface StudentData {
  id: string;
  studentName: string;
  gradeLevel: string;
  studentId?: string;
  // Add other fields from your student document as needed
}

interface ParentDashboardState {
  childData: {
    name: string;
    grade: string;
    avatarUrl?: string;
    initials: string;
    recentGrade: string; // Placeholder
    attendance: string; // Placeholder
    lastRemark: string; // Placeholder
    upcomingEvent: string; // Placeholder
  } | null;
  loading: boolean;
  error: string | null;
  currentUser: FirebaseUser | null;
}

const initialChildData = {
  name: "Your Child",
  grade: "N/A",
  avatarUrl: "https://placehold.co/100x100.png",
  initials: "YC",
  recentGrade: "Awaiting data...",
  attendance: "Awaiting data...",
  lastRemark: "No recent remarks.",
  upcomingEvent: "Check school calendar."
};

export default function ParentDashboardPage() {
  const [state, setState] = useState<ParentDashboardState>({
    childData: null, // Start with null, populate after fetch
    loading: true,
    error: null,
    currentUser: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setState(prevState => ({ ...prevState, currentUser: user, loading: true }));
        try {
          const q = query(collection(db, "students"), where("parentEmail", "==", user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Assuming one child per parent email for simplicity in this dashboard
            const studentDoc = querySnapshot.docs[0];
            const student = { id: studentDoc.id, ...studentDoc.data() } as StudentData;
            
            const studentName = student.studentName || "Your Child";
            const initials = studentName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || "YC";

            setState(prevState => ({
              ...prevState,
              childData: {
                ...initialChildData, // Start with placeholders
                name: studentName,
                grade: student.gradeLevel || "N/A",
                initials: initials,
                avatarUrl: `https://placehold.co/100x100.png?text=${initials}`, // Dynamic placeholder
              },
              loading: false,
              error: null,
            }));
          } else {
            setState(prevState => ({ 
              ...prevState, 
              childData: initialChildData, // Fallback to default if no student found
              loading: false, 
              error: "No student record found linked to your email. Please contact the school administration." 
            }));
          }
        } catch (err) {
          console.error("Error fetching student data: ", err);
          setState(prevState => ({ 
            ...prevState, 
            childData: initialChildData,
            loading: false, 
            error: "Could not fetch student data." 
          }));
        }
      } else {
        setState({ 
          childData: initialChildData, 
          loading: false, 
          error: "Please log in to view the dashboard.", 
          currentUser: null 
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const { childData, loading, error, currentUser } = state;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  const displayChildName = childData?.name || "your child";

  return (
    <>
      <PageHeader 
        title="Parent Dashboard" 
        description={currentUser ? `Welcome! Here's an overview for ${displayChildName}.` : "Please log in."} 
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Bell className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentUser && childData && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow col-span-1 lg:col-span-1 flex flex-col items-center text-center p-6">
              <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                <AvatarImage src={childData.avatarUrl} alt={childData.name} data-ai-hint="student photo" />
                <AvatarFallback className="text-3xl">{childData.initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-foreground">{childData.name}</h2>
              <p className="text-muted-foreground">{childData.grade}</p>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Attendance</p>
                    <p className="text-muted-foreground">{childData.attendance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Recent Grade</p>
                    <p className="text-muted-foreground">{childData.recentGrade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Last Teacher Remark</p>
                    <p className="text-muted-foreground">{childData.lastRemark}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 shadow-sm bg-accent/30 border-accent">
            <Bell className="h-5 w-5 text-accent-foreground" />
            <AlertTitle className="text-accent-foreground font-semibold">Upcoming Event</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
              {childData.upcomingEvent}. <Link href="/parent/schedule" className="font-medium hover:underline">View full schedule</Link>
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "View Attendance", href: "/parent/attendance", icon: CheckSquare, description: "Detailed attendance records." },
              { title: "Check Grades", href: "/parent/grades", icon: ClipboardCheck, description: "Latest academic performance." },
              { title: "Teacher Remarks", href: "/parent/remarks", icon: MessageCircle, description: "Feedback from educators." },
              { title: "Report Cards", href: "/parent/reports", icon: FileText, description: "Official academic reports." },
            ].map(item => (
              <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={item.href}>Go to {item.title.split(' ')[1]}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
