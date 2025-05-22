
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

interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  applicableGradeLevels: string;
  assignedTeacherName?: string;
  assignedTeacherId?: string;
  createdAt?: Timestamp;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const subjectColumns = ["Subject Name", "Subject Code", "Grade Level(s)", "Assigned Teacher"];

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const subjectsData: Subject[] = [];
      querySnapshot.forEach((doc) => {
        subjectsData.push({ ...doc.data(), id: doc.id } as Subject);
      });
      setSubjects(subjectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subjects: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch subjects. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEdit = (subjectId: string) => {
    router.push(`/admin/subjects/edit/${subjectId}`);
  };

  const handleDeleteInitiation = (subjectId: string, subjectName: string) => {
    setItemToDelete({ id: subjectId, name: subjectName });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "subjects", itemToDelete.id));
      toast({
        title: "Subject Deleted",
        description: `${itemToDelete.name} has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting subject: ", error);
      toast({
        title: "Error Deleting Subject",
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
        title="Manage Subjects" 
        description="View, add, edit, or delete subjects."
        actions={
          <Button asChild>
            <Link href="/admin/subjects/new">
             <PlusCircle className="mr-2 h-4 w-4" /> Add New Subject
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
             <Table>
              <TableCaption>No subjects found. Add a new subject to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {subjectColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={subjectColumns.length + 1} className="text-center h-24">
                    No subjects found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of school subjects.</TableCaption>
              <TableHeader>
                <TableRow>
                  {subjectColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.subjectName}</TableCell>
                    <TableCell>{subject.subjectCode}</TableCell>
                    <TableCell>{subject.applicableGradeLevels}</TableCell>
                    <TableCell>{subject.assignedTeacherName || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit subject" onClick={() => handleEdit(subject.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete subject" onClick={() => handleDeleteInitiation(subject.id, subject.subjectName)}>
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
                This action cannot be undone. This will permanently delete the subject <strong>{itemToDelete.name}</strong>.
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
