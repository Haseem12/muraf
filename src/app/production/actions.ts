"use server";

import { z } from "zod";
import { calculateProduction } from "@/ai/flows/production-calculation";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

const calculationSchema = z.object({
  maizeInputKg: z.coerce.number().min(1, "Maize input must be at least 1 kg."),
});

export async function handleProductionCalculation(prevState: any, formData: FormData) {
  try {
    const parsed = calculationSchema.safeParse({
      maizeInputKg: formData.get("maizeInputKg"),
    });

    if (!parsed.success) {
      return {
        ...prevState,
        message: "Invalid form data.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const result = await calculateProduction(parsed.data);

    // Check inventory after getting calculation results
    const inventory = await api.getInventory();
    const maizeStock = inventory.find((item: any) => item.name === 'Maize')?.quantity || 0;
    const cassavaStock = inventory.find((item: any) => item.name === 'Cassava')?.quantity || 0;

    if (parsed.data.maizeInputKg > maizeStock) {
        return {
             ...prevState,
             message: `Not enough Maize in stock. Required: ${parsed.data.maizeInputKg}kg, Available: ${maizeStock}kg`,
             errors: { maizeInputKg: [`Insufficient maize stock. Available: ${maizeStock}kg`] },
        }
    }
     if (result.cassavaRequiredKg > cassavaStock) {
        return {
             ...prevState,
             message: `Not enough Cassava in stock. Required: ${result.cassavaRequiredKg}kg, Available: ${cassavaStock}kg`,
             errors: null, // No specific field to attach this to
        }
    }


    return {
      ...prevState,
      message: "Calculation successful.",
      data: {
        inputs: parsed.data,
        outputs: result
      },
      errors: null
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during calculation.';
    return {
      ...prevState,
      message: `Calculation failed: ${errorMessage}`,
      errors: null,
      data: null,
    };
  }
}

const recordSchema = z.object({
  maizeInput: z.coerce.number(),
  cassavaInput: z.coerce.number(),
  maizeFlourOutput: z.coerce.number(),
  dussaOutput: z.coerce.number(),
});

export async function handleRecordProduction(prevState: any, formData: FormData) {
    try {
        const parsed = recordSchema.safeParse({
            maizeInput: formData.get("maizeInput"),
            cassavaInput: formData.get("cassavaInput"),
            maizeFlourOutput: formData.get("maizeFlourOutput"),
            dussaOutput: formData.get("dussaOutput"),
        });

        if (!parsed.success) {
            return {
                message: "Invalid production data.",
                recorded: false,
            }
        }
        
        // Final inventory check before recording
        const inventory = await api.getInventory();
        const maizeStock = inventory.find((item: any) => item.name === 'Maize')?.quantity || 0;
        const cassavaStock = inventory.find((item: any) => item.name === 'Cassava')?.quantity || 0;

        if (parsed.data.maizeInput > maizeStock) {
            return { message: `Not enough Maize in stock to record production.`, recorded: false };
        }
        if (parsed.data.cassavaInput > cassavaStock) {
            return { message: `Not enough Cassava in stock to record production.`, recorded: false };
        }


        const result = await api.recordProduction(parsed.data);
        
        if (result.status === 'error') {
            return { message: result.message, recorded: false };
        }

        revalidatePath("/production");
        revalidatePath("/store");
        revalidatePath("/");


        return {
            message: "Production recorded successfully!",
            recorded: true,
        }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to record production.";
        return {
            message: errorMessage,
            recorded: false
        }
    }
}
