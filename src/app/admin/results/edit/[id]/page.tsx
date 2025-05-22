
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
// import { updateDoc } from 'firebase/firestore'; // For actual update

interface StudentResult {
  id: string;
  studentName: string;
  studentId: string;
  subjectName: string;
  marks: string;
  term: string;
  comments?: string;
  createdAt?: Timestamp;
}

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const resultId = params.id as string;

  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<StudentResult>>({});

  useEffect(() => {
    if (resultId) {
      const fetchResult = async () => {
        setLoading(true);
        try {
          const resultDocRef = doc(db, "results", resultId);
          const resultDocSnap = await getDoc(resultDocRef);
          if (resultDocSnap.exists()) {
            const resultData = { id: resultDocSnap.id, ...resultDocSnap.data() } as StudentResult;
            setResult(resultData);
            setFormData(resultData);
          } else {
            toast({ title: "Error", description: "Result record not found.", variant: "destructive" });
            router.push('/admin/results');
          }
        } catch (error) {
          console.error("Error fetching result:", error);
          toast({ title: "Error", description: "Failed to fetch result data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [resultId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Result (Coming Soon)",
      description: `Updating result for ${formData.studentName || 'student'} in ${formData.subjectName || 'subject'} is not yet fully implemented.`,
    });
    // Example update logic:
    // if (!resultId) return;
    // try {
    //   const resultDocRef = doc(db, "results", resultId);
    //   await updateDoc(resultDocRef, formData);
    //   toast({ title: "Result Updated", description: "The result record has been updated." });
    //   router.push('/admin/results');
    // } catch (error) {
    //   console.error("Error updating result:", error);
    //   toast({ title: "Error", description: "Failed to update result.", variant: "destructive" });
    // }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading result details...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-10">
        <p>Result record not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/results')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Result: ${result.studentName} - ${result.subjectName}`}
        description="Update the student's academic result."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/results')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Result Form</CardTitle>
          <CardDescription>
            Modify the result details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="studentName">Student Name (Read-only)</Label>
              <Input id="studentName" name="studentName" value={formData.studentName || ''} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input id="subjectName" name="subjectName" value={formData.subjectName || ''} onChange={handleInputChange} required />
            </div>
             <div>
              <Label htmlFor="marks">Marks / Grade *</Label>
              <Input id="marks" name="marks" value={formData.marks || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="term">Term / Session *</Label>
              <Input id="term" name="term" value={formData.term || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea id="comments" name="comments" value={formData.comments || ''} onChange={handleInputChange} rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Result (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
