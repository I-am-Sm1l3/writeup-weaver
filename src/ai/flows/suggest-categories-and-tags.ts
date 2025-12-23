'use server';

/**
 * @fileOverview A flow to suggest categories and tags for a writeup based on its content.
 *
 * - suggestCategoriesAndTags - A function that takes writeup content as input and suggests categories and tags.
 * - SuggestCategoriesAndTagsInput - The input type for the suggestCategoriesAndTags function.
 * - SuggestCategoriesAndTagsOutput - The return type for the suggestCategoriesAndTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoriesAndTagsInputSchema = z.object({
  content: z.string().describe('The content of the writeup.'),
});
export type SuggestCategoriesAndTagsInput = z.infer<typeof SuggestCategoriesAndTagsInputSchema>;

const SuggestCategoriesAndTagsOutputSchema = z.object({
  categories: z.array(z.string()).describe('Suggested categories for the writeup.'),
  tags: z.array(z.string()).describe('Suggested tags for the writeup.'),
});
export type SuggestCategoriesAndTagsOutput = z.infer<typeof SuggestCategoriesAndTagsOutputSchema>;

export async function suggestCategoriesAndTags(input: SuggestCategoriesAndTagsInput): Promise<SuggestCategoriesAndTagsOutput> {
  return suggestCategoriesAndTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoriesAndTagsPrompt',
  input: {schema: SuggestCategoriesAndTagsInputSchema},
  output: {schema: SuggestCategoriesAndTagsOutputSchema},
  prompt: `You are an expert at categorizing and tagging technical writeups.
  Given the content of a writeup, suggest appropriate categories and tags.

  Content: {{{content}}}

  Format your response as a JSON object with "categories" and "tags" fields, each containing an array of strings.
  `,
});

const suggestCategoriesAndTagsFlow = ai.defineFlow(
  {
    name: 'suggestCategoriesAndTagsFlow',
    inputSchema: SuggestCategoriesAndTagsInputSchema,
    outputSchema: SuggestCategoriesAndTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
