
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config'; // Import Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const studentData = {
      studentName: formData.get('studentName') as string,
      studentId: formData.get('studentId') as string,
      gradeLevel: formData.get('gradeLevel') as string,
      dateOfBirth: formData.get('dateOfBirth') as string, 
      parentName: formData.get('parentName') as string,
      parentEmail: formData.get('parentEmail') as string,
      createdAt: serverTimestamp(), 
    };

    if (!studentData.studentName || !studentData.studentId || !studentData.gradeLevel) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Full Name, Student ID, Grade Level).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure db is correctly initialized and available
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      const docRef = await addDoc(collection(db, "students"), studentData);
      console.log("Student added with ID: ", docRef.id);
      toast({
        title: "Student Added",
        description: `${studentData.studentName} has been successfully added.`,
      });
      router.push('/admin/students');
    } catch (error) {
      console.error("Error adding student: ", error);
      let errorMessage = "Failed to add student. Please try again.";
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
        title="Add New Student"
        description="Fill in the details to create a new student profile."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Student Form</CardTitle>
          <CardDescription>
            Enter the student's information below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="studentName">Full Name *</Label>
              <Input id="studentName" name="studentName" placeholder="e.g., Alex Johnson" required />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input id="studentId" name="studentId" placeholder="e.g., S12345" required />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Input id="gradeLevel" name="gradeLevel" placeholder="e.g., Grade 5" required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" />
            </div>
            <div>
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input id="parentName" name="parentName" placeholder="e.g., Jamie Johnson" />
            </div>
            <div>
              <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
              <Input id="parentEmail" name="parentEmail" type="email" placeholder="e.g., jamie@example.com" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Student</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
