
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, CreditCard, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/config"
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import React, { useEffect, useState } from "react"

interface AppUser {
  name: string | null;
  email: string | null;
  avatarUrl?: string;
  initials: string;
  role: "Admin" | "Parent" | "Unknown";
}

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        const role = user.email && user.email.toLowerCase().includes('admin') ? "Admin" : "Parent";
        const displayName = user.displayName || user.email?.split('@')[0] || "User";
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || "U";

        setCurrentUser({
          name: displayName,
          email: user.email,
          initials: initials,
          role: role,
          avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=${initials}`,
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  const profileLink = currentUser.role === "Admin" ? "/admin/profile" : "/parent/profile";
  const settingsLink = "/admin/settings"; // Assuming only admin has general settings
  const dashboardLink = currentUser.role === "Admin" ? "/admin/dashboard" : "/parent/dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {currentUser.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name || ""} data-ai-hint="user avatar" />}
            <AvatarFallback>{currentUser.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {(currentUser.role === "Admin" || currentUser.role === "Parent") && (
            <DropdownMenuItem asChild>
               <Link href={dashboardLink}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={profileLink}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          {currentUser.role === "Admin" && (
            <DropdownMenuItem asChild>
               <Link href={settingsLink}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          )}
           <DropdownMenuItem disabled>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
