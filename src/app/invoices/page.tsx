'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Printer, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import InvoiceTemplate from "./invoice-template";
import { Dialog, DialogContent, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import type { Invoice } from "@/lib/types";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

function InvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [detailedInvoice, setDetailedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      // If we already have items, no need to fetch again.
      if (invoice.items && invoice.items.length > 0) {
        setDetailedInvoice(invoice);
        return;
      }
      
      setIsLoading(true);
      try {
        const details = await api.getInvoiceDetails(invoice.id);
        setDetailedInvoice(details);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not fetch invoice details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [invoice]);

  return (
    <DialogContent className="sm:max-w-md p-0">
        {isLoading && <div className="p-8 text-center">Loading invoice details...</div>}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}
        {detailedInvoice && (
          <>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              <InvoiceTemplate invoice={detailedInvoice} />
            </div>
            
            <DialogFooter className="bg-muted/50 px-4 sm:px-6 py-3 border-t">
              <a
                href={`my.bluetoothprint.scheme://https://sajfoods.net/muraf/response.php?saleId=${detailedInvoice.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
                target="_blank"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print to Thermal
              </a>
            </DialogFooter>
          </>
        )}
    </DialogContent>
  );
}


export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const invoiceData = await api.getInvoices();
        setInvoices(invoiceData);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Invoices" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{invoice.invoice_date}</TableCell>
                    <TableCell className="text-right">₦{Number(invoice.grand_total).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm">
                            View Invoice
                          </Button>
                        </DialogTrigger>
                        <InvoiceDialog invoice={invoice} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {error ? "Could not fetch data." : "No invoices found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
