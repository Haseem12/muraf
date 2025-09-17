"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

const schema = z.object({
  material: z.enum(["Maize", "Cassava", "Packaging", "Other"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit: z.enum(["kg", "bags", "pcs"]),
});

export async function handleAddMaterial(prevState: any, formData: FormData) {
  try {
    const parsed = schema.safeParse({
      material: formData.get("material"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
    });

    if (!parsed.success) {
      return {
        message: "Invalid form data.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    
    const result = await api.addMaterial(parsed.data);

    if (result.status === 'error') {
        return { message: result.message, errors: null, data: null };
    }
    
    revalidatePath("/store");

    return {
      message: `${parsed.data.quantity}${parsed.data.unit} of ${parsed.data.material} added successfully.`,
      data: parsed.data,
      errors: null,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to add material.";
    return {
      message: errorMessage,
      errors: null,
      data: null,
    };
  }
}
