
// @/lib/api.ts
import { handleApiRequest } from '@/app/api/muraf/route';
import { calculateItemPrice, CustomerType, PackageSizeValue } from '@/lib/pricing';

const API_ROUTE = "/api/muraf";

async function fetchFromApi(action: string, data?: any) {
  const body = data !== undefined ? { action, data } : { action };

  if (typeof window === 'undefined') {
    return handleApiRequest(body);
  }

  try {
    const response = await fetch(API_ROUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API proxy error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`The server returned an error: ${response.statusText}. Check the server logs for more details.`);
    }

    const text = await response.text();
    if (!text) {
        return { status: 'success', message: 'Operation successful with no content.' };
    }
    
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse API response JSON:", text);
        throw new Error("Received an invalid response from the server.");
    }
    
    if (json.status === 'error') {
      throw new Error(json.message || 'An unknown API error occurred');
    }

    return json;

  } catch (error) {
    console.error(`API Error on action "${action}":`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown network or parsing error occurred.');
  }
}


// Define all the API functions
export const api = {
    login: (credentials: any) => fetchFromApi('login', credentials),

    seedUsers: () => fetchFromApi('seed_users'),

    getDashboardData: () => fetchFromApi('get_dashboard_data'),
    
    getInventory: () => fetchFromApi('get_inventory'),

    addMaterial: (materialData: any) => fetchFromApi('add_material', materialData),
    
    getProductionHistory: () => fetchFromApi('get_production_history'),

    recordProduction: (productionData: any) => {
        const today = new Date().toISOString().split('T')[0];
        return fetchFromApi('record_production', {
            ...productionData,
            date: today,
        });
    },

    getSales: () => fetchFromApi('get_sales'),

    addOrder: async (orderData: { customerName: string; customerType: CustomerType; items: any[] }) => {
        const { customerName, customerType, items } = orderData;
        const orderDate = new Date().toISOString().split('T')[0];
        
        const processedItems = items.map(item => {
            const pricePerPackage = calculateItemPrice(customerType, item.packageSize as PackageSizeValue);
            // Extracts the number from strings like "5" or "5-spc"
            const numericPackageSize = parseInt(item.packageSize.split('-')[0], 10); 
            const totalKg = numericPackageSize * Number(item.quantity);
            
            return {
                ...item,
                packageSize: item.packageSize, // e.g., "5", "5-spc"
                product: item.product || "Maize Flour", // Default to Maize Flour
                total_kg: totalKg,
                total_price: Number(item.quantity) * pricePerPackage,
            }
        });

        const payload = {
            customerName: customerName,
            customerType: customerType,
            order_date: orderDate,
            items: processedItems,
        };
        
        return fetchFromApi('add_order', payload);
    },

    getInvoices: () => fetchFromApi('get_invoices'),

    getInvoiceDetails: (invoiceId: string | number) => fetchFromApi('get_invoice_details', { id: invoiceId }),
};
