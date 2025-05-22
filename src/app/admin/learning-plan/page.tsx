"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Send, Loader2 } from 'lucide-react';
import { generatePersonalizedLearningPlanAction, type FormState } from "./actions";

const initialState: FormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Generate Plan
        </>
      )}
    </Button>
  );
}

export default function LearningPlanPage() {
  const [formState, formAction] = useFormState(generatePersonalizedLearningPlanAction, initialState);
  const [learningPlanResult, setLearningPlanResult] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (formState.learningPlan) {
      setLearningPlanResult(formState.learningPlan);
    } else {
      // Clear previous result if form submission failed or didn't produce a plan
      setLearningPlanResult(undefined);
    }
  }, [formState]);

  return (
    <>
      <PageHeader 
        title="Personalized Learning Plan AI"
        description="Generate AI-powered learning suggestions based on student data."
      />
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Student Details
            </CardTitle>
            <CardDescription>Enter the student's information to generate a personalized learning plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input 
                  id="studentName" 
                  name="studentName" 
                  placeholder="e.g., Jane Doe" 
                  defaultValue={formState.fields?.studentName}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input 
                  id="gradeLevel" 
                  name="gradeLevel" 
                  placeholder="e.g., Grade 10" 
                  defaultValue={formState.fields?.gradeLevel}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="performanceData">Performance Data</Label>
                <Textarea
                  id="performanceData"
                  name="performanceData"
                  placeholder="e.g., Math: B+, Science: A, English: B. Teacher remarks: 'Shows strong analytical skills but needs improvement in essay writing.'"
                  rows={6}
                  defaultValue={formState.fields?.performanceData}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Include subjects, grades, and remarks from teachers.</p>
              </div>
              
              {formState.message && !formState.learningPlan && (
                <Alert variant={formState.issues ? "destructive" : "default"}>
                  <AlertTitle>{formState.issues ? "Error!" : "Status"}</AlertTitle>
                  <AlertDescription>
                    {formState.message}
                    {formState.issues && (
                      <ul className="list-disc list-inside mt-1">
                        {formState.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Generated Learning Plan</CardTitle>
            <CardDescription>The AI-suggested learning plan will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {learningPlanResult ? (
              <div className="prose prose-sm max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap">
                <h3 className="font-semibold text-foreground">Personalized Plan for {formState.fields?.studentName || "the student"}:</h3>
                <p>{learningPlanResult}</p>
              </div>
            ) : (
               formState.message && formState.learningPlan ? ( // This case means success message is shown, plan is ready
                 <Alert variant="default">
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>{formState.message}</AlertDescription>
                 </Alert>
               ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                  <p>Submit the form to generate a learning plan.</p>
                </div>
               )
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
