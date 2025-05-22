
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FilePenLine, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentResult {
  id: string;
  studentName: string; // Denormalized for display
  studentId: string; // FK to students collection
  subjectName: string;
  marks: string; // Can be 'A+', '85%', etc.
  term: string; // e.g., "Term 1 - 2024"
  comments?: string;
  createdAt?: Timestamp;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const resultColumns = ["Student Name", "Subject", "Marks/Grade", "Term/Session", "Comments"];

  useEffect(() => {
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const resultsData: StudentResult[] = [];
      querySnapshot.forEach((doc) => {
        resultsData.push({ ...doc.data(), id: doc.id } as StudentResult);
      });
      setResults(resultsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching results: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch student results. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEdit = (resultId: string) => {
    router.push(`/admin/results/edit/${resultId}`);
  };

  const handleDeleteInitiation = (resultId: string, studentName: string, subjectName: string) => {
    setItemToDelete({ id: resultId, name: `result for ${studentName} in ${subjectName}` });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "results", itemToDelete.id));
      toast({
        title: "Result Deleted",
        description: `The ${itemToDelete.name} has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting result: ", error);
      toast({
        title: "Error Deleting Result",
        description: `Failed to delete ${itemToDelete.name}. Please try again. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Manage Student Results" 
        description="View, add, edit, or delete student academic results."
        actions={
          <Button asChild>
            <Link href="/admin/results/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Result
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Student Results List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading results...</p>
            </div>
          ) : results.length === 0 ? (
             <Table>
              <TableCaption>No results found. Add a new result to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {resultColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={resultColumns.length + 1} className="text-center h-24">
                    No results found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of student academic results.</TableCaption>
              <TableHeader>
                <TableRow>
                  {resultColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.studentName}</TableCell>
                    <TableCell>{result.subjectName}</TableCell>
                    <TableCell>{result.marks}</TableCell>
                    <TableCell>{result.term}</TableCell>
                    <TableCell>{result.comments || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit result" onClick={() => handleEdit(result.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete result" onClick={() => handleDeleteInitiation(result.id, result.studentName, result.subjectName)}>
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
                This action cannot be undone. This will permanently delete the <strong>{itemToDelete.name}</strong>.
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
