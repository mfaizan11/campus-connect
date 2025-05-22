
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
import { Loader2, Save, ArrowLeft, CheckCircle, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeaturesContentData {
  pageTitle?: string;
  features?: FeatureItem[];
}

const FEATURES_CONTENT_DOC_ID = "featuresSection";
const DEFAULT_FEATURES_COUNT = 3;

const defaultFeaturesContent: FeaturesContentData = {
  pageTitle: "Why Choose CampusConnect Academy?",
  features: [
    { title: "Holistic Education", description: "Our curriculum focuses on academic rigor, character development, and extracurricular enrichment." },
    { title: "Engaged Parent Community", description: "We foster strong partnerships with parents through open communication and involvement." },
    { title: "Dedicated Faculty", description: "Our experienced educators are passionate about nurturing each student's potential." },
  ]
};

export default function ManageFeaturesSectionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FeaturesContentData>(defaultFeaturesContent);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", FEATURES_CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as FeaturesContentData;
          // Ensure features array has the correct length, padding with defaults if necessary
          const currentFeatures = data.features || [];
          const mergedFeatures = Array.from({ length: DEFAULT_FEATURES_COUNT }, (_, i) => ({
            ...(defaultFeaturesContent.features?.[i] || { title: `Feature ${i+1}`, description: `Default description for feature ${i+1}` }), // Fallback structure
            ...(currentFeatures[i] || {})
          }));
          setFormData({ ...defaultFeaturesContent, ...data, features: mergedFeatures });
        } else {
          setFormData(defaultFeaturesContent);
        }
      } catch (error) {
        console.error("Error fetching features content:", error);
        toast({ title: "Error", description: "Failed to load features content.", variant: "destructive" });
        setFormData(defaultFeaturesContent); // Fallback to default
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [toast]);

  const handleFeatureChange = (index: number, field: keyof FeatureItem, value: string) => {
    setFormData(prev => {
      const updatedFeatures = [...(prev.features || [])];
      if (updatedFeatures[index]) {
        updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
      }
      return { ...prev, features: updatedFeatures };
    });
  };

  const handlePageTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, pageTitle: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "websiteContent", FEATURES_CONTENT_DOC_ID);
      await setDoc(docRef, formData, { merge: true });
      toast({ title: "Content Updated", description: "Homepage features section has been successfully updated." });
    } catch (error) {
      console.error("Error saving features content:", error);
      toast({ title: "Error Saving Content", description: "Failed to update features. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading features content...</p>
      </div>
    );
  }

  // Icons are for display guidance, not directly editable here
  const featureIcons = [
    <CheckCircle className="h-8 w-8 text-primary" />,
    <BookOpen className="h-8 w-8 text-primary" />,
    <Users className="h-8 w-8 text-primary" />,
  ];

  return (
    <>
      <PageHeader
        title="Manage Homepage Features Section"
        description="Update the 'Why Choose Us' feature highlights displayed on the homepage."
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
          <CardTitle>Edit Features Content</CardTitle>
          <CardDescription>
            Changes made here will reflect on the public homepage. Icons are fixed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="pageTitle">Section Title</Label>
              <Input id="pageTitle" name="pageTitle" value={formData.pageTitle || ''} onChange={handlePageTitleChange} placeholder="e.g., Why Choose Us?" />
            </div>

            {(formData.features || []).map((feature, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <CardHeader className="p-0 pb-3">
                    <div className="flex items-center gap-3">
                        {featureIcons[index % featureIcons.length]} {/* Cycle through icons */}
                        <CardTitle className="text-lg">Feature {index + 1}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    <div>
                        <Label htmlFor={`feature${index}Title`}>Feature Title</Label>
                        <Input 
                            id={`feature${index}Title`} 
                            name={`feature${index}Title`} 
                            value={feature.title} 
                            onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} 
                            placeholder={`e.g., Feature ${index + 1} Title`}
                        />
                    </div>
                    <div>
                        <Label htmlFor={`feature${index}Description`}>Feature Description</Label>
                        <Textarea 
                            id={`feature${index}Description`} 
                            name={`feature${index}Description`} 
                            value={feature.description} 
                            onChange={(e) => handleFeatureChange(index, 'description', e.target.value)} 
                            rows={3}
                            placeholder={`e.g., Description for feature ${index + 1}`}
                        />
                    </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Features Content
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
