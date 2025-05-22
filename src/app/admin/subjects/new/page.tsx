
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewSubjectPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Placeholder data
  const teachersPlaceholder = [{ id: '1', name: 'Dr. Evelyn Reed' }, { id: '2', name: 'Mr. Samuel Green' }];
  const gradeLevels = ["All Grades", "Grade 1-5", "Grade 6-8", "Grade 9-12", "Grade 10", "Grade 11", "Grade 12"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const teacherId = formData.get('assignedTeacher') as string;
    let assignedTeacherName = 'Unassigned';
    if (teacherId && teacherId !== 'unassigned') {
        const selectedTeacher = teachersPlaceholder.find(t => t.id === teacherId);
        assignedTeacherName = selectedTeacher ? selectedTeacher.name : (teacherId || 'Unknown Teacher');
    }

    const subjectData = {
      subjectName: formData.get('subjectName') as string,
      subjectCode: formData.get('subjectCode') as string,
      applicableGradeLevels: formData.get('gradeLevel') as string,
      assignedTeacherName: assignedTeacherName,
      assignedTeacherId: (teacherId && teacherId !== 'unassigned') ? teacherId : null,
      createdAt: serverTimestamp(),
    };

    if (!subjectData.subjectName || !subjectData.subjectCode || !subjectData.applicableGradeLevels) {
      toast({
        title: "Validation Error",
        description: "Please fill in Subject Name, Subject Code, and Applicable Grade Level(s).",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "subjects"), subjectData);
      toast({
        title: "Subject Added",
        description: `${subjectData.subjectName} has been successfully added.`,
      });
      router.push('/admin/subjects');
    } catch (error) {
      console.error("Error adding subject: ", error);
      let errorMessage = "Failed to add subject. Please try again.";
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
        title="Add New Subject"
        description="Define a new subject, assign a teacher, and specify grade levels."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subjects
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Subject Form</CardTitle>
          <CardDescription>
            Fill in the details to create a new subject. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input id="subjectName" name="subjectName" placeholder="e.g., Advanced Mathematics" required/>
            </div>
            <div>
              <Label htmlFor="subjectCode">Subject Code *</Label>
              <Input id="subjectCode" name="subjectCode" placeholder="e.g., MATH301" required/>
            </div>
            <div>
              <Label htmlFor="gradeLevel">Applicable Grade Level(s) *</Label>
              <Select name="gradeLevel" required>
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Select grade level(s)" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTeacher">Assigned Teacher (Optional)</Label>
              <Select name="assignedTeacher">
                <SelectTrigger id="assignedTeacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teachersPlaceholder.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Subject</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
