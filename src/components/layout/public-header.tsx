
"use client"; // Make this a client component to use hooks for auth state

import Link from 'next/link';
import { AppLogo } from '@/components/layout/app-logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { UserNav } from '@/components/layout/user-nav'; // Import UserNav

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/programs', label: 'Programs' },
  { href: '/faculty', label: 'Faculty' },
  { href: '/contact', label: 'Contact Us' },
];

export function PublicHeader() {
  const [loggedInUser, setLoggedInUser] = useState<FirebaseUser | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUser(user);
      setLoadingAuthState(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <AppLogo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-primary text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loadingAuthState ? (
            // Optional: Show a loader or a placeholder while checking auth state
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : loggedInUser ? (
            <UserNav />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 p-4">
                  <AppLogo />
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-lg transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {/* Mobile menu login/user state - consistent with desktop */}
                  <div className="mt-auto pt-4 border-t">
                    {loadingAuthState ? (
                      <div className="h-9 w-full animate-pulse rounded-md bg-muted"></div>
                    ) : loggedInUser ? (
                       <p className="text-sm text-muted-foreground">Logged in as {loggedInUser.email}</p>
                      // In a real app, you might want a mobile-specific logout or profile link here
                      // For now, the UserNav dropdown would be on desktop only.
                      // Or, integrate a simpler logout button for mobile if UserNav is too complex here.
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
