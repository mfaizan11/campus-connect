
import Link from 'next/link';
import { AppLogo } from '@/components/layout/app-logo';
import { Mail, MapPin, Phone } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t bg-background text-foreground">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and School Info */}
          <div className="space-y-4">
            <AppLogo />
            <p className="text-sm text-muted-foreground">
              CampusConnect Academy is dedicated to fostering a vibrant learning community and promoting academic excellence and holistic development for every student.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/programs" className="text-muted-foreground hover:text-primary transition-colors">Our Programs</Link></li>
              <li><Link href="/faculty" className="text-muted-foreground hover:text-primary transition-colors">Faculty</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
               <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Portals Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">123 Rawalpindi, Pakistan</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="tel:+15552223369" className="text-muted-foreground hover:text-primary transition-colors">051-2376374</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:info@campusconnect.academy" className="text-muted-foreground hover:text-primary transition-colors">info@campusconnect.academy</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusConnect Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
