
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

interface Student {
  id: string;
  studentName: string;
  studentId: string; // The student's own ID number, not Firestore doc ID
}

const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'] as const;
type AttendanceStatus = typeof attendanceStatuses[number];

export default function NewAttendanceRecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  const [selectedStudentDocId, setSelectedStudentDocId] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState(''); // For denormalization

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
    fetchStudents();
  }, [toast]);

  const handleStudentSelectChange = (studentDocId: string) => {
    const student = students.find(s => s.id === studentDocId);
    if (student) {
      setSelectedStudentDocId(student.id); // Store Firestore document ID
      setSelectedStudentName(student.studentName);
    } else {
      setSelectedStudentDocId('');
      setSelectedStudentName('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!selectedStudentDocId || !formData.get('date') || !formData.get('status')) {
      toast({
        title: "Validation Error",
        description: "Please select a student, date, and status.",
        variant: "destructive",
      });
      return;
    }

    const attendanceData = {
      studentId: selectedStudentDocId, // This is the Firestore document ID of the student
      studentName: selectedStudentName, // Denormalized for easier display
      date: formData.get('date') as string,
      status: formData.get('status') as AttendanceStatus,
      subject: formData.get('subject') as string || null,
      reason: formData.get('reason') as string || null,
      createdAt: serverTimestamp(),
      // markedBy: adminUser.id // In a real app, store who marked attendance
    };

    try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "attendanceRecords"), attendanceData);
      toast({
        title: "Attendance Record Added",
        description: `Attendance for ${selectedStudentName} on ${attendanceData.date} has been successfully recorded.`,
      });
      router.push('/admin/attendance');
    } catch (error) {
      console.error("Error adding attendance record: ", error);
      let errorMessage = "Failed to add record. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Add New Attendance Record"
        description="Log attendance for a student for a specific date."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/attendance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attendance Log
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Attendance Record Form</CardTitle>
          <CardDescription>
            Select student, date, status, and other optional details. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" required />
            </div>
             <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select attendance status" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input id="subject" name="subject" placeholder="e.g., Mathematics" />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Absence/Lateness (Optional)</Label>
              <Textarea id="reason" name="reason" placeholder="e.g., Doctor's appointment" rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loadingStudents || students.length === 0}>Save Record</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
