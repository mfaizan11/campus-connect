
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

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const classColumns = ["Class Name", "Grade Level", "Section", "Class Teacher", "Capacity"];

  useEffect(() => {
    const q = query(collection(db, "classes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classesData: Class[] = [];
      querySnapshot.forEach((doc) => {
        classesData.push({ ...doc.data(), id: doc.id } as Class);
      });
      setClasses(classesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching classes: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch classes. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleEdit = (classId: string) => {
    router.push(`/admin/classes/edit/${classId}`);
  };

  const handleDeleteInitiation = (classId: string, className: string) => {
    setItemToDelete({ id: classId, name: className });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "classes", itemToDelete.id));
      toast({
        title: "Class Deleted",
        description: `${itemToDelete.name} has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting class: ", error);
      toast({
        title: "Error Deleting Class",
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
        title="Manage Classes" 
        description="View, add, edit, or delete classes."
        actions={
          <Button asChild>
            <Link href="/admin/classes/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Class
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Class List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
             <Table>
              <TableCaption>No classes found. Add a new class to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {classColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={classColumns.length + 1} className="text-center h-24">
                    No classes found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of school classes.</TableCaption>
              <TableHeader>
                <TableRow>
                  {classColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.className}</TableCell>
                    <TableCell>{cls.gradeLevel}</TableCell>
                    <TableCell>{cls.section || 'N/A'}</TableCell>
                    <TableCell>{cls.classTeacherName || 'N/A'}</TableCell>
                    <TableCell>{cls.capacity || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit class" onClick={() => handleEdit(cls.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete class" onClick={() => handleDeleteInitiation(cls.id, cls.className)}>
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
                This action cannot be undone. This will permanently delete the class <strong>{itemToDelete.name}</strong>.
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
