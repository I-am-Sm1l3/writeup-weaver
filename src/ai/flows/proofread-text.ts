'use server';

/**
 * @fileOverview An AI agent that proofreads text for grammar, spelling, and clarity.
 *
 * - proofreadText - A function that handles the text proofreading process.
 * - ProofreadTextInput - The input type for the proofreadText function.
 * - ProofreadTextOutput - The return type for the proofreadText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProofreadTextInputSchema = z.object({
  text: z.string().describe('The text to be proofread.'),
});
export type ProofreadTextInput = z.infer<typeof ProofreadTextInputSchema>;

const ProofreadTextOutputSchema = z.object({
  proofreadText: z.string().describe('The proofread and corrected text.'),
});
export type ProofreadTextOutput = z.infer<typeof ProofreadTextOutputSchema>;

export async function proofreadText(input: ProofreadTextInput): Promise<ProofreadTextOutput> {
  return proofreadTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proofreadTextPrompt',
  input: {schema: ProofreadTextInputSchema},
  output: {schema: ProofreadTextOutputSchema},
  prompt: `You are an expert technical editor. You will receive a piece of text and your task is to proofread it for errors.

- Correct any spelling mistakes.
- Fix grammatical errors, including punctuation and sentence structure.
- Improve clarity and flow to make the text more readable and professional.
- DO NOT change the original meaning of the text.
- DO NOT add new content or information.
- DO NOT perform any markdown formatting (like adding headings, lists, or code blocks).

Return only the corrected text.

Text to proofread:
{{{text}}}`,
});

const proofreadTextFlow = ai.defineFlow(
  {
    name: 'proofreadTextFlow',
    inputSchema: ProofreadTextInputSchema,
    outputSchema: ProofreadTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
