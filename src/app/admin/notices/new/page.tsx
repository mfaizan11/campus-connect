
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewNoticePage() {
  const router = useRouter();
  const { toast } = useToast();

  const audienceOptions = ["All", "Teachers Only", "Students Only", "Parents Only", "Specific Grade(s)"];

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const noticeData = {
      noticeTitle: formData.get('noticeTitle') as string,
      noticeContent: formData.get('noticeContent') as string,
      audience: formData.get('audience') as string,
      publishDate: formData.get('publishDate') as string, // Storing as string for now
      isUrgent: formData.get('isUrgent') === 'on', // Checkbox value is 'on' if checked
      status: 'Published', // Default to published when this action is called
      createdAt: serverTimestamp(),
    };

    if (!noticeData.noticeTitle || !noticeData.noticeContent || !noticeData.audience || !noticeData.publishDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in Title, Content, Audience, and Publish Date.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "notices"), noticeData);
      toast({
        title: "Notice Published",
        description: `"${noticeData.noticeTitle}" has been successfully published.`,
      });
      router.push('/admin/notices');
    } catch (error) {
      console.error("Error publishing notice: ", error);
      let errorMessage = "Failed to publish notice. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = async () => {
    // This requires getting form data without a full submit event, or managing state
    const formElement = document.querySelector('form'); // Simple way, better with React state/refs
    if (!formElement) return;

    const formData = new FormData(formElement);
     const noticeData = {
      noticeTitle: formData.get('noticeTitle') as string,
      noticeContent: formData.get('noticeContent') as string,
      audience: formData.get('audience') as string,
      publishDate: formData.get('publishDate') as string,
      isUrgent: formData.get('isUrgent') === 'on',
      status: 'Draft', // Set status to Draft
      createdAt: serverTimestamp(),
    };

    if (!noticeData.noticeTitle) {
      toast({
        title: "Cannot Save Draft",
        description: "Please provide at least a title to save as draft.",
        variant: "destructive",
      });
      return;
    }

     try {
      if (!db) {
        throw new Error("Firestore database is not initialized.");
      }
      await addDoc(collection(db, "notices"), noticeData);
      toast({
        title: "Notice Saved as Draft",
        description: `"${noticeData.noticeTitle}" has been saved as a draft.`,
      });
       router.push('/admin/notices');
    } catch (error) {
      console.error("Error saving draft: ", error);
      let errorMessage = "Failed to save draft. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Create New Notice"
        description="Draft and publish announcements for the school community."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/notices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Notices
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>New Notice Form</CardTitle>
          <CardDescription>
            Fill in the notice details below. Fields marked with * are required for publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handlePublish}>
            <div>
              <Label htmlFor="noticeTitle">Notice Title *</Label>
              <Input id="noticeTitle" name="noticeTitle" placeholder="e.g., School Reopening Update" required/>
            </div>
            <div>
              <Label htmlFor="noticeContent">Content *</Label>
              <Textarea id="noticeContent" name="noticeContent" placeholder="Detailed content of the notice..." rows={8} required/>
            </div>
            <div>
              <Label htmlFor="audience">Target Audience *</Label>
              <Select name="audience" required>
                <SelectTrigger id="audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="publishDate">Publish Date *</Label>
              <Input id="publishDate" name="publishDate" type="date" required/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isUrgent" name="isUrgent" />
              <Label htmlFor="isUrgent" className="font-normal">Mark as Urgent</Label>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" type="button" onClick={handleSaveDraft}>Save as Draft</Button>
              <Button type="submit">Publish Notice</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
