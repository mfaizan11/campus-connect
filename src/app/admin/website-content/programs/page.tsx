
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProgramsPageContentData {
  pageTitle?: string;
  pageSubtitle?: string;
  // Individual program items are hardcoded for now on the public page
}

const PROGRAMS_PAGE_CONTENT_DOC_ID = "programsPageContent";

const defaultProgramsPageContent: ProgramsPageContentData = {
  pageTitle: "Our Academic & Extracurricular Programs",
  pageSubtitle: "At CampusConnect Academy, we offer a diverse range of programs designed to nurture well-rounded individuals, prepared for future success.",
};

export default function ManageProgramsPageContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProgramsPageContentData>(defaultProgramsPageContent);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", PROGRAMS_PAGE_CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...defaultProgramsPageContent, ...docSnap.data() } as ProgramsPageContentData);
        } else {
          setFormData(defaultProgramsPageContent);
        }
      } catch (error) {
        console.error("Error fetching Programs page content:", error);
        toast({ title: "Error", description: "Failed to load Programs page content.", variant: "destructive" });
        setFormData(defaultProgramsPageContent);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "websiteContent", PROGRAMS_PAGE_CONTENT_DOC_ID);
      await setDoc(docRef, formData, { merge: true });
      toast({ title: "Content Updated", description: "Programs page introductory content has been successfully updated." });
    } catch (error) {
      console.error("Error saving Programs page content:", error);
      toast({ title: "Error Saving Content", description: "Failed to update Programs page content. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Programs page content...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Programs Page Content"
        description="Update the main title and introductory paragraph for the Programs page."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/website-content">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website Content
            </Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Programs Page Intro</CardTitle>
          <CardDescription>
            Changes made here will reflect on the public 'Programs' page. Individual program details are managed separately/hardcoded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="pageTitle">Page Main Title</Label>
              <Input id="pageTitle" name="pageTitle" value={formData.pageTitle || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="pageSubtitle">Page Subtitle/Intro Paragraph</Label>
              <Textarea id="pageSubtitle" name="pageSubtitle" value={formData.pageSubtitle || ''} onChange={handleInputChange} rows={4} />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Programs Page Content
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
