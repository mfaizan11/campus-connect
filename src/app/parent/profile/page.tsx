
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';

export default function ParentProfilePage() {
  const { toast } = useToast();

  // Placeholder data
  const parentUser = {
    name: "Jamie Johnson",
    email: "jamie@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, USA",
    avatarUrl: "https://placehold.co/150x150.png",
    initials: "JJ",
    childName: "Alex Johnson",
    childGrade: "Grade 5"
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
        description="View and manage your profile and contact information."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="items-center text-center">
               <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                <AvatarImage src={parentUser.avatarUrl} alt={parentUser.name} data-ai-hint="parent avatar" />
                <AvatarFallback className="text-3xl">{parentUser.initials}</AvatarFallback>
              </Avatar>
              <CardTitle>{parentUser.name}</CardTitle>
              <CardDescription>Parent of {parentUser.childName} ({parentUser.childGrade})</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={handleChangeProfilePicture}>Change Profile Picture</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your contact details. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "Contact Information")}>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={parentUser.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" defaultValue={parentUser.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={parentUser.phone} />
                </div>
                <div>
                  <Label htmlFor="address">Home Address</Label>
                  <Input id="address" name="address" defaultValue={parentUser.address} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Update Information</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences. (Placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "Account Settings")}>
                <div>
                  <Label htmlFor="currentPassword">Current Password (for changes)</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" placeholder="Enter current password to make changes"/>
                </div>
                 <div>
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <Input id="newPassword" name="newPassword" type="password" placeholder="Enter new password"/>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Account Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
