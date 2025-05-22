
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
// import { updateDoc } from 'firebase/firestore'; // Will be needed for actual update

interface Teacher {
  id: string;
  teacherName: string;
  teacherId: string;
  subjectsTaught?: string;
  department?: string;
  email: string;
  phone?: string;
  bio?: string;
  createdAt?: Timestamp;
}

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const teacherIdParams = params.id as string; // Renamed to avoid conflict with Teacher interface's teacherId

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Teacher>>({});

  useEffect(() => {
    if (teacherIdParams) {
      const fetchTeacher = async () => {
        setLoading(true);
        try {
          const teacherDocRef = doc(db, "teachers", teacherIdParams);
          const teacherDocSnap = await getDoc(teacherDocRef);
          if (teacherDocSnap.exists()) {
            const teacherData = { id: teacherDocSnap.id, ...teacherDocSnap.data() } as Teacher;
            setTeacher(teacherData);
            setFormData(teacherData);
          } else {
            toast({ title: "Error", description: "Teacher not found.", variant: "destructive" });
            router.push('/admin/teachers');
          }
        } catch (error) {
          console.error("Error fetching teacher:", error);
          toast({ title: "Error", description: "Failed to fetch teacher data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [teacherIdParams, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Teacher (Coming Soon)",
      description: `Updating teacher ${formData.teacherName || 'details'} is not yet fully implemented.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading teacher details...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-10">
        <p>Teacher not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/teachers')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Teacher: ${teacher.teacherName}`}
        description="Update the teacher's information."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/teachers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teachers
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Teacher Form</CardTitle>
          <CardDescription>
            Modify the teacher's details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="teacherName">Full Name *</Label>
              <Input id="teacherName" name="teacherName" value={formData.teacherName || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="teacherId">Teacher ID *</Label>
              <Input id="teacherId" name="teacherId" value={formData.teacherId || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="subjectsTaught">Subject(s) Taught</Label>
              <Input id="subjectsTaught" name="subjectsTaught" value={formData.subjectsTaught || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={formData.department || ''} onChange={handleInputChange} />
            </div>
             <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Teacher (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
