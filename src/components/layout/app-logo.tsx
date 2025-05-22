import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-90 transition-opacity">
      <GraduationCap className="h-7 w-7" />
      <span>CampusConnect</span>
    </Link>
  );
}
