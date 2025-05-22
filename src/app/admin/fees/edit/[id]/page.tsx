
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { serverTimestamp } from 'firebase/firestore';

interface FeeRecord {
  id: string;
  studentName: string;
  studentId: string;
  feeTitle: string;
  amountDue: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: Timestamp | null;
  notes?: string;
  createdAt?: Timestamp;
}

const feeStatuses = ['Pending', 'Paid', 'Overdue', 'Partially Paid'] as const;
type FeeStatus = typeof feeStatuses[number];

export default function EditFeeRecordPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const recordId = params.id as string;

  const [record, setRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FeeRecord>>({});

  useEffect(() => {
    if (recordId) {
      const fetchRecord = async () => {
        setLoading(true);
        try {
          const recordDocRef = doc(db, "fees", recordId);
          const recordDocSnap = await getDoc(recordDocRef);
          if (recordDocSnap.exists()) {
            const recordData = { id: recordDocSnap.id, ...recordDocSnap.data() } as FeeRecord;
            setRecord(recordData);
            setFormData(recordData);
          } else {
            toast({ title: "Error", description: "Fee record not found.", variant: "destructive" });
            router.push('/admin/fees');
          }
        } catch (error) {
          console.error("Error fetching fee record:", error);
          toast({ title: "Error", description: "Failed to fetch record data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [recordId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: FeeStatus) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordId) return;
    setIsSubmitting(true);

    const { studentId, studentName, createdAt, ...updateData } = formData;
    
    if (updateData.status === 'Paid' && (!updateData.amountPaid || updateData.amountPaid < (record?.amountDue || 0) ) ) {
        updateData.amountPaid = record?.amountDue; // Ensure full amount is marked if status is 'Paid'
    }
    if (updateData.status === 'Paid' && !updateData.paymentDate) {
        updateData.paymentDate = serverTimestamp();
    }
    if (updateData.status !== 'Paid') {
        updateData.paymentDate = null; // Clear payment date if not fully paid
    }
    if (updateData.amountDue && updateData.amountPaid && updateData.amountPaid > updateData.amountDue) {
        toast({ title: "Validation Error", description: "Amount paid cannot exceed amount due.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }


    try {
      const recordDocRef = doc(db, "fees", recordId);
      await updateDoc(recordDocRef, updateData);
      toast({ title: "Fee Record Updated", description: "The record has been successfully updated." });
      router.push('/admin/fees');
    } catch (error) {
      console.error("Error updating record:", error);
      toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading fee record details...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-10">
        <p>Record not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/fees')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fee Records
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Fee: ${record.feeTitle} for ${record.studentName}`}
        description="Update the student's fee record details."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/fees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fee Records
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Edit Fee Record Form
          </CardTitle>
          <CardDescription>Modify the record details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="studentName">Student Name (Read-only)</Label>
              <Input id="studentName" name="studentName" value={formData.studentName || ''} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label htmlFor="feeTitle">Fee Title *</Label>
              <Input id="feeTitle" name="feeTitle" value={formData.feeTitle || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="amountDue">Amount Due (Rs.) *</Label>
              <Input id="amountDue" name="amountDue" type="number" value={formData.amountDue || ''} onChange={handleInputChange} step="0.01" placeholder="e.g., 12000.00" required />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" value={formData.status || ''} onValueChange={(value: FeeStatus) => handleSelectChange('status', value)} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select fee status" />
                </SelectTrigger>
                <SelectContent>
                  {feeStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amountPaid">Amount Paid (Rs.)</Label>
              <Input id="amountPaid" name="amountPaid" type="number" value={formData.amountPaid || ''} onChange={handleInputChange} step="0.01" placeholder="e.g., 10000.00" />
            </div>
             <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} rows={3}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
