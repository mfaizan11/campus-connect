
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FilePenLine, Trash2, PlusCircle, Loader2, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FeeRecord {
  id: string;
  studentName: string;
  studentId: string;
  feeTitle: string;
  amountDue: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: Timestamp;
  createdAt?: Timestamp;
}

export default function AdminFeesPage() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const feeColumns = ["Student Name", "Fee Title", "Amount Due", "Due Date", "Status", "Amount Paid"];

  useEffect(() => {
    const q = query(collection(db, "fees"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: FeeRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ ...doc.data(), id: doc.id } as FeeRecord);
      });
      setFeeRecords(recordsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fee records: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch fee records. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return dateString; }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `Rs. ${new Intl.NumberFormat('en-PK').format(amount)}`;
  };

  const getStatusBadgeVariant = (status: FeeRecord['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Paid': return 'default'; 
      case 'Pending': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Partially Paid': return 'outline';
      default: return 'secondary';
    }
  };

  const handleEdit = (recordId: string) => {
    router.push(`/admin/fees/edit/${recordId}`);
  };

  const handleDeleteInitiation = (recordId: string, feeTitle: string, studentName: string) => {
    setItemToDelete({ id: recordId, name: `${feeTitle} for ${studentName}` });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "fees", itemToDelete.id));
      toast({
        title: "Fee Record Deleted",
        description: `Record "${itemToDelete.name}" has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting fee record: ", error);
      toast({
        title: "Error Deleting Record",
        description: `Failed to delete "${itemToDelete.name}". Please try again. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Student Fees"
        description="View, add, edit, or delete student fee records."
        actions={
          <Button asChild>
            <Link href="/admin/fees/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Fee Record
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Fee Records List
                </CardTitle>
            </div>
          <CardDescription>A comprehensive list of all fee transactions and statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading fee records...</p>
            </div>
          ) : feeRecords.length === 0 ? (
             <Table>
              <TableCaption>No fee records found. Add a new record to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {feeColumns.map((col) => (<TableHead key={col}>{col}</TableHead>))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={feeColumns.length + 1} className="text-center h-24">
                    No fee records found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of student fee records.</TableCaption>
              <TableHeader>
                <TableRow>
                  {feeColumns.map((col) => (<TableHead key={col}>{col}</TableHead>))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>{record.feeTitle}</TableCell>
                    <TableCell>{formatCurrency(record.amountDue)}</TableCell>
                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(record.amountPaid)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit fee record" onClick={() => handleEdit(record.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete fee record" onClick={() => handleDeleteInitiation(record.id, record.feeTitle, record.studentName)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {itemToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the record: <strong>"{itemToDelete.name}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
