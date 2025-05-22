
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, Brain, Microscope, Users, Palette, Target as SportsIcon, Loader2 } from 'lucide-react'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface ProgramsPageContentData {
  pageTitle?: string;
  pageSubtitle?: string;
}

const defaultProgramsPageContent: ProgramsPageContentData = {
  pageTitle: "Our Academic & Extracurricular Programs",
  pageSubtitle: "At CampusConnect Academy, we offer a diverse range of programs designed to nurture well-rounded individuals, prepared for future success.",
};

// Individual program items remain hardcoded for simplicity in this version
const programs = [
  {
    icon: <BookMarked className="h-10 w-10 text-primary" />,
    title: 'Core Academics Program',
    description: 'Our comprehensive curriculum for core subjects like Mathematics, Science, English, and Social Studies is designed to foster critical thinking, creativity, and a lifelong love for learning. Includes advanced placement opportunities and personalized learning paths.',
    imageHint: 'students library',
  },
  {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: 'STEM & Innovation Hub',
    description: 'CampusConnect Academy\'s STEM program focuses on Science, Technology, Engineering, and Mathematics with hands-on projects, coding bootcamps, robotics competitions, and preparation for future tech careers.',
    imageHint: 'robotics project',
  },
  {
    icon: <Palette className="h-10 w-10 text-primary" />, 
    title: 'Arts & Humanities Enrichment',
    description: 'We nurture creativity and cultural understanding through a vibrant program including visual arts, music, drama, literature, and debate clubs, encouraging students to express themselves and appreciate diverse perspectives.',
    imageHint: 'student painting',
  },
  {
    icon: <SportsIcon className="h-10 w-10 text-primary" />, 
    title: 'Sports & Athletics Development',
    description: 'Promoting physical fitness, teamwork, and discipline, our athletics program offers a variety of sports, expert coaching, and opportunities for inter-school competitions, fostering sportsmanship and healthy lifestyles.',
    imageHint: 'school sports',
  }
];

export default function ProgramsPage() {
  const [content, setContent] = useState<ProgramsPageContentData>(defaultProgramsPageContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", "programsPageContent");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent({ ...defaultProgramsPageContent, ...docSnap.data() } as ProgramsPageContentData);
        } else {
          setContent(defaultProgramsPageContent);
        }
      } catch (error) {
        console.error("Error fetching Programs page content:", error);
        setContent(defaultProgramsPageContent);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading page content...</p>
      </div>
    );
  }
  
  const renderTextWithHighlight = (text: string | undefined, highlight: string) => {
    if (!text) return "";
    if (text.includes(highlight)) {
      const parts = text.split(highlight);
      return <>{parts[0]}<span className="text-primary">{highlight}</span>{parts[1]}</>;
    }
    return text;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto">
          <section className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {renderTextWithHighlight(content.pageTitle, "Programs")}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {content.pageSubtitle}
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => ( // Program items are still hardcoded
              <Card key={program.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <Image
                  src={`https://placehold.co/600x300.png`}
                  alt={program.title}
                  width={600}
                  height={300}
                  className="rounded-t-lg object-cover w-full h-48"
                  data-ai-hint={program.imageHint}
                />
                <CardHeader className="items-start">
                  <div className="flex items-center gap-3 mb-2">
                    {program.icon}
                    <CardTitle className="text-2xl">{program.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{program.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline">Discover More</Button> {/* Placeholder action */}
                </div>
              </Card>
            ))}
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
