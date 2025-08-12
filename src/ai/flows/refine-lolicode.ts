
// Refines a LoliCode script for performance, readability, and security.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineLolicodeInputSchema = z.object({
  lolicode: z.string().describe('The LoliCode script to refine.'),
});
export type RefineLolicodeInput = z.infer<typeof RefineLolicodeInputSchema>;

const RefineLolicodeOutputSchema = z.object({
  refinedLolicode: z.string().describe('The refined LoliCode script.'),
});
export type RefineLolicodeOutput = z.infer<typeof RefineLolicodeOutputSchema>;

export async function refineLolicode(input: RefineLolicodeInput): Promise<RefineLolicodeOutput> {
  return refineLolicodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineLolicodePrompt',
  input: {schema: RefineLolicodeInputSchema},
  output: {schema: RefineLolicodeOutputSchema},
  prompt: `You are an expert LoliCode programmer. Analyze the provided LoliCode script and refine it for better performance, readability, and security.

  LoliCode Script:
  {{{lolicode}}}

  Return only the refined LoliCode script.`,
});

const refineLolicodeFlow = ai.defineFlow(
  {
    name: 'refineLolicodeFlow',
    inputSchema: RefineLolicodeInputSchema,
    outputSchema: RefineLolicodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
