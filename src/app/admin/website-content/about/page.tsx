
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

interface AboutUsContentData {
  pageTitle?: string;
  pageSubtitle?: string;
  storyTitle?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  missionTitle?: string;
  missionStatement?: string;
  visionTitle?: string;
  visionStatement?: string;
  leadershipTitle?: string;
  // Leadership team members are complex to manage dynamically here, kept as placeholder on public page
}

const ABOUT_US_CONTENT_DOC_ID = "aboutUsPage";

const defaultAboutUsContent: AboutUsContentData = {
  pageTitle: "About CampusConnect Academy",
  pageSubtitle: "Discover our rich history, educational philosophy, and the values that guide CampusConnect Academy.",
  storyTitle: "Our Story",
  storyParagraph1: "Founded on the principles of academic excellence and holistic development, CampusConnect Academy has been a cornerstone of the community for [Number] years. We are dedicated to providing a supportive and challenging environment where students are encouraged to explore their passions, develop critical thinking skills, and become lifelong learners.",
  storyParagraph2: "Our team of passionate educators is committed to nurturing each student's individual talents and preparing them for success in a rapidly evolving world. CampusConnect Academy is more than just a school; it's a community where students, parents, and faculty collaborate to create an enriching educational experience.",
  missionTitle: "Our Mission",
  missionStatement: "To provide an exceptional educational experience that empowers students to achieve academic excellence, cultivate strong moral character, and become compassionate, responsible global citizens.",
  visionTitle: "Our Vision",
  visionStatement: "To be a leading educational institution recognized for its innovative teaching, vibrant community, and commitment to fostering the holistic development of every student, preparing them to lead meaningful and impactful lives.",
  leadershipTitle: "Meet Our Leadership Team (Placeholder)"
};

export default function ManageAboutUsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AboutUsContentData>(defaultAboutUsContent);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", ABOUT_US_CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...defaultAboutUsContent, ...docSnap.data() } as AboutUsContentData);
        } else {
          setFormData(defaultAboutUsContent);
        }
      } catch (error) {
        console.error("Error fetching About Us content:", error);
        toast({ title: "Error", description: "Failed to load About Us page content.", variant: "destructive" });
        setFormData(defaultAboutUsContent);
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
      const docRef = doc(db, "websiteContent", ABOUT_US_CONTENT_DOC_ID);
      await setDoc(docRef, formData, { merge: true });
      toast({ title: "Content Updated", description: "About Us page content has been successfully updated." });
    } catch (error) {
      console.error("Error saving About Us content:", error);
      toast({ title: "Error Saving Content", description: "Failed to update About Us page. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading About Us content...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage About Us Page Content"
        description="Update the text content displayed on the public 'About Us' page."
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
          <CardTitle>Edit About Us Content</CardTitle>
          <CardDescription>
            Changes made here will reflect on the public 'About Us' page. Images and Leadership team details are managed separately/hardcoded.
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
              <Textarea id="pageSubtitle" name="pageSubtitle" value={formData.pageSubtitle || ''} onChange={handleInputChange} rows={3} />
            </div>
            
            <hr/>

            <div>
              <Label htmlFor="storyTitle">"Our Story" Section Title</Label>
              <Input id="storyTitle" name="storyTitle" value={formData.storyTitle || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="storyParagraph1">"Our Story" First Paragraph</Label>
              <Textarea id="storyParagraph1" name="storyParagraph1" value={formData.storyParagraph1 || ''} onChange={handleInputChange} rows={4} />
            </div>
             <div>
              <Label htmlFor="storyParagraph2">"Our Story" Second Paragraph</Label>
              <Textarea id="storyParagraph2" name="storyParagraph2" value={formData.storyParagraph2 || ''} onChange={handleInputChange} rows={4} />
            </div>

            <hr/>
            
            <div>
              <Label htmlFor="missionTitle">"Our Mission" Section Title</Label>
              <Input id="missionTitle" name="missionTitle" value={formData.missionTitle || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="missionStatement">Mission Statement</Label>
              <Textarea id="missionStatement" name="missionStatement" value={formData.missionStatement || ''} onChange={handleInputChange} rows={3} />
            </div>

            <hr/>

            <div>
              <Label htmlFor="visionTitle">"Our Vision" Section Title</Label>
              <Input id="visionTitle" name="visionTitle" value={formData.visionTitle || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="visionStatement">Vision Statement</Label>
              <Textarea id="visionStatement" name="visionStatement" value={formData.visionStatement || ''} onChange={handleInputChange} rows={3} />
            </div>

            <hr/>
            <div>
              <Label htmlFor="leadershipTitle">"Meet Our Leadership Team" Section Title</Label>
              <Input id="leadershipTitle" name="leadershipTitle" value={formData.leadershipTitle || ''} onChange={handleInputChange} />
              <p className="text-xs text-muted-foreground mt-1">Note: Individual leader profiles are placeholders on the public page.</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save About Us Content
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
