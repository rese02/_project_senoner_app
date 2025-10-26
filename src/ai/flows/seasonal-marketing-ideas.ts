'use server';

/**
 * @fileOverview Seasonal marketing ideas generator.
 *
 * - generateSeasonalMarketingIdeas - A function that generates seasonal marketing ideas.
 * - SeasonalMarketingIdeasInput - The input type for the generateSeasonalMarketingIdeas function.
 * - SeasonalMarketingIdeasOutput - The return type for the generateSeasonalMarketingIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeasonalMarketingIdeasInputSchema = z.object({
  season: z.string().describe('The current season (e.g., Spring, Summer, Autumn, Winter).'),
  productDescription: z.string().describe('Description of products for which marketing ideas are needed.'),
});

export type SeasonalMarketingIdeasInput = z.infer<typeof SeasonalMarketingIdeasInputSchema>;

const SeasonalMarketingIdeasOutputSchema = z.object({
  marketingIdeas: z.array(z.string()).describe('An array of marketing ideas for the given season and products.'),
});

export type SeasonalMarketingIdeasOutput = z.infer<typeof SeasonalMarketingIdeasOutputSchema>;

export async function generateSeasonalMarketingIdeas(
  input: SeasonalMarketingIdeasInput
): Promise<SeasonalMarketingIdeasOutput> {
  return seasonalMarketingIdeasFlow(input);
}

const seasonalMarketingIdeasPrompt = ai.definePrompt({
  name: 'seasonalMarketingIdeasPrompt',
  input: {schema: SeasonalMarketingIdeasInputSchema},
  output: {schema: SeasonalMarketingIdeasOutputSchema},
  prompt: `You are a marketing expert specializing in seasonal promotions.

  Generate a list of marketing ideas for the following season and product description.

  Season: {{{season}}}
  Product Description: {{{productDescription}}}

  Provide at least 3 marketing ideas.
  Format the output as a JSON array of strings.
  `,
});

const seasonalMarketingIdeasFlow = ai.defineFlow(
  {
    name: 'seasonalMarketingIdeasFlow',
    inputSchema: SeasonalMarketingIdeasInputSchema,
    outputSchema: SeasonalMarketingIdeasOutputSchema,
  },
  async input => {
    const {output} = await seasonalMarketingIdeasPrompt(input);
    return output!;
  }
);
