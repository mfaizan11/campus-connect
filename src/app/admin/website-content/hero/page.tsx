
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface HeroContentData {
  title?: string;
  subtitle?: string;
  ctaButton1Text?: string;
  ctaButton1Link?: string; 
  ctaButton2Text?: string;
  ctaButton2Link?: string; 
}

const HERO_CONTENT_DOC_ID = "heroSection"; // Document ID in websiteContent collection

export default function ManageHeroSectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<HeroContentData>({
    title: "Welcome to CampusConnect Academy",
    subtitle: "Nurturing bright futures through excellence in education, community, and character development. Discover the difference at CampusConnect Academy.",
    ctaButton1Text: "Learn More About Us",
    ctaButton1Link: "/about",
    ctaButton2Text: "Admissions Inquiry",
    ctaButton2Link: "#admissions-inquiry",
  });

  useEffect(() => {
    const fetchHeroContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", HERO_CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as HeroContentData);
        } else {
          // No existing content, form will use default values
          console.log("No hero content found in Firestore, using default values.");
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        toast({
          title: "Error",
          description: "Failed to load hero section content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHeroContent();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "websiteContent", HERO_CONTENT_DOC_ID);
      await setDoc(docRef, formData, { merge: true }); // Use setDoc with merge to create or update
      toast({
        title: "Content Updated",
        description: "Homepage hero section has been successfully updated.",
      });
      // Optionally, redirect or give further feedback
      // router.push('/admin/website-content'); 
    } catch (error) {
      console.error("Error saving hero content:", error);
      toast({
        title: "Error Saving Content",
        description: "Failed to update hero section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading hero content...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Homepage Hero Section"
        description="Update the main title, subtitle, and call-to-action buttons."
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
          <CardTitle>Edit Hero Content</CardTitle>
          <CardDescription>
            Changes made here will reflect on the public homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Main Title</Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="e.g., Welcome to Our School" />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle / Description</Label>
              <Textarea id="subtitle" name="subtitle" value={formData.subtitle || ''} onChange={handleInputChange} rows={4} placeholder="e.g., A brief introduction to the school." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="ctaButton1Text">CTA Button 1 Text</Label>
                    <Input id="ctaButton1Text" name="ctaButton1Text" value={formData.ctaButton1Text || ''} onChange={handleInputChange} placeholder="e.g., Learn More"/>
                </div>
                <div>
                    <Label htmlFor="ctaButton1Link">CTA Button 1 Link</Label>
                    <Input id="ctaButton1Link" name="ctaButton1Link" value={formData.ctaButton1Link || ''} onChange={handleInputChange} placeholder="e.g., /about"/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="ctaButton2Text">CTA Button 2 Text</Label>
                    <Input id="ctaButton2Text" name="ctaButton2Text" value={formData.ctaButton2Text || ''} onChange={handleInputChange} placeholder="e.g., Contact Us"/>
                </div>
                 <div>
                    <Label htmlFor="ctaButton2Link">CTA Button 2 Link</Label>
                    <Input id="ctaButton2Link" name="ctaButton2Link" value={formData.ctaButton2Link || ''} onChange={handleInputChange} placeholder="e.g., /contact"/>
                </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Hero Content
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
