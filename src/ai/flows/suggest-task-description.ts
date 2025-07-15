'use server';

/**
 * @fileOverview Task description suggestion flow using generative AI.
 * 
 * - suggestTaskDescription - A function that suggests task descriptions.
 * - SuggestTaskDescriptionInput - The input type for the suggestTaskDescription function.
 * - SuggestTaskDescriptionOutput - The return type for the suggestTaskDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskDescriptionInputSchema = z.object({
  taskSummary: z
    .string()
    .describe('A brief summary of the task for which a description is needed.'),
});
export type SuggestTaskDescriptionInput = z.infer<
  typeof SuggestTaskDescriptionInputSchema
>;

const SuggestTaskDescriptionOutputSchema = z.object({
  suggestedDescription: z
    .string()
    .describe('An AI-suggested detailed description of the task.'),
});
export type SuggestTaskDescriptionOutput = z.infer<
  typeof SuggestTaskDescriptionOutputSchema
>;

export async function suggestTaskDescription(
  input: SuggestTaskDescriptionInput
): Promise<SuggestTaskDescriptionOutput> {
  return suggestTaskDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDescriptionPrompt',
  input: {schema: SuggestTaskDescriptionInputSchema},
  output: {schema: SuggestTaskDescriptionOutputSchema},
  prompt: `You are an AI assistant designed to help users create detailed task descriptions.

  Based on the following summary of the task, generate a detailed and helpful description:
  {{taskSummary}}`,
});

const suggestTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestTaskDescriptionFlow',
    inputSchema: SuggestTaskDescriptionInputSchema,
    outputSchema: SuggestTaskDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
