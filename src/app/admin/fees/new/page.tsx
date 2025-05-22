
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react';
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

const feeStatuses = ['Pending', 'Paid', 'Overdue', 'Partially Paid'] as const;
type FeeStatus = typeof feeStatuses[number];

export default function NewFeeRecordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const feeTitle = formData.get('feeTitle') as string;
    const amountDueStr = formData.get('amountDue') as string;
    const dueDate = formData.get('dueDate') as string;
    const status = formData.get('status') as FeeStatus;

    if (!selectedStudentDocId || !feeTitle || !amountDueStr || !dueDate || !status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Student, Fee Title, Amount Due, Due Date, and Status.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const amountDue = parseFloat(amountDueStr);
    if (isNaN(amountDue) || amountDue <= 0) {
        toast({
            title: "Validation Error",
            description: "Amount Due must be a positive number.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    const feeRecordData = {
      studentId: selectedStudentDocId,
      studentName: selectedStudentName,
      feeTitle: feeTitle,
      amountDue: amountDue,
      dueDate: dueDate,
      status: status,
      amountPaid: status === 'Paid' ? amountDue : 0, // If status is 'Paid', assume full amount is paid
      paymentDate: status === 'Paid' ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
    };

    try {
      if (!db) throw new Error("Firestore database is not initialized.");
      await addDoc(collection(db, "fees"), feeRecordData);
      toast({
        title: "Fee Record Added",
        description: `Fee record for ${selectedStudentName} has been successfully added.`,
      });
      router.push('/admin/fees');
    } catch (error) {
      console.error("Error adding fee record: ", error);
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to add record."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add New Fee Record"
        description="Create a new fee entry for a student."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/fees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Fee Records
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            New Fee Record Form
          </CardTitle>
          <CardDescription>
            Select student, enter fee details, and set the initial status. Fields marked with * are required.
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
              <Label htmlFor="feeTitle">Fee Title *</Label>
              <Input id="feeTitle" name="feeTitle" placeholder="e.g., Term 1 Tuition Fee" required />
            </div>
            <div>
              <Label htmlFor="amountDue">Amount Due (Rs.) *</Label>
              <Input id="amountDue" name="amountDue" type="number" placeholder="e.g., 12000.00" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="status">Initial Status *</Label>
              <Select name="status" required defaultValue="Pending">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select fee status" />
                </SelectTrigger>
                <SelectContent>
                  {feeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loadingStudents || students.length === 0 || isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Fee Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
