
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, Loader2, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, type Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

interface StudentResult {
  id: string;
  studentId: string; 
  studentName: string; 
  subjectName: string;
  marks: string; 
  term: string;
  comments?: string;
  createdAt?: Timestamp;
}

interface StudentData {
  id: string; 
  studentName: string;
  gradeLevel?: string; 
}

export default function ParentGradesPage() {
  const [childName, setChildName] = useState<string>("Your Child"); 
  const [gradesData, setGradesData] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [overallAverage, setOverallAverage] = useState(0);
  const [pageMessage, setPageMessage] = useState<string | null>(null); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      setPageMessage(null);
      setGradesData([]);
      setOverallAverage(0);
      setChildName("Your Child"); // Reset to generic on auth change

      if (user && user.email) {
        try {
          const studentQuery = query(collection(db, "students"), where("parentEmail", "==", user.email));
          const studentSnapshot = await getDocs(studentQuery);
          
          if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            const studentData = { id: studentDoc.id, ...studentDoc.data() } as StudentData;
            setChildName(studentData.studentName || "Your Child");
            const fetchedChildId = studentData.id;

            if (fetchedChildId) {
              const resultsQuery = query(
                collection(db, "results"), 
                where("studentId", "==", fetchedChildId),
                orderBy("term", "desc"),
                orderBy("createdAt", "desc")
              );
              const resultsSnapshot = await getDocs(resultsQuery);
              const fetchedGrades: StudentResult[] = [];
              resultsSnapshot.forEach(doc => {
                fetchedGrades.push({ id: doc.id, ...doc.data() } as StudentResult);
              });
              setGradesData(fetchedGrades);

              if (fetchedGrades.length === 0) {
                setPageMessage("No grade records found for this student yet.");
              }

              let totalScore = 0;
              let count = 0;
              fetchedGrades.forEach(result => {
                const numericMark = parseFloat(result.marks.replace('%', ''));
                if (!isNaN(numericMark)) {
                  totalScore += numericMark;
                  count++;
                }
              });
              setOverallAverage(count > 0 ? totalScore / count : 0);

            } else {
              console.warn("ParentGradesPage: Student ID was unexpectedly missing after fetching student.");
              setPageMessage("Could not retrieve child's details. Please contact support.");
            }
          } else {
             setPageMessage(`No student record found linked to the email ${user.email}. Please ensure the student's profile has the correct parent email or contact the school administration.`);
          }
        } catch (error: any) {
          console.error("Error fetching student data or grades for parent: ", error);
          setPageMessage(`An error occurred while loading data: ${error.message || "Unknown error"}. Please try again later or contact support.`);
        }
      } else {
        setPageMessage("Please log in to view academic performance.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading grades...</p>
      </div>
    );
  }

  const mostRecentTerm = gradesData.length > 0 ? gradesData[0].term : "the current term";
  const pageHeaderDescription = currentUser ? `View ${childName}'s grades and scores.` : "View grades and scores.";

  return (
    <>
      <PageHeader 
        title="Academic Performance" 
        description={pageHeaderDescription}
      />

      {pageMessage && !loading && (
        <Alert variant={pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("could not") || pageMessage.toLowerCase().includes("no student record found") ? "destructive" : "default"} className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("no student record found") ? "Important Notice" : "Information"}</AlertTitle>
          <AlertDescription>{pageMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Award className="h-6 w-6 text-primary" />
            Overall Performance - {mostRecentTerm} (for {childName})
          </CardTitle>
        </CardHeader>
        <CardContent>
            {gradesData.length > 0 && overallAverage > 0 && !pageMessage?.toLowerCase().includes("error") ? (
              <>
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-primary">Overall Average Score</span>
                        <span className="text-sm font-medium text-primary">{overallAverage.toFixed(1)}%</span>
                    </div>
                    <Progress value={overallAverage} className="w-full h-3" />
                </div>
                <p className="text-sm text-muted-foreground">
                  This reflects an average score based on the subjects listed below with numerical marks.
                </p>
              </>
            ) : gradesData.length > 0 && overallAverage === 0 && !pageMessage?.toLowerCase().includes("error") ? (
               <p className="text-sm text-muted-foreground">
                No numerical marks available to calculate an overall average for this term.
              </p>
            ) : !pageMessage?.toLowerCase().includes("error") && gradesData.length === 0 ? (
                 pageMessage ? null : <p className="text-sm text-muted-foreground">No grade data available for {mostRecentTerm}.</p>
            ) : null}
            {pageMessage?.toLowerCase().includes("error") && gradesData.length === 0 && (
                 <p className="text-sm text-muted-foreground">Overall performance cannot be displayed due to an error.</p>
            )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Subject-wise Grades (for {childName})</CardTitle>
          <CardDescription>Detailed grades for various academic terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Marks/Grade</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData.length > 0 && !pageMessage?.toLowerCase().includes("error") ? gradesData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.term}</TableCell>
                    <TableCell className="font-medium">{record.subjectName}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">{record.marks}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.comments || 'N/A'}</TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                      {loading ? "Loading grades..." : (pageMessage && pageMessage.includes("No student record found")) ? "No student record linked to your account." : (pageMessage && pageMessage.includes("error")) ? "Could not load grades due to an error." : "No grade records available."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
