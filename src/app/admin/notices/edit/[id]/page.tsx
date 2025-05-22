
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
// import { updateDoc } from 'firebase/firestore';

interface Notice {
  id: string;
  noticeTitle: string;
  noticeContent: string;
  audience: string;
  publishDate: string; 
  status: 'Published' | 'Draft';
  isUrgent?: boolean;
  createdAt?: Timestamp;
}

export default function EditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Notice>>({});
  
  const audienceOptions = ["All", "Teachers Only", "Students Only", "Parents Only", "Specific Grade(s)"];

  useEffect(() => {
    if (noticeId) {
      const fetchNotice = async () => {
        setLoading(true);
        try {
          const noticeDocRef = doc(db, "notices", noticeId);
          const noticeDocSnap = await getDoc(noticeDocRef);
          if (noticeDocSnap.exists()) {
            const noticeData = { id: noticeDocSnap.id, ...noticeDocSnap.data() } as Notice;
            setNotice(noticeData);
            setFormData(noticeData);
          } else {
            toast({ title: "Error", description: "Notice not found.", variant: "destructive" });
            router.push('/admin/notices');
          }
        } catch (error) {
          console.error("Error fetching notice:", error);
          toast({ title: "Error", description: "Failed to fetch notice data.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchNotice();
    }
  }, [noticeId, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Update Notice (Coming Soon)",
      description: `Updating notice "${formData.noticeTitle || 'details'}" is not yet fully implemented.`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading notice details...</p>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-10">
        <p>Notice not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.push('/admin/notices')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notices
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit Notice: ${notice.noticeTitle}`}
        description="Update the notice information."
        actions={
          <Button variant="outline" onClick={() => router.push('/admin/notices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notices
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Notice Form</CardTitle>
          <CardDescription>
            Modify the notice details below. Full update functionality is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="noticeTitle">Notice Title *</Label>
              <Input id="noticeTitle" name="noticeTitle" value={formData.noticeTitle || ''} onChange={handleInputChange} required/>
            </div>
            <div>
              <Label htmlFor="noticeContent">Content *</Label>
              <Textarea id="noticeContent" name="noticeContent" value={formData.noticeContent || ''} onChange={handleInputChange} rows={8} required/>
            </div>
            <div>
              <Label htmlFor="audience">Target Audience *</Label>
              <Select name="audience" value={formData.audience || ''} onValueChange={(value) => handleSelectChange('audience', value)} required>
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
              <Input id="publishDate" name="publishDate" type="date" value={formData.publishDate || ''} onChange={handleInputChange} required/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isUrgent" name="isUrgent" checked={formData.isUrgent || false} onCheckedChange={(checked) => setFormData(prev => ({...prev, isUrgent: !!checked}))} />
              <Label htmlFor="isUrgent" className="font-normal">Mark as Urgent</Label>
            </div>
             <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" value={formData.status || ''} onValueChange={(value: 'Published' | 'Draft') => handleSelectChange('status', value)} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Notice (Coming Soon)</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
