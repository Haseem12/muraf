export type InventoryItem = {
  id: string;
  name: "Maize" | "Cassava" | "Packaging" | "Other";
  quantity: number;
  unit: "kg" | "bags" | "pcs";
};

export type FinishedGood = {
  id: string;
  name: "Maize Flour" | "Dussa";
  quantity: number;
  unit: "kg";
  unitPrice: number;
};

export type ProductionBatch = {
  id: string;
  date: string;
  maize_input: number;
  cassava_input: number;
  maize_flour_output: number;
  dussa_output: number;
  status: "Completed" | "In Progress";
};

export type SalesOrder = {
  id: string;
  customer_name: string;
  product_name: "Maize Flour" | "Dussa";
  package_size: number;
  quantity: number; // number of packages
  total_kg: number;
  total_price: number;
  order_date: string;
};

export type Invoice = {
  id: string;
  customer_name: string;
  invoice_date: string;
  items: {
    id: string;
    product_name: string;
    package_size: number;
    quantity: number;
    total_kg: number;
    total_price: number;
    product_description?: string;
    total?: number;
  }[];
  subtotal: number;
  grand_total: number;
};

export interface DashboardData {
  total_raw_material: number;
  total_finished_goods: number;
  total_sales_value: number;
  active_customers: number;
  sales_count: number;
  recent_sales: any[];
}
