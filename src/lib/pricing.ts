
export const CUSTOMER_TYPES = ["Distributor", "Sales Representative", "Other Customers"] as const;
export type CustomerType = typeof CUSTOMER_TYPES[number];

export const PRODUCTS = ["Maize Flour", "Dussa"] as const;
export type Product = typeof PRODUCTS[number];

export const PACKAGE_SIZES = [
    { value: '1', label: '1 KG' },
    { value: '2', label: '2 KG' },
    { value: '5', label: '5 KG' },
    { value: '5-spc', label: '5 KG SPC' },
    { value: '10', label: '10 KG' },
    { value: '25', label: '25 KG' },
    { value: '50', label: '50 KG' },
] as const;

export type PackageSizeValue = typeof PACKAGE_SIZES[number]['value'];

type PriceStructure = {
    [key in CustomerType]: {
        [key in PackageSizeValue]: number;
    }
}

// All prices are per package, not per KG.
export const PRICES: PriceStructure = {
    "Distributor": {
        "1": 700,
        "2": 1350,
        "5": 3500,
        "5-spc": 4000,
        "10": 7500,
        "25": 16500,
        "50": 33000,
    },
    "Sales Representative": {
        "1": 750,
        "2": 1400,
        "5": 3600,
        "5-spc": 4100,
        "10": 7600,
        "25": 16700,
        "50": 33400,
    },
    "Other Customers": {
        "1": 800,
        "2": 1500,
        "5": 3700,
        "5-spc": 4500,
        "10": 7800,
        "25": 17000,
        "50": 34000,
    }
};

/**
 * Calculates the price for a single package based on customer type and package size.
 * @param customerType - The type of customer.
 * @param packageSize - The size of the package (e.g., "1", "5-spc").
 * @returns The price for one package.
 */
export function calculateItemPrice(customerType: CustomerType, packageSize: PackageSizeValue): number {
    if (!PRICES[customerType] || PRICES[customerType][packageSize] === undefined) {
        console.error(`Price not found for customerType: ${customerType}, packageSize: ${packageSize}`);
        return 0; // Return 0 or throw an error if a price is not defined
    }
    return PRICES[customerType][packageSize];
}
