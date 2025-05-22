
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

interface Student {
  id: string;
  studentName: string;
  studentId: string;
  gradeLevel: string;
  dateOfBirth?: string;
  parentName?: string;
  parentEmail?: string;
  createdAt?: Timestamp; // Firestore Timestamp
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    console.log("[AdminStudentsPage] db instance check:", db);
    if (!db) {
      toast({
        title: "Database Error",
        description: "Firestore database is not available. Please check console.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ ...doc.data(), id: doc.id } as Student);
      });
      setStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("[AdminStudentsPage] Error fetching students: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch students. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const studentColumns = ["Name", "Class", "Section", "Date of Birth", "Parent Info"];

  const handleEdit = (studentDocId: string) => {
    router.push(`/admin/students/edit/${studentDocId}`);
  };

  const handleDeleteInitiation = (studentDocId: string, studentName: string) => {
    setItemToDelete({ id: studentDocId, name: studentName });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (!db) {
      toast({ title: "Error", description: "Firestore not available.", variant: "destructive" });
      return;
    }
    try {
      await deleteDoc(doc(db, "students", itemToDelete.id));
      toast({
        title: "Student Deleted",
        description: `${itemToDelete.name} has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting student: ", error);
      toast({
        title: "Error Deleting Student",
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
        title="Manage Students" 
        description="View, add, edit, or delete student profiles."
        actions={
          <Button asChild>
            <Link href="/admin/students/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
             <Table>
              <TableCaption>No students found. Add a new student to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {studentColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={studentColumns.length + 1} className="text-center h-24">
                    No students found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of enrolled students.</TableCaption>
              <TableHeader>
                <TableRow>
                  {studentColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.gradeLevel}</TableCell>
                    <TableCell>N/A</TableCell> {/* Section - Not collected yet */}
                    <TableCell>{student.dateOfBirth || 'N/A'}</TableCell>
                    <TableCell>
                      {student.parentName || 'N/A'}
                      {student.parentName && student.parentEmail ? <br /> : ''}
                      {student.parentEmail && <span className="text-xs text-muted-foreground">{student.parentEmail}</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit student" onClick={() => handleEdit(student.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete student" onClick={() => handleDeleteInitiation(student.id, student.studentName)}>
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
                This action cannot be undone. This will permanently delete the student record for <strong>{itemToDelete.name}</strong>.
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
