// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview A personalized learning plan generation AI agent.
 *
 * - generatePersonalizedLearningPlan - A function that handles the personalized learning plan generation process.
 * - GeneratePersonalizedLearningPlanInput - The input type for the generatePersonalizedLearningPlan function.
 * - GeneratePersonalizedLearningPlanOutput - The return type for the generatePersonalizedLearningPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedLearningPlanInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  performanceData: z
    .string()
    .describe(
      'The performance data of the student, including subjects, grades, and remarks from teachers.'
    ),
  gradeLevel: z.string().describe('The grade level of the student.'),
});
export type GeneratePersonalizedLearningPlanInput = z.infer<
  typeof GeneratePersonalizedLearningPlanInputSchema
>;

const GeneratePersonalizedLearningPlanOutputSchema = z.object({
  learningPlan: z
    .string()
    .describe(
      'A personalized learning plan for the student, including goals, activities, and resources.'
    ),
});
export type GeneratePersonalizedLearningPlanOutput = z.infer<
  typeof GeneratePersonalizedLearningPlanOutputSchema
>;

export async function generatePersonalizedLearningPlan(
  input: GeneratePersonalizedLearningPlanInput
): Promise<GeneratePersonalizedLearningPlanOutput> {
  return generatePersonalizedLearningPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedLearningPlanPrompt',
  input: {schema: GeneratePersonalizedLearningPlanInputSchema},
  output: {schema: GeneratePersonalizedLearningPlanOutputSchema},
  prompt: `You are an AI assistant designed to generate personalized learning plans for students.

  Based on the student's name, performance data, and grade level, create a personalized learning plan that includes goals, activities, and resources.

  Student Name: {{{studentName}}}
  Performance Data: {{{performanceData}}}
  Grade Level: {{{gradeLevel}}}
  `,
});

const generatePersonalizedLearningPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedLearningPlanFlow',
    inputSchema: GeneratePersonalizedLearningPlanInputSchema,
    outputSchema: GeneratePersonalizedLearningPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
