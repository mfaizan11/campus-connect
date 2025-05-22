
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

// Placeholder data for a weekly schedule
const scheduleDataPlaceholder = {
  Monday: [
    { time: '09:00 - 09:50', subject: 'Mathematics', teacher: 'Mr. Green', room: 'Room 101' },
    { time: '10:00 - 10:50', subject: 'Science', teacher: 'Ms. Chen', room: 'Lab A' },
  ],
  Tuesday: [
    { time: '09:00 - 09:50', subject: 'Art', teacher: 'Ms. Lee', room: 'Art Studio' },
  ],
  // ... other days can be added
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ParentSchedulePage() {
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
            // TODO: Fetch actual schedule data for this student's class/grade
          } else {
            setChildName("your child (record not found)");
          }
        } catch (error) {
          console.error("Error fetching student name for schedule page: ", error);
          setChildName("your child (error loading name)");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Class Schedule" 
        description={currentUser && childName ? `View ${childName}'s weekly class timetable.` : "View weekly class timetable."}
      />
      <div className="space-y-8">
        {daysOfWeek.map((day) => {
          const daySchedule = scheduleDataPlaceholder[day as keyof typeof scheduleDataPlaceholder] || [];
          return (
            <Card key={day} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-6 w-6 text-primary" />
                  {day}'s Schedule (Placeholder for {childName || 'your child'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Room</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {daySchedule.map((session, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{session.time}</TableCell>
                            <TableCell>{session.subject}</TableCell>
                            <TableCell className="text-muted-foreground">{session.teacher || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground">{session.room}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No classes scheduled for {day} or data not available. (Placeholder)</p>
                )}
              </CardContent>
            </Card>
          );
        })}
         {Object.keys(scheduleDataPlaceholder).length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-10 text-center">
               <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Class schedule is not available at this time. (Placeholder)</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
