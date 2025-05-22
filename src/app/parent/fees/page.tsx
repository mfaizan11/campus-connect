
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert'; 
import { DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, type Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  feeTitle: string;
  amountDue: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: Timestamp;
  createdAt?: Timestamp;
}

interface StudentData {
  id: string;
  studentName: string;
}

export default function ParentFeesPage() {
  const [childName, setChildName] = useState<string | null>("Your Child");
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      setPageMessage(null);
      setFeeRecords([]);
      setChildName("Your Child");

      if (user && user.email) {
        try {
          const studentQuery = query(collection(db, "students"), where("parentEmail", "==", user.email));
          const studentSnapshot = await getDocs(studentQuery);

          if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            const studentData = { id: studentDoc.id, ...studentDoc.data() } as StudentData;
            setChildName(studentData.studentName || "Your Child");
            const fetchedChildId = studentData.id;

            if (fetchedChildId) {
              const feesQuery = query(
                collection(db, "fees"),
                where("studentId", "==", fetchedChildId),
                orderBy("dueDate", "desc"),
                orderBy("createdAt", "desc")
              );
              const feesSnapshot = await getDocs(feesQuery);
              const fetchedFees: FeeRecord[] = [];
              feesSnapshot.forEach(doc => {
                fetchedFees.push({ id: doc.id, ...doc.data() } as FeeRecord);
              });
              setFeeRecords(fetchedFees);

              if (fetchedFees.length === 0) {
                setPageMessage("No fee records found for this student yet.");
              }
            } else {
              setPageMessage("Could not retrieve child's details. Please contact support.");
            }
          } else {
            setPageMessage(`No student record found linked to the email ${user.email}.`);
          }
        } catch (error: any) {
          console.error("Error fetching data for parent fees page: ", error);
          setPageMessage(`An error occurred: ${error.message || "Unknown error"}.`);
        }
      } else {
        setPageMessage("Please log in to view fee information.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return dateString; }
  };
  
  const formatPaymentDate = (timestamp: Timestamp | undefined | null) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return 'Invalid Date';}
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

  const pageHeaderDescription = currentUser && childName ? `View ${childName}'s fee status and history.` : "View fee status and history.";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading fee information...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Fee Status"
        description={pageHeaderDescription}
      />

      {pageMessage && !loading && (
        <Alert variant={pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("no student record found") ? "destructive" : "default"} className="mb-6">
          <AlertTriangle className="h-4 w-4" />
           <CardTitle className="text-sm font-semibold">{pageMessage.toLowerCase().includes("error") || pageMessage.toLowerCase().includes("no student record found") ? "Important Notice" : "Information"}</CardTitle>
          <AlertDescription>{pageMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Fee Records for {childName}
          </CardTitle>
          <CardDescription>Summary of outstanding and paid fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Title</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.length > 0 && !pageMessage?.toLowerCase().includes("error") ? feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.feeTitle}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.amountDue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.amountPaid)}</TableCell>
                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge></TableCell>
                    <TableCell>{record.status === 'Paid' || record.status === 'Partially Paid' ? formatPaymentDate(record.paymentDate) : 'N/A'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      {loading ? "Loading fee records..." : (pageMessage && (pageMessage.includes("No student record found") || pageMessage.includes("Could not retrieve child's details"))) ? "No student record linked to your account to display fees." : (pageMessage && pageMessage.includes("error")) ? "Could not load fee records due to an error." : "No fee records available."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
