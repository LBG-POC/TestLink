// src/ai/flows/suggest-question-improvements.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests improvements to poorly-written or confusing test questions.
 *
 * - suggestQuestionImprovements - A function that takes a question as input and returns suggested improvements.
 * - SuggestQuestionImprovementsInput - The input type for the suggestQuestionImprovements function.
 * - SuggestQuestionImprovementsOutput - The return type for the suggestQuestionImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuestionImprovementsInputSchema = z.object({
  question: z.string().describe('The test question to be improved.'),
});

export type SuggestQuestionImprovementsInput = z.infer<
  typeof SuggestQuestionImprovementsInputSchema
>;

const SuggestQuestionImprovementsOutputSchema = z.object({
  improvedQuestion: z
    .string()
    .describe('The improved version of the test question.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested improvements.'),
});

export type SuggestQuestionImprovementsOutput = z.infer<
  typeof SuggestQuestionImprovementsOutputSchema
>;

export async function suggestQuestionImprovements(
  input: SuggestQuestionImprovementsInput
): Promise<SuggestQuestionImprovementsOutput> {
  return suggestQuestionImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuestionImprovementsPrompt',
  input: {schema: SuggestQuestionImprovementsInputSchema},
  output: {schema: SuggestQuestionImprovementsOutputSchema},
  prompt: `You are an expert test question writer. You will be given a test question, and you will suggest improvements to it to improve its clarity and validity.

Question: {{{question}}}

Respond with the improved question, and the reasoning behind the changes.  The improved question must still test the same underlying knowledge.
`,
});

const suggestQuestionImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestQuestionImprovementsFlow',
    inputSchema: SuggestQuestionImprovementsInputSchema,
    outputSchema: SuggestQuestionImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
