
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit } from 'lucide-react';
import Link from 'next/link';

interface ContentSection {
  title: string;
  description: string;
  editLink: string;
  status?: "Live" | "Draft" | "Coming Soon";
}

const contentSections: ContentSection[] = [
  {
    title: "Homepage Hero Section",
    description: "Manage the main title, subtitle, and call-to-action buttons on the homepage.",
    editLink: "/admin/website-content/hero",
    status: "Live",
  },
  {
    title: "Homepage Features Section",
    description: "Update the 'Why Choose Us' feature highlights.",
    editLink: "/admin/website-content/features",
    status: "Live", 
  },
  {
    title: "About Us Page",
    description: "Edit the content displayed on the 'About Us' page.",
    editLink: "/admin/website-content/about",
    status: "Live", 
  },
  {
    title: "Programs Page",
    description: "Manage the list and descriptions of academic and extracurricular programs.",
    editLink: "/admin/website-content/programs",
    status: "Live",
  },
  // Add more sections as needed, e.g., Faculty page, Contact details, etc.
];

export default function WebsiteContentPage() {
  return (
    <>
      <PageHeader
        title="Manage Website Content"
        description="Update various text and image elements displayed on the public-facing website."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((section) => (
          <Card key={section.title} className="shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Placeholder for more details or a preview */}
            </CardContent>
            <div className="p-6 pt-0">
              {section.status === "Coming Soon" ? (
                 <Button variant="outline" className="w-full" disabled>
                    <Edit className="mr-2 h-4 w-4" /> Manage (Coming Soon)
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href={section.editLink}>
                    <Edit className="mr-2 h-4 w-4" /> Manage Section <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
