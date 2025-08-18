// Summarizes insights from a HAR file, including security vulnerabilities and key data flows.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHarInsightsInputSchema = z.object({
  harData: z.string().describe('The HAR data as a JSON string.'),
});
export type SummarizeHarInsightsInput = z.infer<typeof SummarizeHarInsightsInputSchema>;

const SummarizeHarInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary report of the HAR file insights, including potential security vulnerabilities and key data flows.'),
  suggestedRequestIds: z.array(z.string()).describe('An array of entry IDs for requests that are key to the identified data flows or vulnerabilities.'),
});
export type SummarizeHarInsightsOutput = z.infer<typeof SummarizeHarInsightsOutputSchema>;

export async function summarizeHarInsights(input: SummarizeHarInsightsInput): Promise<SummarizeHarInsightsOutput> {
  return summarizeHarInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHarInsightsPrompt',
  input: {schema: SummarizeHarInsightsInputSchema},
  output: {schema: SummarizeHarInsightsOutputSchema},
  prompt: `You are an expert security analyst specializing in identifying vulnerabilities from HAR files.

  Analyze the provided HAR data and generate a summary report highlighting potential security vulnerabilities, key data flows, and the overall risk profile.

  Based on your analysis, identify the most critical requests that a developer should focus on when building an automation script. Return the \`entryId\` for each of these critical requests in the \`suggestedRequestIds\` array.

  HAR Data: {{{harData}}}`,
});

const summarizeHarInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeHarInsightsFlow',
    inputSchema: SummarizeHarInsightsInputSchema,
    outputSchema: SummarizeHarInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
