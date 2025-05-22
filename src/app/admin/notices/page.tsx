
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
import { FilePenLine, Trash2, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Notice {
  id: string;
  noticeTitle: string;
  audience: string;
  publishDate: string; 
  status: 'Published' | 'Draft';
  isUrgent?: boolean;
  createdAt?: Timestamp;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const noticeColumns = ["Title", "Audience", "Date Published", "Status"];

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const noticesData: Notice[] = [];
      querySnapshot.forEach((doc) => {
        noticesData.push({ ...doc.data(), id: doc.id } as Notice);
      });
      setNotices(noticesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notices: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch notices. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString; 
    }
  };

  const handleEdit = (noticeId: string) => {
    router.push(`/admin/notices/edit/${noticeId}`);
  };

  const handleDeleteInitiation = (noticeId: string, noticeTitle: string) => {
    setItemToDelete({ id: noticeId, name: noticeTitle });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "notices", itemToDelete.id));
      toast({
        title: "Notice Deleted",
        description: `"${itemToDelete.name}" has been successfully deleted.`,
      });
      setItemToDelete(null);
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting notice: ", error);
      toast({
        title: "Error Deleting Notice",
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
        title="Manage Notices" 
        description="View, create, edit, or delete notices and announcements."
        actions={
          <Button asChild>
            <Link href="/admin/notices/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Notice
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Notice List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
             <Table>
              <TableCaption>No notices found. Create a new notice to get started.</TableCaption>
              <TableHeader>
                <TableRow>
                  {noticeColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={noticeColumns.length + 1} className="text-center h-24">
                    No notices found.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableCaption>A list of school notices and announcements.</TableCaption>
              <TableHeader>
                <TableRow>
                  {noticeColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>{notice.noticeTitle}</TableCell>
                    <TableCell>{notice.audience}</TableCell>
                    <TableCell>{formatDate(notice.publishDate)}</TableCell>
                    <TableCell>
                        <Badge variant={notice.status === 'Published' ? 'default' : 'secondary'}>
                            {notice.status}
                        </Badge>
                        {notice.isUrgent && (
                            <Badge variant="destructive" className="ml-2">
                                <AlertTriangle className="h-3 w-3 mr-1 inline-block" /> Urgent
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" aria-label="Edit notice" onClick={() => handleEdit(notice.id)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Delete notice" onClick={() => handleDeleteInitiation(notice.id, notice.noticeTitle)}>
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
                This action cannot be undone. This will permanently delete the notice <strong>"{itemToDelete.name}"</strong>.
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
