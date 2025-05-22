// @ts-nocheck
// This is an example of how to use the AI flow.
// IMPORTANT: In a real application, you would add authentication and authorization checks here.
// For example, ensure that only authorized admins can call this action.
// For simplicity, these checks are omitted in this example.
"use server";

import { generatePersonalizedLearningPlan as generatePlanFlow, type GeneratePersonalizedLearningPlanInput } from "@/ai/flows/generate-personalized-learning-plan";
import { z } from "zod";

const learningPlanSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  performanceData: z.string().min(10, "Performance data must be at least 10 characters"),
  gradeLevel: z.string().min(1, "Grade level is required"),
});

export interface FormState {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  learningPlan?: string;
}

export async function generatePersonalizedLearningPlanAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = learningPlanSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Invalid form data",
      issues,
      fields: formData as Record<string, string>,
    };
  }

  try {
    const input: GeneratePersonalizedLearningPlanInput = {
      studentName: parsed.data.studentName,
      performanceData: parsed.data.performanceData,
      gradeLevel: parsed.data.gradeLevel,
    };
    
    // This is where you would call your AI flow
    // Ensure the AI flow is correctly imported and configured.
    const result = await generatePlanFlow(input);

    if (result && result.learningPlan) {
      return {
        message: "Learning plan generated successfully!",
        learningPlan: result.learningPlan,
      };
    } else {
      return {
        ...prevState, // Keep previous form data if any
        message: "Failed to generate learning plan. The AI model might not have returned the expected output.",
        fields: parsed.data,
      };
    }

  } catch (e) {
    console.error("Error generating learning plan:", e);
    return {
      message: "An unexpected error occurred while generating the learning plan. Please try again later.",
      fields: parsed.data,
      issues: [e instanceof Error ? e.message : "Unknown error"],
    };
  }
}
