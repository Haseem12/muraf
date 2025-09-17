
import type { InventoryItem, FinishedGood, ProductionBatch, SalesOrder, Invoice, DashboardData } from './types';

export const mockDashboardData: DashboardData = {
  total_raw_material: 12500,
  total_finished_goods: 8500,
  total_sales_value: 1250000,
  active_customers: 12,
  sales_count: 23,
  recent_sales: [
    { id: '1', customer_name: 'Alhaji Musa', product_name: 'Maize Flour', total_price: 75000, order_date: '2024-07-22' },
    { id: '2', customer_name: 'Madam Grace', product_name: 'Maize Flour', total_price: 50000, order_date: '2024-07-21' },
    { id: '3-dussa', customer_name: 'Mr. Okoro', product_name: 'Dussa', total_price: 25000, order_date: '2024-07-21' },
  ]
};

export const inventory: InventoryItem[] = [
    { id: '1', name: 'Maize', quantity: 12500, unit: 'kg' },
    { id: '2', name: 'Cassava', quantity: 3500, unit: 'kg' },
    { id: '3', name: 'Packaging', quantity: 500, unit: 'bags' },
];

export const finishedGoods: FinishedGood[] = [
    { id: '1', name: 'Maize Flour', quantity: 7000, unit: 'kg', unitPrice: 1000 },
    { id: '2', name: 'Dussa', quantity: 1500, unit: 'kg', unitPrice: 200 },
];

export const productionBatches: ProductionBatch[] = [
    { id: '1', date: '2024-07-22', maize_input: 5000, cassava_input: 650, maize_flour_output: 4150, dussa_output: 1500, status: 'Completed' },
    { id: '2', date: '2024-07-20', maize_input: 3000, cassava_input: 390, maize_flour_output: 2490, dussa_output: 900, status: 'Completed' },
];

export const sales: SalesOrder[] = [
    { id: '1', customer_name: 'Alhaji Musa', product_name: 'Maize Flour', package_size: 10, quantity: 5, total_kg: 50, total_price: 50000, order_date: '2024-07-22' },
    { id: '2', customer_name: 'Madam Grace', product_name: 'Maize Flour', package_size: 5, quantity: 10, total_kg: 50, total_price: 50000, order_date: '2024-07-21' },
    { id: '3', customer_name: 'Mr. Okoro', product_name: 'Dussa', package_size: 25, quantity: 2, total_kg: 50, total_price: 10000, order_date: '2024-07-21' },
];

const mockInvoiceItems = [
    { id: 'item1', product_name: 'Maize Flour', package_size: 10, quantity: 5, total_kg: 50, total_price: 50000 },
    { id: 'item2', product_name: 'Maize Flour', package_size: 5, quantity: 10, total_kg: 50, total_price: 50000 },
];

export const invoices: Invoice[] = [
    {
        id: 'INV-001',
        customer_name: 'Alhaji Musa',
        invoice_date: '2024-07-22',
        subtotal: 100000,
        tax: 5000,
        grand_total: 105000,
        items: mockInvoiceItems,
    },
     {
        id: 'INV-002',
        customer_name: 'Madam Grace',
        invoice_date: '2024-07-21',
        subtotal: 50000,
        tax: 2500,
        grand_total: 52500,
        items: [mockInvoiceItems[1]],
    },
];
