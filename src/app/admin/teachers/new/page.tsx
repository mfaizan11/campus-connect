
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewTeacherPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const teacherData = {
      teacherName: formData.get('teacherName') as string,
      teacherId: formData.get('teacherId') as string,
      subjectsTaught: formData.get('subject') as string, // Renamed form field from 'subject' to 'subjectsTaught' for clarity
      department: formData.get('department') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      bio: formData.get('bio') as string,
      createdAt: serverTimestamp(),
    };

    if (!teacherData.teacherName || !teacherData.teacherId || !teacherData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Full Name, Teacher ID, Email).",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "teachers"), teacherData);
      toast({
        title: "Teacher Added",
        description: `${teacherData.teacherName} has been successfully added.`,
      });
      router.push('/admin/teachers');
    } catch (error) {
      console.error("Error adding teacher: ", error);
      let errorMessage = "Failed to add teacher. Please try again.";
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
        title="Add New Teacher"
        description="Fill in the details to create a new teacher profile."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/teachers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teachers
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Teacher Form</CardTitle>
          <CardDescription>
            Enter the teacher's information below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="teacherName">Full Name *</Label>
              <Input id="teacherName" name="teacherName" placeholder="e.g., Dr. Evelyn Reed" required />
            </div>
            <div>
              <Label htmlFor="teacherId">Teacher ID *</Label>
              <Input id="teacherId" name="teacherId" placeholder="e.g., T98765" required />
            </div>
            <div>
              <Label htmlFor="subject">Subject(s) Taught</Label>
              <Input id="subject" name="subject" placeholder="e.g., Mathematics, Physics" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="e.g., Science Department" />
            </div>
             <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" placeholder="e.g., e.reed@example.com" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="e.g., (555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" name="bio" placeholder="A brief description of the teacher's experience and qualifications." rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Teacher</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
