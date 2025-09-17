"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { CUSTOMER_TYPES, PRODUCTS, PACKAGE_SIZES } from "@/lib/pricing";

const itemSchema = z.object({
    packageSize: z.string().refine(val => PACKAGE_SIZES.some(s => s.value === val), "Invalid package size."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    product: z.string().refine(val => PRODUCTS.includes(val as any), "Invalid product."),
});

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required."),
  customerType: z.string().refine(val => CUSTOMER_TYPES.includes(val as any), "Invalid customer type."),
  items: z.array(itemSchema).min(1, "At least one item is required."),
});


function parseFormData(formData: FormData) {
    const customerName = formData.get('customerName') as string;
    const customerType = formData.get('customerType') as string;
    const items: any[] = [];
    
    const itemsData: Record<string, Record<string, any>> = {};

    for (const [key, value] of formData.entries()) {
        const match = key.match(/^items\[(\d+)\]\[(\w+)\]$/);
        if (match) {
            const [, index, field] = match;
            if (!itemsData[index]) {
                itemsData[index] = {};
            }
            itemsData[index][field] = value;
        }
    }

    for (const index in itemsData) {
        items.push(itemsData[index])
    }

    return { customerName, customerType, items };
}


export async function handleAddOrder(prevState: any, formData: FormData) {
  try {
    const rawData = parseFormData(formData);
    const parsed = formSchema.safeParse(rawData);

    if (!parsed.success) {
      console.log("Validation Errors:", parsed.error.flatten());
      return {
        ...prevState,
        message: "Invalid form data. Please check your inputs.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    
    const result = await api.addOrder(parsed.data);

    if (result.status === 'error') {
       return { 
        ...prevState,
        message: result.message, 
        errors: null,
      };
    }

    revalidatePath("/sales");
    revalidatePath("/invoices");
    revalidatePath("/store");
    revalidatePath("/");
    
    return {
      ...prevState,
      message: `Order created successfully. Invoice ID: ${result.invoice_id}`,
      data: { 
        invoice_id: result.invoice_id
      },
      errors: null,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Failed to create order.";
    return {
      ...prevState,
      message: errorMessage,
      errors: null,
      data: null,
    };
  }
}
