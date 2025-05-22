
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// import { updateDoc } from 'firebase/firestore';

const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'] as const;
type AttendanceStatus = typeof attendanceStatuses[number];

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  subject?: string;
  reason?: string;
  createdAt?: Timestamp;
}

export default function EditAttendanceRecordPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const recordId = params.id as string;

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});

  useEffect(() => {
    if (recordId) {
      const fetchRecord = async () => {
        setLoading(true);
        try {
          const recordDocRef = doc(db, "attendanceRecords", recordId);
          const recordDocSnap = await getDoc(recordDocRef);
          if (recordDocSnap.exists()) {
            const recordData = { id: recordDocSnap.id, ...recordDocSnap.data() } as AttendanceRecord;
            setRecord(recordData);
            setFormData(recordData);
          } else {
            toast({ title: "Error", description: "Attendance record not found.", variant: "destructive" });
            router.push('/admin/attendance');
          }
        } catch (error) {
          console.error("Error fetching attendance record:", error);
          toast({ title: "Error", description: "Failed to fetch record data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [recordId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as AttendanceStatus }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Attendance (Coming Soon)",
      description: `Updating attendance for ${formData.studentName || 'student'} on ${formData.date || ''} is not yet fully implemented.`,
    });
    // Example update logic (ensure studentId and studentName are not directly editable here if they are fixed):
    // if (!recordId) return;
    // try {
    //   const recordDocRef = doc(db, "attendanceRecords", recordId);
    //   const { studentId, studentName, createdAt, ...updateData } = formData; // Exclude fields that shouldn't be directly updated by this form
    //   await updateDoc(recordDocRef, updateData);
    //   toast({ title: "Attendance Updated", description: "The record has been updated." });
    //   router.push('/admin/attendance');
    // } catch (error) {
    //   console.error("Error updating record:", error);
    //   toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
    // }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading attendance details...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-10">
        <p>Record not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/attendance')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attendance Log
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Attendance: ${record.studentName} - ${record.date}`}
        description="Update the student's attendance record."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/attendance')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Log
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Attendance Form</CardTitle>
          <CardDescription>
            Modify the record details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="studentName">Student Name (Read-only)</Label>
              <Input id="studentName" name="studentName" value={formData.studentName || ''} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} required />
            </div>
             <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" value={formData.status || ''} onValueChange={(value) => handleSelectChange('status', value)} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select attendance status" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input id="subject" name="subject" value={formData.subject || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Absence/Lateness (Optional)</Label>
              <Textarea id="reason" name="reason" value={formData.reason || ''} onChange={handleInputChange} rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Record (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
