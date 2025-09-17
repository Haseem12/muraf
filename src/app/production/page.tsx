'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import ProductionCalculator from "./production-calculator";
import { useEffect, useState } from "react";
import type { ProductionBatch } from "@/lib/types";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProductionPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const productionBatches = await api.getProductionHistory();
      setBatches(productionBatches);
    } catch (error) {
      console.error("Failed to fetch production history:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionHistory();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Production"
        action={<ProductionCalculator onProductionRecorded={fetchProductionHistory} />}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Production History</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Production History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Maize Input (kg)</TableHead>
                <TableHead className="text-right">Flour Output (kg)</TableHead>
                <TableHead className="text-right">Dussa Output (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : batches.length > 0 ? (
                batches.map((batch: any) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.date}</TableCell>
                    <TableCell>
                      <Badge variant={batch.status === 'Completed' ? 'default' : 'secondary'} className="bg-green-200 text-green-800">
                        {batch.status || 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{Number(batch.maize_input).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(batch.maize_flour_output).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(batch.dussa_output).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {error ? "Could not fetch data." : "No production batches found."}
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
