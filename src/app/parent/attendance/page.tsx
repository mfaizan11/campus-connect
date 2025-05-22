
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

export default function ParentAttendancePage() {
  const [childName, setChildName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const q = query(collection(db, "students"), where("parentEmail", "==", user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0].data();
            setChildName(studentDoc.studentName || "your child");
          } else {
            setChildName("your child (record not found)");
          }
        } catch (error) {
          console.error("Error fetching student name for attendance page: ", error);
          setChildName("your child (error loading name)");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const pageHeaderDescription = currentUser && childName 
    ? `${childName}'s attendance records will be available here soon.` 
    : "Attendance records will be available here soon.";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Attendance Record" 
        description={pageHeaderDescription}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <CalendarCheck className="h-6 w-6 text-primary" />
            Attendance History for {childName || "Your Child"}
          </CardTitle>
           <CardDescription>
            This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon!</h2>
            <p className="text-muted-foreground">
              Detailed attendance records for {childName || "your child"} will be displayed here once the feature is live.
            </p>
            <p className="text-muted-foreground mt-1">
              Thank you for your patience.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
