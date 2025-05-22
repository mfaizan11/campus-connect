
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// import { updateDoc } from 'firebase/firestore'; // Will be needed for actual update

interface Student {
  id: string;
  studentName: string;
  studentId: string;
  gradeLevel: string;
  dateOfBirth?: string;
  parentName?: string;
  parentEmail?: string;
  createdAt?: Timestamp;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    if (studentId) {
      const fetchStudent = async () => {
        setLoading(true);
        try {
          const studentDocRef = doc(db, "students", studentId);
          const studentDocSnap = await getDoc(studentDocRef);
          if (studentDocSnap.exists()) {
            const studentData = { id: studentDocSnap.id, ...studentDocSnap.data() } as Student;
            setStudent(studentData);
            setFormData(studentData); // Initialize form with fetched data
          } else {
            toast({ title: "Error", description: "Student not found.", variant: "destructive" });
            router.push('/admin/students');
          }
        } catch (error) {
          console.error("Error fetching student:", error);
          toast({ title: "Error", description: "Failed to fetch student data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [studentId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Student (Coming Soon)",
      description: `Updating student ${formData.studentName || 'details'} is not yet fully implemented.`,
    });
    // Example of how update would work:
    // if (!studentId) return;
    // try {
    //   const studentDocRef = doc(db, "students", studentId);
    //   await updateDoc(studentDocRef, {
    //     ...formData,
    //     // Ensure serverTimestamp is not accidentally overwritten if not changing
    //     // createdAt: student?.createdAt // or handle updates specifically
    //   });
    //   toast({ title: "Student Updated", description: `${formData.studentName} has been updated.` });
    //   router.push('/admin/students');
    // } catch (error) {
    //   console.error("Error updating student:", error);
    //   toast({ title: "Error", description: "Failed to update student.", variant: "destructive" });
    // }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading student details...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-10">
        <p>Student not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/students')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Student: ${student.studentName}`}
        description="Update the student's information."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Student Form</CardTitle>
          <CardDescription>
            Modify the student's details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="studentName">Full Name *</Label>
              <Input id="studentName" name="studentName" value={formData.studentName || ''} onChange={handleInputChange} placeholder="e.g., Alex Johnson" required />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input id="studentId" name="studentId" value={formData.studentId || ''} onChange={handleInputChange} placeholder="e.g., S12345" required />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Input id="gradeLevel" name="gradeLevel" value={formData.gradeLevel || ''} onChange={handleInputChange} placeholder="e.g., Grade 5" required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input id="parentName" name="parentName" value={formData.parentName || ''} onChange={handleInputChange} placeholder="e.g., Jamie Johnson" />
            </div>
            <div>
              <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
              <Input id="parentEmail" name="parentEmail" type="email" value={formData.parentEmail || ''} onChange={handleInputChange} placeholder="e.g., jamie@example.com" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Student (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
