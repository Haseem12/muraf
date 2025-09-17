'use server';

/**
 * @fileOverview Production calculation flow for maize flour and dussa outputs based on raw maize input.
 *
 * - calculateProduction - A function that calculates the production outputs.
 * - ProductionCalculationInput - The input type for the calculateProduction function.
 * - ProductionCalculationOutput - The return type for the calculateProduction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductionCalculationInputSchema = z.object({
  maizeInputKg: z
    .number()
    .describe('The amount of raw maize input in kilograms.'),
});
export type ProductionCalculationInput = z.infer<typeof ProductionCalculationInputSchema>;

const ProductionCalculationOutputSchema = z.object({
  cassavaRequiredKg: z
    .number()
    .describe('The calculated amount of cassava required in kilograms (13% of maize input).'),
  dussaOutputKg: z
    .number()
    .describe('The calculated output of Dussa in kilograms (30% of maize input).'),
  maizeFlourOutputKg: z
    .number()
    .describe('The calculated output of Maize Flour in kilograms (70% of maize input + 13% cassava input).'),
});
export type ProductionCalculationOutput = z.infer<typeof ProductionCalculationOutputSchema>;

export async function calculateProduction(input: ProductionCalculationInput): Promise<ProductionCalculationOutput> {
  return calculateProductionFlow(input);
}

const calculateProductionPrompt = ai.definePrompt({
  name: 'calculateProductionPrompt',
  input: {schema: ProductionCalculationInputSchema},
  output: {schema: ProductionCalculationOutputSchema},
  prompt: `You are an expert in maize flour production.
  Given the raw maize input, calculate the required cassava and the expected outputs of Dussa and Maize Flour.

  Maize Input: {{{maizeInputKg}}} kg

  - The amount of cassava required is 13% of the maize input.
  - The amount of Dussa produced is 30% of the maize input.
  - The amount of Maize Flour produced is the remaining 70% of the maize input plus the full amount of cassava required.

  Calculate the required cassava, the Dussa output, and the Maize Flour output in kilograms.
  Return all three calculated values.
  `,
});

const calculateProductionFlow = ai.defineFlow(
  {
    name: 'calculateProductionFlow',
    inputSchema: ProductionCalculationInputSchema,
    outputSchema: ProductionCalculationOutputSchema,
  },
  async input => {
    const {output} = await calculateProductionPrompt(input);
    return output!;
  }
);
