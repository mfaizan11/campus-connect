
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

// Placeholder data - actual data would be fetched based on child's ID
const remarksDataPlaceholder = [
  { 
    teacherName: 'Mr. Samuel Green', 
    teacherAvatar: 'https://placehold.co/100x100.png?text=SG',
    subject: 'Mathematics', 
    date: '2024-05-10', 
    remark: "Alex shows strong problem-solving skills in Mathematics. Consistently completes homework and participates actively in class discussions. Keep up the great work!",
    teacherInitials: 'SG',
    imageHint: 'teacher headshot'
  },
  { 
    teacherName: 'Ms. Olivia Chen', 
    teacherAvatar: 'https://placehold.co/100x100.png?text=OC',
    subject: 'Science', 
    date: '2024-05-08', 
    remark: "Shows a keen interest in scientific experiments and asks insightful questions. Could focus a bit more on documenting lab findings meticulously. Overall, a good performance.",
    teacherInitials: 'OC',
    imageHint: 'educator photo'
  },
];

export default function ParentRemarksPage() {
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
            // TODO: Fetch actual remarks data for this student
          } else {
            setChildName("your child (record not found)");
          }
        } catch (error) {
          console.error("Error fetching student name for remarks page: ", error);
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
        <p className="ml-2 text-muted-foreground">Loading remarks...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Teacher Remarks" 
        description={currentUser && childName ? `Feedback for ${childName} from educators.` : "Feedback from educators."}
      />
      <div className="space-y-6">
        {remarksDataPlaceholder.length > 0 ? remarksDataPlaceholder.map((entry, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <Avatar>
                  <AvatarImage src={entry.teacherAvatar} alt={entry.teacherName} data-ai-hint={entry.imageHint} />
                  <AvatarFallback>{entry.teacherInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{entry.teacherName}</CardTitle>
                  <CardDescription>
                    {entry.subject} Teacher - Remark on {new Date(entry.date).toLocaleDateString()} (Placeholder)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">{entry.remark}</p>
            </CardContent>
          </Card>
        )) : (
          <Card className="shadow-lg">
            <CardContent className="py-10 text-center">
               <MessageSquareText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No remarks available at this time. (Placeholder)</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
