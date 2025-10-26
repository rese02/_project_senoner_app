'use server';

import { generateSeasonalMarketingIdeas, SeasonalMarketingIdeasInput } from '@/ai/flows/seasonal-marketing-ideas';
import { z } from 'zod';

const formSchema = z.object({
  season: z.string().min(1, 'Season is required.'),
  productDescription: z.string().min(10, 'Product description must be at least 10 characters.'),
});

type State = {
  success: boolean;
  ideas?: string[];
  error?: string;
};

export async function getMarketingIdeas(prevState: any, formData: FormData): Promise<State> {
  try {
    const validatedFields = formSchema.safeParse({
      season: formData.get('season'),
      productDescription: formData.get('productDescription'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const input: SeasonalMarketingIdeasInput = {
      season: validatedFields.data.season,
      productDescription: validatedFields.data.productDescription,
    };

    const result = await generateSeasonalMarketingIdeas(input);

    if (!result || !result.marketingIdeas) {
      return { success: false, error: 'Failed to generate ideas.' };
    }

    return { success: true, ideas: result.marketingIdeas };
  } catch (e: any) {
    return { success: false, error: e.message || 'An unexpected error occurred.' };
  }
}
