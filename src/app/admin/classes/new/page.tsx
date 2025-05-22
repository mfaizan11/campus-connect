
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

export default function NewClassPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Placeholder data for select dropdowns
  const teachersPlaceholder = [{ id: '1', name: 'Dr. Evelyn Reed' }, { id: '2', name: 'Mr. Samuel Green' }];
  const gradeLevels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const teacherId = formData.get('classTeacher') as string;
    const selectedTeacher = teachersPlaceholder.find(t => t.id === teacherId);
    
    const classData = {
      className: formData.get('className') as string,
      gradeLevel: formData.get('gradeLevel') as string,
      section: formData.get('section') as string,
      classTeacherName: selectedTeacher ? selectedTeacher.name : (teacherId || 'N/A'), // Store name, or ID if not found
      classTeacherId: teacherId || null, // Store ID
      capacity: parseInt(formData.get('capacity') as string) || 0,
      createdAt: serverTimestamp(),
    };

    if (!classData.className || !classData.gradeLevel) {
      toast({
        title: "Validation Error",
        description: "Please fill in Class Name and Grade Level.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "classes"), classData);
      toast({
        title: "Class Added",
        description: `${classData.className} has been successfully added.`,
      });
      router.push('/admin/classes');
    } catch (error) {
      console.error("Error adding class: ", error);
      let errorMessage = "Failed to add class. Please try again.";
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
        title="Add New Class"
        description="Define a new class, assign a teacher, and set its capacity."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/classes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classes
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Class Form</CardTitle>
          <CardDescription>
            Fill in the details to create a new class. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="className">Class Name *</Label>
              <Input id="className" name="className" placeholder="e.g., Grade 5 - Section A" required />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Select name="gradeLevel" required>
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section">Section (Optional)</Label>
              <Input id="section" name="section" placeholder="e.g., A, B, Morning" />
            </div>
            <div>
              <Label htmlFor="classTeacher">Class Teacher</Label>
               <Select name="classTeacher">
                <SelectTrigger id="classTeacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachersPlaceholder.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="capacity">Number of Students (Capacity)</Label>
              <Input id="capacity" name="capacity" type="number" placeholder="e.g., 30" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Class</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
