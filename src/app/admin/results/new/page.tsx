
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Student {
  id: string; 
  studentName: string;
  studentId: string; 
}

interface Subject {
  id: string; 
  subjectName: string;
  subjectCode?: string; 
}

interface SubjectResultEntry {
  subjectName: string;
  marks: string;
  comments?: string;
}

export default function NewResultPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudentDocId, setSelectedStudentDocId] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  
  const [term, setTerm] = useState('');
  
  // State for current subject entry
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentMarks, setCurrentMarks] = useState('');
  const [currentComments, setCurrentComments] = useState('');

  // State for list of results to be saved
  const [resultsToSave, setResultsToSave] = useState<SubjectResultEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const q = query(collection(db, "students"), orderBy("studentName"));
        const querySnapshot = await getDocs(q);
        const studentsData: Student[] = [];
        querySnapshot.forEach((doc) => {
          studentsData.push({ ...doc.data(), id: doc.id } as Student);
        });
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students: ", error);
        toast({
          title: "Error",
          description: "Could not fetch students list. " + (error instanceof Error ? error.message : ''),
          variant: "destructive",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const q = query(collection(db, "subjects"), orderBy("subjectName"));
        const querySnapshot = await getDocs(q);
        const subjectsData: Subject[] = [];
        querySnapshot.forEach((doc) => {
          subjectsData.push({ ...doc.data(), id: doc.id } as Subject);
        });
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching subjects: ", error);
        toast({
          title: "Error",
          description: "Could not fetch subjects list. " + (error instanceof Error ? error.message : ''),
          variant: "destructive",
        });
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchStudents();
    fetchSubjects();
  }, [toast]);

  const handleStudentSelectChange = (studentDocId: string) => {
    const student = students.find(s => s.id === studentDocId);
    if (student) {
      setSelectedStudentDocId(student.id); 
      setSelectedStudentName(student.studentName);
    } else {
      setSelectedStudentDocId('');
      setSelectedStudentName('');
    }
  };

  const handleAddResultToList = () => {
    if (!currentSubject || !currentMarks) {
      toast({
        title: "Missing Information",
        description: "Please select a subject and enter marks/grade.",
        variant: "destructive",
      });
      return;
    }
    setResultsToSave(prev => [...prev, { subjectName: currentSubject, marks: currentMarks, comments: currentComments }]);
    // Reset current entry fields
    setCurrentSubject('');
    setCurrentMarks('');
    setCurrentComments('');
  };

  const handleRemoveResultFromList = (indexToRemove: number) => {
    setResultsToSave(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveAllResults = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!selectedStudentDocId || !term || resultsToSave.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a student, enter a term, and add at least one subject result.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!db) {
      toast({ title: "Error", description: "Firestore database is not initialized.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const savePromises = resultsToSave.map(resultItem => {
      const resultData = {
        studentId: selectedStudentDocId, 
        studentName: selectedStudentName,
        subjectName: resultItem.subjectName,
        marks: resultItem.marks,
        comments: resultItem.comments || '',
        term: term,
        createdAt: serverTimestamp(),
      };
      return addDoc(collection(db, "results"), resultData);
    });

    try {
      await Promise.all(savePromises);
      toast({
        title: "Results Saved",
        description: `All ${resultsToSave.length} results for ${selectedStudentName} in ${term} have been successfully added.`,
      });
      // Reset form
      setSelectedStudentDocId('');
      setSelectedStudentName('');
      setTerm('');
      setResultsToSave([]);
      setCurrentSubject('');
      setCurrentMarks('');
      setCurrentComments('');
      router.push('/admin/results');
    } catch (error) {
      console.error("Error adding results: ", error);
      let errorMessage = "Failed to add one or more results. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error Saving Results",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loadingStudents || loadingSubjects;
  const isSaveDisabled = isLoading || students.length === 0 || subjects.length === 0 || resultsToSave.length === 0 || !selectedStudentDocId || !term || isSubmitting;

  return (
    <>
      <PageHeader
        title="Add New Student Results by Term"
        description="Select a student, term, then add multiple subject results before saving."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/results">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results List
            </Link>
          </Button>
        }
      />
      <form onSubmit={handleSaveAllResults}>
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Student and Term Information</CardTitle>
            <CardDescription>Select the student and specify the academic term.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="studentSelect">Select Student *</Label>
              {loadingStudents ? (
                <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading students...</div>
              ) : (
                <Select 
                  name="studentSelect" 
                  onValueChange={handleStudentSelectChange}
                  required 
                  value={selectedStudentDocId}
                  disabled={students.length === 0}
                >
                  <SelectTrigger id="studentSelect">
                    <SelectValue placeholder={students.length === 0 ? "No students available" : "Select a student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.length > 0 ? students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.studentName} (ID: {student.studentId})
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-students" disabled>No students found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="term">Term / Session *</Label>
              <Input id="term" name="term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g., Term 1 - 2024" required />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Add Subject Result</CardTitle>
            <CardDescription>Enter details for one subject and add it to the list below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subjectSelectEntry">Select Subject *</Label>
              {loadingSubjects ? (
                <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading subjects...</div>
              ) : (
                <Select 
                  name="subjectSelectEntry" 
                  onValueChange={setCurrentSubject}
                  value={currentSubject}
                  disabled={subjects.length === 0}
                >
                  <SelectTrigger id="subjectSelectEntry">
                    <SelectValue placeholder={subjects.length === 0 ? "No subjects available" : "Select a subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length > 0 ? subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.subjectName}>
                        {subject.subjectName} {subject.subjectCode ? `(${subject.subjectCode})` : ''}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-subjects" disabled>No subjects found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="currentMarks">Marks / Grade *</Label>
              <Input id="currentMarks" name="currentMarks" value={currentMarks} onChange={(e) => setCurrentMarks(e.target.value)} placeholder="e.g., A+ or 92%" />
            </div>
            <div>
              <Label htmlFor="currentComments">Subject Specific Comments (Optional)</Label>
              <Textarea id="currentComments" name="currentComments" value={currentComments} onChange={(e) => setCurrentComments(e.target.value)} placeholder="e.g., Excellent performance in this subject." rows={2}/>
            </div>
            <Button type="button" variant="outline" onClick={handleAddResultToList} disabled={isLoading || subjects.length === 0 || !currentSubject || !currentMarks}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Subject to List
            </Button>
          </CardContent>
        </Card>

        {resultsToSave.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Results to be Saved ({resultsToSave.length})</CardTitle>
              <CardDescription>Review the results before final submission for {selectedStudentName || "selected student"} - {term || "current term"}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks/Grade</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultsToSave.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.subjectName}</TableCell>
                      <TableCell>{result.marks}</TableCell>
                      <TableCell>{result.comments || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveResultFromList(index)} aria-label="Remove result">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col items-end mt-6">
          <Button 
            type="submit" 
            disabled={isSaveDisabled}
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save All Listed Results'}
          </Button>
          {isSaveDisabled && !isSubmitting && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Please ensure a student is selected, term is entered, <br />
              and at least one subject result is added to the list above. <br/>
              Also, ensure students and subjects lists have loaded.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
