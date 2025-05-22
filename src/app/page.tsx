
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, BookOpen, Users, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { NoticesPreview } from '@/components/notices-preview';
import { MarqueeNoticesHeader } from '@/components/layout/marquee-notices-header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const registrationFormSchema = z.object({
  parentName: z.string().min(2, { message: "Parent's name must be at least 2 characters." }),
  parentEmail: z.string().email({ message: "Please enter a valid email address." }),
  parentPhone: z.string().min(10, { message: "Please enter a valid phone number (min 10 digits)." }),
  childName: z.string().min(2, { message: "Child's name must be at least 2 characters." }),
  childGrade: z.string().min(1, { message: "Please enter the child's current or expected grade." }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface HeroContentData {
  title?: string;
  subtitle?: string;
  ctaButton1Text?: string;
  ctaButton1Link?: string;
  ctaButton2Text?: string;
  ctaButton2Link?: string;
}

interface FeatureItem {
  title: string;
  description: string;
}
interface FeaturesContentData {
  pageTitle?: string;
  features?: FeatureItem[];
}

const defaultHeroContent: HeroContentData = {
  title: "Welcome to CampusConnect Academy",
  subtitle: "Nurturing bright futures through excellence in education, community, and character development. Discover the difference at CampusConnect Academy.",
  ctaButton1Text: "Learn More About Us",
  ctaButton1Link: "/about",
  ctaButton2Text: "Admissions Inquiry",
  ctaButton2Link: "#admissions-inquiry",
};

const defaultFeaturesContent: FeaturesContentData = {
  pageTitle: "Why Choose CampusConnect Academy?",
  features: [
    { title: "Holistic Education", description: "Our curriculum focuses on academic rigor, character development, and extracurricular enrichment." },
    { title: "Engaged Parent Community", description: "We foster strong partnerships with parents through open communication and involvement." },
    { title: "Dedicated Faculty", description: "Our experienced educators are passionate about nurturing each student's potential." },
  ]
};

const featureIcons = [
  <CheckCircle key="ficon1" className="h-8 w-8 text-primary" />,
  <BookOpen key="ficon2" className="h-8 w-8 text-primary" />,
  <Users key="ficon3" className="h-8 w-8 text-primary" />,
];


export default function HomePage() {
  const { toast } = useToast();
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childName: "",
      childGrade: "",
    },
  });

  const [heroContent, setHeroContent] = useState<HeroContentData>(defaultHeroContent);
  const [loadingHero, setLoadingHero] = useState(true);
  const [featuresContent, setFeaturesContent] = useState<FeaturesContentData>(defaultFeaturesContent);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const fetchHeroContent = async () => {
      setLoadingHero(true);
      if (!db) {
        console.warn("[HomePage] Firestore db instance is not available for Hero content.");
        setHeroContent(defaultHeroContent);
        setLoadingHero(false);
        return;
      }
      try {
        const docRef = doc(db, "websiteContent", "heroSection");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHeroContent(docSnap.data() as HeroContentData);
        } else {
          console.log("[HomePage] No hero content found in Firestore, using default values.");
          setHeroContent(defaultHeroContent);
        }
      } catch (error) {
        console.error("[HomePage] Error fetching hero content:", error);
        setHeroContent(defaultHeroContent);
      } finally {
        setLoadingHero(false);
      }
    };

    const fetchFeaturesContent = async () => {
      setLoadingFeatures(true);
      if (!db) {
        console.warn("[HomePage] Firestore db instance is not available for Features content.");
        setFeaturesContent(defaultFeaturesContent);
        setLoadingFeatures(false);
        return;
      }
      try {
        const docRef = doc(db, "websiteContent", "featuresSection");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as FeaturesContentData;
          const currentFeatures = data.features || [];
          const mergedFeatures = Array.from({ length: 3 }, (_, i) => ({
            ...(defaultFeaturesContent.features?.[i] || { title: `Feature ${i+1}`, description: `Default description for feature ${i+1}` }),
            ...(currentFeatures[i] || {})
          }));
          setFeaturesContent({ ...defaultFeaturesContent, ...data, features: mergedFeatures });
        } else {
          console.log("[HomePage] No features content found in Firestore, using default values.");
          setFeaturesContent(defaultFeaturesContent);
        }
      } catch (error) {
        console.error("[HomePage] Error fetching features content:", error);
        setFeaturesContent(defaultFeaturesContent);
      } finally {
        setLoadingFeatures(false);
      }
    };

    fetchHeroContent();
    fetchFeaturesContent();
  }, []);

  function onRegistrationSubmit(data: RegistrationFormValues) {
    console.log("Registration Data:", data);
    toast({
      title: "Inquiry Received!",
      description: "Thank you for your interest in CampusConnect Academy! Our admissions team will contact you shortly.",
    });
    form.reset();
  }

  const renderHeroTitle = (title: string | undefined) => {
    if (!title) return "";
    const highlight = "CampusConnect Academy";
    if (title.includes(highlight)) {
      const parts = title.split(highlight);
      return <>{parts[0]}<span className="text-primary">{highlight}</span>{parts[1]}</>;
    }
    return title;
  };

  return (
    <div className="flex min-h-screen flex-col ">
      <MarqueeNoticesHeader />
      <PublicHeader />
      <main className="flex-grow spacea">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center md:text-left">
                {loadingHero ? (
                  <div className="space-y-4">
                    <div className="h-12 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
                    <div className="h-6 bg-muted rounded w-5/6 animate-pulse"></div>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-10">
                        <div className="h-12 bg-muted rounded w-40 animate-pulse"></div>
                        <div className="h-12 bg-muted rounded w-40 animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                      {renderHeroTitle(heroContent.title)}
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                      {heroContent.subtitle}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                      {heroContent.ctaButton1Text && heroContent.ctaButton1Link && (
                        <Button asChild size="lg">
                          <Link href={heroContent.ctaButton1Link}>{heroContent.ctaButton1Text}</Link>
                        </Button>
                      )}
                      {heroContent.ctaButton2Text && heroContent.ctaButton2Link && (
                        <Button asChild variant="outline" size="lg">
                          <Link href={heroContent.ctaButton2Link}>{heroContent.ctaButton2Text}</Link>
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Image Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Card className="shadow-xl overflow-hidden group rounded-lg">
                  <Image
                    src="/images/image1.webp"
                    alt="Students engaged in learning at CampusConnect Academy"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="students classroom"
                  />
                </Card>
                <Card className="shadow-xl overflow-hidden group rounded-lg mt-0 sm:mt-8 md:mt-12"> {/* Adjusted margin for stacking */}
                  <Image
                    src="/images/values.webp"
                    alt="CampusConnect Academy modern school campus"
                    width={400}
                    height={200}
                    className="w-full h-[489px] object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="school campus"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form Section */}
        <section id="admissions-inquiry" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Inquire About Admissions</CardTitle>
                    <CardDescription>
                      Interested in enrolling your child at CampusConnect Academy? Fill out the form below, and our admissions team will contact you shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onRegistrationSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="parentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent's Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent's Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent's Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="e.g., (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="childName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Child's Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Alex Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="childGrade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Child's Current/Expected Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Grade 5 / Kindergarten" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Inquiry...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Inquiry
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 md:order-2 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
                  Join the <span className="text-primary">CampusConnect Academy</span> Family
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We are committed to providing a nurturing and stimulating environment where students can achieve their full potential. Inquire today to learn more about our curriculum, facilities, and vibrant school community.
                </p>
                <Image
                  src="/images/ok.webp"
                  alt="Happy students at CampusConnect Academy"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-md w-full h-auto object-cover"
                  data-ai-hint="happy students"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground mb-12">
              {loadingFeatures ? <span className="h-9 bg-muted rounded w-1/2 inline-block animate-pulse"></span> : featuresContent.pageTitle}
            </h2>
            {loadingFeatures ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardHeader className="items-center">
                      <div className="h-8 w-8 bg-muted rounded-full animate-pulse mb-4"></div>
                      <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full animate-pulse mb-2"></div>
                      <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {(featuresContent.features || []).map((feature, index) => (
                  <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="items-center">
                      {featureIcons[index % featureIcons.length]} {/* Display hardcoded icon */}
                      <CardTitle className="mt-4 text-center">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Notices Preview Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-xl mx-auto justify-center text-center text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-12">
              <NoticesPreview />
            </div>
          </div>
        </section>

        {/* Placeholder for additional sections like testimonials or school programs preview */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground mb-12">
              Our Programs
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <Image
                    src={`/images/ok.webp`}
                    alt={`CampusConnect Academy Program 1`}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="students library"
                  />
                  <CardHeader>
                    <CardTitle>Academic Excellence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>A rigorous curriculum designed to challenge students and foster a love of learning across all core subjects.</CardDescription>
                     <Button variant="link" asChild className="px-0 mt-2">
                        <Link href="/programs">Learn More &rarr;</Link>
                     </Button>
                  </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <Image
                    src={`/images/ok.webp`}
                    alt={`CampusConnect Academy Program 2`}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="robotics project"
                  />
                  <CardHeader>
                    <CardTitle>STEM & Innovation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Engaging students in Science, Technology, Engineering, and Math through hands-on projects and problem-solving.</CardDescription>
                     <Button variant="link" asChild className="px-0 mt-2">
                        <Link href="/programs">Learn More &rarr;</Link>
                     </Button>
                  </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <Image
                    src={`/images/ok.webp`}
                    alt={`CampusConnect Academy Program 3`}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="student painting"
                  />
                  <CardHeader>
                    <CardTitle>Arts & Creativity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Nurturing artistic talents through visual arts, music, drama, and creative expression programs.</CardDescription>
                     <Button variant="link" asChild className="px-0 mt-2">
                        <Link href="/programs">Learn More &rarr;</Link>
                     </Button>
                  </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to Discover CampusConnect Academy?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Explore our admissions process and become part of our thriving school community.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/contact">Contact Admissions</Link>
            </Button>
          </div>
        </section>

      </main>
      <PublicFooter />
    </div>
  );
}
