'use server';

/**
 * @fileOverview An AI agent that formats text, inferring intent and creating lists, code sections, and headings.
 *
 * - formatTextWithAI - A function that handles the text formatting process.
 * - FormatTextWithAIInput - The input type for the formatTextWithAI function.
 * - FormatTextWithAIOutput - The return type for the formatTextWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatTextWithAIInputSchema = z.object({
  text: z.string().describe('The text to be formatted.'),
});
export type FormatTextWithAIInput = z.infer<typeof FormatTextWithAIInputSchema>;

const FormatTextWithAIOutputSchema = z.object({
  formattedText: z.string().describe('The formatted text.'),
});
export type FormatTextWithAIOutput = z.infer<typeof FormatTextWithAIOutputSchema>;

export async function formatTextWithAI(input: FormatTextWithAIInput): Promise<FormatTextWithAIOutput> {
  return formatTextWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatTextWithAIPrompt',
  input: {schema: FormatTextWithAIInputSchema},
  output: {schema: FormatTextWithAIOutputSchema},
  prompt: `You are an AI expert in formatting text. You will receive plain text and you will format it appropriately, inferring the user\'s intent.  Create lists, code sections, and headings as appropriate to improve the readability and structure of the text. Return only the formatted text.

Text to format:
{{{text}}}`,
});

const formatTextWithAIFlow = ai.defineFlow(
  {
    name: 'formatTextWithAIFlow',
    inputSchema: FormatTextWithAIInputSchema,
    outputSchema: FormatTextWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
