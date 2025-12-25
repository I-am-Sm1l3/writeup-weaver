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
  prompt: `You are an AI expert in formatting text for technical writeups. You will receive text that may be partially formatted with Markdown.

Your task is to improve the formatting, but with these strict rules:
- **DO NOT** change or remove any existing Markdown formatting. If you see a line that is already a heading (e.g., starts with '##'), a list item (e.g., starts with '-'), or is inside a code block, you must leave it as is.
- **ONLY** add Markdown formatting to plain text that lacks structure. For example, turn unformatted lines into lists, code blocks, or headings where it is appropriate.
- **DO NOT** change the user's original wording or meaning.
- **DO NOT** use any HTML tags. Only return pure Markdown.

Apply these rules to the text below:
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
