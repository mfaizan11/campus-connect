
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';

export default function AdminProfilePage() {
  const { toast } = useToast();

  // Placeholder data
  const adminUser = {
    name: "Admin User",
    email: "admin@campusconnect.edu",
    role: "Super Administrator",
    avatarUrl: "https://placehold.co/150x150.png",
    initials: "AU"
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>, formName: string) => {
    event.preventDefault();
    // const formData = new FormData(event.currentTarget);
    // const data = Object.fromEntries(formData.entries());
    // console.log(`${formName} data:`, data);

    toast({
      title: "Placeholder Action",
      description: `${formName} update functionality is not yet implemented.`,
    });
  };
  
  const handleChangeProfilePicture = () => {
    toast({
      title: "Placeholder Action",
      description: "Change profile picture functionality is not yet implemented.",
    });
  };


  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and manage your administrator profile information."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="items-center text-center">
               <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} data-ai-hint="admin avatar" />
                <AvatarFallback className="text-3xl">{adminUser.initials}</AvatarFallback>
              </Avatar>
              <CardTitle>{adminUser.name}</CardTitle>
              <CardDescription>{adminUser.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={handleChangeProfilePicture}>Change Profile Picture</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "Personal Information")}>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={adminUser.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" defaultValue={adminUser.email} />
                </div>
                <div>
                  <Label htmlFor="role">Role (Read-only)</Label>
                  <Input id="role" name="role" defaultValue={adminUser.role} readOnly className="bg-muted/50" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Update Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "Password")}>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Change Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
