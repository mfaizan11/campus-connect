
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
}

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

export default function AboutPage() {
  const [content, setContent] = useState<AboutUsContentData>(defaultAboutUsContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "websiteContent", "aboutUsPage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent({ ...defaultAboutUsContent, ...docSnap.data() } as AboutUsContentData);
        } else {
          setContent(defaultAboutUsContent); // Use defaults if no content in Firestore
        }
      } catch (error) {
        console.error("Error fetching About Us content:", error);
        setContent(defaultAboutUsContent); // Fallback to default on error
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
              {renderTextWithHighlight(content.pageTitle, "CampusConnect Academy")}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {content.pageSubtitle}
            </p>
          </section>

          <section className="mb-12 md:mb-16">
            <Card className="shadow-lg">
              <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{content.storyTitle}</h2>
                  <p className="text-muted-foreground mb-3">
                    {content.storyParagraph1}
                  </p>
                  <p className="text-muted-foreground">
                    {content.storyParagraph2}
                  </p>
                </div>
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="CampusConnect Academy students and faculty collaborating"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full h-auto"
                  data-ai-hint="diverse students faculty"
                />
              </CardContent>
            </Card>
          </section>
          
          <section className="grid md:grid-cols-2 gap-8 mb-12 md:mb-16">
            <Card className="shadow-lg">
              <CardHeader className="items-center text-center">
                <Target className="h-10 w-10 text-primary mb-3" />
                <CardTitle>{content.missionTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  {content.missionStatement}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="items-center text-center">
                <Eye className="h-10 w-10 text-primary mb-3" />
                <CardTitle>{content.visionTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  {content.visionStatement}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">{content.leadershipTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Image 
                      src={`https://placehold.co/200x200.png`} 
                      alt={`Leadership team member ${index + 1}`} 
                      width={120} 
                      height={120} 
                      className="rounded-full mb-4"
                      data-ai-hint="professional headshot"
                    />
                    <h3 className="text-lg font-semibold text-foreground">Leader Name {index + 1}</h3>
                    <p className="text-sm text-primary">Role/Title at Academy</p>
                    <p className="mt-2 text-xs text-muted-foreground">A short bio about the leader's contribution to CampusConnect Academy.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
