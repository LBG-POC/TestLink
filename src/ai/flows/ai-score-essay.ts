'use server';

/**
 * @fileOverview This file defines a Genkit flow for scoring essay responses using AI.
 *
 * - aiScoreEssay - An async function that takes an essay and subject, and returns the AI-scored result.
 * - AIScoreEssayInput - The input type for the aiScoreEssay function.
 * - AIScoreEssayOutput - The output type for the aiScoreEssay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIScoreEssayInputSchema = z.object({
  essay: z.string().describe('The essay to be scored.'),
  subject: z.string().describe('The subject of the essay.'),
});
export type AIScoreEssayInput = z.infer<typeof AIScoreEssayInputSchema>;

const AIScoreEssayOutputSchema = z.object({
  score: z.number().describe('The score of the essay (out of 100).'),
  feedback: z.string().describe('Feedback on the essay.'),
});
export type AIScoreEssayOutput = z.infer<typeof AIScoreEssayOutputSchema>;

export async function aiScoreEssay(input: AIScoreEssayInput): Promise<AIScoreEssayOutput> {
  return aiScoreEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiScoreEssayPrompt',
  input: {schema: AIScoreEssayInputSchema},
  output: {schema: AIScoreEssayOutputSchema},
  prompt: `You are an AI essay scoring assistant. You will be given an essay and a subject. You must score the essay out of 100, and provide feedback on the essay.

Subject: {{{subject}}}
Essay: {{{essay}}}

Please provide your score and feedback.`,
});

const aiScoreEssayFlow = ai.defineFlow(
  {
    name: 'aiScoreEssayFlow',
    inputSchema: AIScoreEssayInputSchema,
    outputSchema: AIScoreEssayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
