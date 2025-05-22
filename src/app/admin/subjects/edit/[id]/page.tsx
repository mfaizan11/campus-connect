
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// import { updateDoc } from 'firebase/firestore';

interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  applicableGradeLevels: string;
  assignedTeacherName?: string;
  assignedTeacherId?: string;
  createdAt?: Timestamp;
}

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Subject>>({});

  // Placeholder data - ideally fetched from Firestore
  const teachersPlaceholder = [{ id: '1', name: 'Dr. Evelyn Reed' }, { id: '2', name: 'Mr. Samuel Green' }];
  const gradeLevels = ["All Grades", "Grade 1-5", "Grade 6-8", "Grade 9-12", "Grade 10", "Grade 11", "Grade 12"];


  useEffect(() => {
    if (subjectId) {
      const fetchSubject = async () => {
        setLoading(true);
        try {
          const subjectDocRef = doc(db, "subjects", subjectId);
          const subjectDocSnap = await getDoc(subjectDocRef);
          if (subjectDocSnap.exists()) {
            const subjectData = { id: subjectDocSnap.id, ...subjectDocSnap.data() } as Subject;
            setSubject(subjectData);
            setFormData(subjectData);
          } else {
            toast({ title: "Error", description: "Subject not found.", variant: "destructive" });
            router.push('/admin/subjects');
          }
        } catch (error) {
          console.error("Error fetching subject:", error);
          toast({ title: "Error", description: "Failed to fetch subject data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchSubject();
    }
  }, [subjectId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Subject (Coming Soon)",
      description: `Updating subject ${formData.subjectName || 'details'} is not yet fully implemented.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading subject details...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-10">
        <p>Subject not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/subjects')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Subject: ${subject.subjectName}`}
        description="Update the subject's information."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/subjects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Subject Form</CardTitle>
          <CardDescription>
            Modify the subject details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input id="subjectName" name="subjectName" value={formData.subjectName || ''} onChange={handleInputChange} required/>
            </div>
            <div>
              <Label htmlFor="subjectCode">Subject Code *</Label>
              <Input id="subjectCode" name="subjectCode" value={formData.subjectCode || ''} onChange={handleInputChange} required/>
            </div>
            <div>
              <Label htmlFor="applicableGradeLevels">Applicable Grade Level(s) *</Label>
              <Select name="applicableGradeLevels" value={formData.applicableGradeLevels || ''} onValueChange={(value) => handleSelectChange('applicableGradeLevels', value)} required>
                <SelectTrigger id="applicableGradeLevels">
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
              <Label htmlFor="assignedTeacherId">Assigned Teacher (Optional)</Label>
              <Select name="assignedTeacherId" value={formData.assignedTeacherId || ''} onValueChange={(value) => handleSelectChange('assignedTeacherId', value)}>
                <SelectTrigger id="assignedTeacherId">
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
              <Button type="submit">Update Subject (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
