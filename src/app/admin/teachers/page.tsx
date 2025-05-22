
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

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const teacherColumns = ["Name", "Teacher ID", "Subject(s)", "Department", "Email", "Phone"];

  useEffect(() => {
    const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teachersData: Teacher[] = [];
      querySnapshot.forEach((doc) => {
        teachersData.push({ ...doc.data(), id: doc.id } as Teacher);
      });
      setTeachers(teachersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching teachers: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch teachers. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEdit = (teacherId: string) => {
    router.push(`/admin/teachers/edit/${teacherId}`);
  };

  const handleDeleteInitiation = (teacherId: string, teacherName: string) => {
    setItemToDelete({ id: teacherId, name: teacherName });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "teachers", itemToDelete.id));
      toast({
        title: "Teacher Deleted",
        description: `${itemToDelete.name} has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting teacher: ", error);
      toast({
        title: "Error Deleting Teacher",
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
        title="Manage Teachers" 
        description="View, add, edit, or delete teacher profiles."
        actions={
          <Button asChild>
            <Link href="/admin/teachers/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Teacher
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
             <Table>
              <TableCaption>No teachers found. Add a new teacher to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {teacherColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={teacherColumns.length + 1} className="text-center h-24">
                    No teachers found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of registered teachers.</TableCaption>
              <TableHeader>
                <TableRow>
                  {teacherColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.teacherName}</TableCell>
                    <TableCell>{teacher.teacherId}</TableCell>
                    <TableCell>{teacher.subjectsTaught || 'N/A'}</TableCell>
                    <TableCell>{teacher.department || 'N/A'}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit teacher" onClick={() => handleEdit(teacher.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete teacher" onClick={() => handleDeleteInitiation(teacher.id, teacher.teacherName)}>
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
                This action cannot be undone. This will permanently delete the teacher record for <strong>{itemToDelete.name}</strong>.
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
