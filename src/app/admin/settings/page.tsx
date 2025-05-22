
"use client";

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>, formName: string) => {
    event.preventDefault();
    // const formData = new FormData(event.currentTarget);
    // const data = Object.fromEntries(formData.entries());
    // console.log(`${formName} data:`, data);
    
    toast({
      title: "Placeholder Action",
      description: `${formName} save functionality is not yet implemented.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Administrator Settings"
        description="Manage application configurations and preferences."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure basic application settings. (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "General Settings")}>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" name="schoolName" defaultValue="CampusConnect Academy" />
              </div>
              <div>
                <Label htmlFor="academicYear">Current Academic Year</Label>
                <Input id="academicYear" name="academicYear" defaultValue="2024-2025" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode" className="flex flex-col space-y-1">
                  <span>Maintenance Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Temporarily disable access for non-admins.
                  </span>
                </Label>
                <Switch id="maintenanceMode" name="maintenanceMode" aria-label="Maintenance mode" />
              </div>
              <div className="flex justify-end">
                  <Button type="submit">Save General Settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage how notifications are sent. (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => handleFormSubmit(e, "Notification Settings")}>
               <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enable or disable email alerts for important events.
                  </span>
                </Label>
                <Switch id="emailNotifications" name="emailNotifications" defaultChecked aria-label="Email notifications" />
              </div>
               <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications" className="flex flex-col space-y-1">
                  <span>SMS Notifications</span>
                   <span className="font-normal leading-snug text-muted-foreground">
                    Enable or disable SMS alerts (requires integration).
                  </span>
                </Label>
                <Switch id="smsNotifications" name="smsNotifications" aria-label="SMS notifications" />
              </div>
              <div>
                <Label htmlFor="adminEmail">Default Admin Email for Notifications</Label>
                <Input id="adminEmail" name="adminEmail" type="email" defaultValue="admin@campusconnect.edu" />
              </div>
               <div className="flex justify-end">
                  <Button type="submit">Save Notification Settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
