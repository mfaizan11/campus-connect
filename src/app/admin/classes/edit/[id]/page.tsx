
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

interface Class {
  id: string;
  className: string;
  gradeLevel: string;
  section?: string;
  classTeacherName?: string;
  classTeacherId?: string;
  capacity?: number;
  createdAt?: Timestamp;
}

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const classId = params.id as string;

  const [cls, setCls] = useState<Class | null>(null); // Renamed to avoid conflict with 'class' keyword
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Class>>({});

  // Placeholder data for select dropdowns - ideally fetched from Firestore
  const teachersPlaceholder = [{ id: '1', name: 'Dr. Evelyn Reed' }, { id: '2', name: 'Mr. Samuel Green' }];
  const gradeLevels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];


  useEffect(() => {
    if (classId) {
      const fetchClass = async () => {
        setLoading(true);
        try {
          const classDocRef = doc(db, "classes", classId);
          const classDocSnap = await getDoc(classDocRef);
          if (classDocSnap.exists()) {
            const classData = { id: classDocSnap.id, ...classDocSnap.data() } as Class;
            setCls(classData);
            setFormData(classData);
          } else {
            toast({ title: "Error", description: "Class not found.", variant: "destructive" });
            router.push('/admin/classes');
          }
        } catch (error) {
          console.error("Error fetching class:", error);
          toast({ title: "Error", description: "Failed to fetch class data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchClass();
    }
  }, [classId, router, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) || 0 : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Class (Coming Soon)",
      description: `Updating class ${formData.className || 'details'} is not yet fully implemented.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading class details...</p>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="text-center py-10">
        <p>Class not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/classes')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Class: ${cls.className}`}
        description="Update the class's information."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/classes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Class Form</CardTitle>
          <CardDescription>
            Modify the class details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="className">Class Name *</Label>
              <Input id="className" name="className" value={formData.className || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Select name="gradeLevel" value={formData.gradeLevel || ''} onValueChange={(value) => handleSelectChange('gradeLevel', value)} required>
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
              <Input id="section" name="section" value={formData.section || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="classTeacherId">Class Teacher</Label>
               <Select name="classTeacherId" value={formData.classTeacherId || ''} onValueChange={(value) => handleSelectChange('classTeacherId', value)}>
                <SelectTrigger id="classTeacherId">
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
              <Input id="capacity" name="capacity" type="number" value={formData.capacity || ''} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Class (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
