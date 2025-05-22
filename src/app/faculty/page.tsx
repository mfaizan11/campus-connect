
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Briefcase } from 'lucide-react';

const facultyMembers = [
  {
    name: 'Dr. Eleanor Vance',
    title: 'Principal & Lead Educator',
    department: 'Administration',
    bio: 'With over 20 years of experience in education, Dr. Vance is dedicated to fostering an environment of academic excellence and holistic student development at CampusConnect Academy.',
    email: 'evance@campusconnect.academy', // Updated email domain
    phone: '555-1234',
    imageHint: 'principal office',
  },
  {
    name: 'Mr. Samuel Green',
    title: 'Head of Mathematics Department',
    department: 'Mathematics',
    bio: 'Mr. Green is passionate about making mathematics accessible and engaging for all students at CampusConnect Academy, employing innovative teaching methodologies.',
    email: 'sgreen@campusconnect.academy', // Updated email domain
    phone: '555-5678',
    imageHint: 'math teacher',
  },
  {
    name: 'Ms. Olivia Chen',
    title: 'Lead Science Teacher',
    department: 'Science',
    bio: 'Ms. Chen inspires curiosity and a love for discovery in her students through hands-on experiments and real-world applications of scientific principles at CampusConnect Academy.',
    email: 'ochen@campusconnect.academy', // Updated email domain
    phone: '555-9012',
    imageHint: 'science lab',
  },
   {
    name: 'Mr. David Miller',
    title: 'Arts & Humanities Coordinator',
    department: 'Arts & Humanities',
    bio: 'Mr. Miller champions creativity and critical expression, overseeing a vibrant program at CampusConnect Academy that includes visual arts, drama, and music.',
    email: 'dmiller@campusconnect.academy', // Updated email domain
    phone: '555-3456',
    imageHint: 'art studio',
  },
];

export default function FacultyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto">
          <section className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Our Dedicated <span className="text-primary">Faculty</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Meet the experienced and passionate educators who make CampusConnect Academy a center for learning and growth.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {facultyMembers.map((member) => (
              <Card key={member.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Image
                    src={`https://placehold.co/200x200.png`}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="rounded-full sm:rounded-lg object-cover w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] flex-shrink-0"
                    data-ai-hint={member.imageHint}
                  />
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-primary font-medium">{member.title}</p>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center sm:justify-start gap-1">
                      <Briefcase className="w-4 h-4"/> {member.department}
                    </p>
                    <CardDescription className="text-sm mb-3">{member.bio}</CardDescription>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                      <a href={`mailto:${member.email}`} className="hover:text-primary flex items-center justify-center sm:justify-start gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </a>
                      <span className="hidden sm:inline">|</span>
                      <a href={`tel:${member.phone}`} className="hover:text-primary flex items-center justify-center sm:justify-start gap-1">
                        <Phone className="w-3 h-3" /> {member.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
