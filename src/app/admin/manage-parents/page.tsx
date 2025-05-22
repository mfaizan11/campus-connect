
"use client";

import { useState } from 'react';
import type React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Send, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable, type HttpsCallableResult, type Functions } from 'firebase/functions';
import { app } from '@/lib/firebase/config'; // Ensure app is imported for getFunctions

// Initialize Firebase Functions
let functionsInstance: Functions | null = null;
if (app) {
  try {
    functionsInstance = getFunctions(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Functions:", error);
    // The UI will show a message if functionsInstance remains null
  }
}

export default function ManageParentsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!parentEmail || !parentPassword) {
      toast({
        title: "Validation Error",
        description: "Please provide both parent email and a temporary password.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!functionsInstance) {
      toast({
        title: "Configuration Error",
        description: "Firebase Functions is not initialized. Please check your Firebase setup and console for errors.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Name of your deployed Firebase Function
    const createParentUserCallable = httpsCallable(functionsInstance, 'createParentUserInAuth');

    try {
      // Call the function
      const result = await createParentUserCallable({ email: parentEmail, password: parentPassword }) as HttpsCallableResult<{ success: boolean, message: string, uid?: string }>;
      
      if (result.data.success) {
        toast({
          title: "Parent Account Created",
          description: result.data.message || `Account for ${parentEmail} successfully created via backend function.`,
        });
        setParentEmail('');
        setParentPassword('');
      } else {
        // This case means the function executed but returned success: false from your function's logic
        toast({
          title: "Account Creation Failed",
          description: result.data.message || "The backend function reported an issue. Please check server logs.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error calling createParentUserInAuth function:", error);
      let errorMessage = "Failed to create parent account. Please try again.";
      // Check for specific Firebase Functions error codes
      if (error.code === 'functions/not-found') {
        errorMessage = "The backend function (createParentUserInAuth) is not deployed or not found. Please ensure it's implemented and deployed correctly in your Firebase Functions environment.";
      } else if (error.code === 'functions/unavailable') {
         errorMessage = "The Firebase Functions service is currently unavailable. Please try again later.";
      } else if (error.code === 'functions/internal') {
        errorMessage = "An internal error occurred in the backend function. Check Firebase Functions logs for details.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}. (Code: ${error.code || 'N/A'})`;
      }
      toast({
        title: "Error Creating Parent Account",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Parent Users"
        description="Create parent accounts for portal access."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create Parent User Account</CardTitle>
          <CardDescription>
            Fill in the details below to create a new parent user account. This will attempt to call a secure backend function.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">How this works</AlertTitle>
            <AlertDescription className="text-primary/80">
              Submitting this form will attempt to call a secure Firebase Function named <code>createParentUserInAuth</code>.
              This function (which you need to implement and deploy in your Firebase project using the Admin SDK) will create the parent's user account in Firebase Authentication.
              The parent should be instructed to change their temporary password upon first login.
              If the function is not yet deployed or if there's an error, an appropriate message will be shown.
            </AlertDescription>
          </Alert>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="parentEmail">Parent's Email Address *</Label>
              <Input 
                id="parentEmail" 
                name="parentEmail" 
                type="email" 
                placeholder="e.g., parent@example.com" 
                required 
                disabled={isSubmitting}
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)} 
              />
               <p className="text-xs text-muted-foreground mt-1">This email will be used by the parent to log in.</p>
            </div>
            <div>
              <Label htmlFor="parentPassword">Temporary Password *</Label>
              <Input 
                id="parentPassword" 
                name="parentPassword" 
                type="text" 
                placeholder="Enter a strong temporary password" 
                required 
                disabled={isSubmitting}
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">The parent should be instructed to change this password after their first login.</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !functionsInstance}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Create Parent Account
                  </>
                )}
              </Button>
            </div>
          </form>
          {!functionsInstance && (
             <Alert variant="destructive" className="mt-4">
                <AlertTitle>Firebase Functions Not Initialized</AlertTitle>
                <AlertDescription>
                 Could not initialize Firebase Functions. This might be due to an issue with your Firebase project setup or configuration in <code>src/lib/firebase/config.ts</code>. Please check the browser console for more specific errors.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}
