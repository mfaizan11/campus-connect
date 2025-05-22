
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, AlertTriangle, School } from 'lucide-react'; 
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, type Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AppLogo } from '@/components/layout/app-logo'; 

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

interface GroupedResults {
  [term: string]: StudentResult[];
}

interface ReportCardDisplayData {
  term: string;
  results: StudentResult[];
  overallAverage?: number;
}

export default function ParentReportsPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [reportCards, setReportCards] = useState<ReportCardDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      setPageMessage(null);
      setStudentData(null);
      setReportCards([]);

      if (user && user.email) {
        try {
          const studentQuery = query(collection(db, "students"), where("parentEmail", "==", user.email));
          const studentSnapshot = await getDocs(studentQuery);

          if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            const fetchedStudentData = { id: studentDoc.id, ...studentDoc.data() } as StudentData;
            setStudentData(fetchedStudentData);

            const resultsQuery = query(
              collection(db, "results"),
              where("studentId", "==", fetchedStudentData.id),
              orderBy("term", "desc"),
              orderBy("createdAt", "desc")
            );
            const resultsSnapshot = await getDocs(resultsQuery);
            const fetchedResults: StudentResult[] = [];
            resultsSnapshot.forEach(doc => {
              fetchedResults.push({ id: doc.id, ...doc.data() } as StudentResult);
            });

            if (fetchedResults.length === 0) {
              setPageMessage("No academic results found to generate report cards for this student yet.");
            } else {
              const groupedByTerm: GroupedResults = fetchedResults.reduce((acc, result) => {
                (acc[result.term] = acc[result.term] || []).push(result);
                return acc;
              }, {} as GroupedResults);

              const displayData: ReportCardDisplayData[] = Object.entries(groupedByTerm).map(([term, results]) => {
                let totalScore = 0;
                let count = 0;
                results.forEach(result => {
                  const numericMark = parseFloat(result.marks.replace('%', ''));
                  if (!isNaN(numericMark)) {
                    totalScore += numericMark;
                    count++;
                  }
                });
                return {
                  term,
                  results,
                  overallAverage: count > 0 ? parseFloat((totalScore / count).toFixed(1)) : undefined,
                };
              });
              setReportCards(displayData.sort((a,b) => b.term.localeCompare(a.term))); 
            }
          } else {
            setPageMessage(`No student record found linked to the email ${user.email}. Please ensure the student's profile has the correct parent email or contact the school administration.`);
          }
        } catch (error: any) {
          console.error("Error fetching data for reports page: ", error);
          setPageMessage(`An error occurred while loading report card data: ${error.message || "Unknown error"}. Please try again later or contact support.`);
        }
      } else {
        setPageMessage("Please log in to view report cards.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDownloadPdfReport = async (term: string) => {
    setIsDownloading(term);
    const reportCardElement = document.getElementById(`report-card-${term}`);
    if (!reportCardElement) {
      toast({
        title: "Download Error",
        description: `Could not find the report card section for term: ${term}.`,
        variant: "destructive",
      });
      setIsDownloading(null);
      return;
    }
    
    const buttons = reportCardElement.querySelectorAll('button.print-hide-this');
    buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

    try {
      const canvas = await html2canvas(reportCardElement, {
        scale: 2,
        useCORS: true,
        onclone: (document) => {
          const clonedElement = document.getElementById(`report-card-${term}`);
          if(clonedElement) {
            clonedElement.style.backgroundColor = window.getComputedStyle(reportCardElement).backgroundColor || 'white';
            clonedElement.style.border = 'none'; // Remove card border for PDF
            const childrenWithBg = clonedElement.querySelectorAll('*');
            childrenWithBg.forEach(child => {
                const el = child as HTMLElement;
                const computedStyle = window.getComputedStyle(el);
                el.style.backgroundColor = computedStyle.backgroundColor;
                el.style.color = computedStyle.color;
            });
          }
        }
      });
      
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
      });

      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let position = 0;
      let heightLeft = pdfHeight;

      if (pdfHeight < pdf.internal.pageSize.getHeight()) {
         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
          position -= pdf.internal.pageSize.getHeight();
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }
      
      pdf.save(`Report-Card-${studentData?.studentName?.replace(/\s+/g, '_') || 'Student'}-${term.replace(/\s+/g, '_')}.pdf`);
      toast({
        title: "Download Started",
        description: `Report card for ${term} is downloading.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Error",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');
    } finally {
      setIsDownloading(null);
    }
  };
  
  const pageHeaderDescription = currentUser && studentData?.studentName ? `View and download ${studentData.studentName}'s report cards.` : "View and download report cards.";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading report cards...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Student Report Cards"
        description={pageHeaderDescription}
        className="print:hidden"
      />

      {pageMessage && !loading && (
        <Alert variant={pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("no student record found") ? "destructive" : "default"} className="mb-6 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <CardTitle className="text-sm font-semibold">{pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("no student record found") ? "Important Notice" : "Information"}</CardTitle>
          <AlertDescription className="text-xs">{pageMessage}</AlertDescription>
        </Alert>
      )}

      {reportCards.length > 0 && studentData && (
        <div className="space-y-8">
          {reportCards.map((report) => (
            <Card key={report.term} className="shadow-lg">
              {/* This outer CardHeader is for the button on the webpage, not part of the PDF */}
              <CardHeader className="flex flex-row justify-between items-center print:hidden">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Report Card for {report.term}
                  </CardTitle>
                  <CardDescription>
                    Student: {studentData.studentName}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadPdfReport(report.term)} 
                  className="print-hide-this" // Class to hide this button in PDF
                  disabled={isDownloading === report.term}
                >
                  {isDownloading === report.term ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading === report.term ? 'Downloading...' : 'Download PDF Report'}
                </Button>
              </CardHeader>
              
              {/* This is the section that will be captured for PDF */}
              <div id={`report-card-${report.term}`} className="report-card-printable-area p-6 md:p-8 bg-card text-card-foreground rounded-lg border border-border">
                {/* Report Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <AppLogo />
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <h2 className="text-2xl font-bold text-primary">ACADEMIC REPORT CARD</h2>
                    <p className="text-sm text-muted-foreground">CampusConnect Academy</p>
                    <p className="text-xs text-muted-foreground">123 Education Lane, Knowledge City</p>
                  </div>
                </div>

                {/* Student Information */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p><strong className="font-medium text-foreground">Student Name:</strong> {studentData.studentName}</p>
                    <p><strong className="font-medium text-foreground">Grade Level:</strong> {studentData.gradeLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong className="font-medium text-foreground">Term:</strong> {report.term}</p>
                    <p><strong className="font-medium text-foreground">Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Academic Performance Table */}
                <h3 className="text-lg font-semibold text-foreground mb-3">Academic Performance</h3>
                <Table className="mb-6 border">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[40%] font-semibold">Subject</TableHead>
                      <TableHead className="text-center w-[20%] font-semibold">Marks/Grade</TableHead>
                      <TableHead className="font-semibold">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.results.map((result) => (
                      <TableRow key={result.id} className="border-b">
                        <TableCell className="font-medium py-3">{result.subjectName}</TableCell>
                        <TableCell className="text-center font-semibold text-primary py-3">{result.marks}</TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3">{result.comments || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                    {report.results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-10">No subject results recorded for this term.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Summary Section */}
                {report.overallAverage !== undefined && (
                  <div className="mb-6 p-4 border rounded-md bg-muted/30">
                    <h4 className="font-semibold text-md text-foreground mb-1">Term Summary</h4>
                    <p className="text-sm"><strong className="font-medium">Overall Average:</strong> <span className="font-bold text-primary text-lg">{report.overallAverage}%</span></p>
                    {/* Placeholder for overall comments or remarks */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Overall remarks: Keep up the excellent effort! Consistent hard work leads to great achievements.
                    </p>
                  </div>
                )}

                {/* Footer / Signatures (Placeholders) */}
                <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="mb-8">_________________________</p>
                      <p>Class Teacher's Signature</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-8">_________________________</p>
                      <p>Principal's Signature</p>
                    </div>
                  </div>
                   <p className="text-center mt-8 text-muted-foreground">
                    This report card was generated on {new Date().toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {!loading && reportCards.length === 0 && !pageMessage && (
         <Card className="shadow-lg print:hidden">
            <CardContent className="py-10 text-center">
               <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No report card data available for {studentData?.studentName || 'this student'} at this time.</p>
            </CardContent>
          </Card>
      )}
    </>
  );
}
