
'use client';

import { useState, useEffect, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, ChevronsRight, Package } from 'lucide-react';
import { handleProductionCalculation, handleRecordProduction } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const initialCalculationState = {
  message: '',
  data: null,
  errors: null,
};

const initialRecordState = {
    message: '',
    recorded: false,
}

function SubmitButton({ label, pending, icon }: { label: string; pending: boolean; icon?: React.ReactNode }) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon}
      {label}
    </Button>
  );
}

export default function ProductionCalculator({ onProductionRecorded }: { onProductionRecorded: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [calculationState, calculationAction, isCalculating] = useActionState(handleProductionCalculation, initialCalculationState);
  const [recordState, recordAction, isRecording] = useActionState(handleRecordProduction, initialRecordState);
  

  useEffect(() => {
    if (!isCalculating && calculationState.message && calculationState.message !== 'Calculation successful.') {
      toast({
        variant: "destructive",
        title: "Error",
        description: calculationState.message,
      });
    }
  }, [calculationState, isCalculating, toast]);

  useEffect(() => {
    if (!isRecording && recordState.message) {
        if (!recordState.recorded) {
            toast({
                variant: "destructive",
                title: "Error Recording Production",
                description: recordState.message,
            });
        } else {
             toast({
                title: "Success",
                description: recordState.message,
            });
            onProductionRecorded();
            setOpen(false);
        }
    }
  }, [recordState, isRecording, toast, onProductionRecorded]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Production
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>New Production Batch</DialogTitle>
          <DialogDescription>
            Enter the amount of raw maize to calculate and record finished outputs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <form action={calculationAction} className="space-y-4">
              <h3 className="font-semibold text-lg">Inputs</h3>
              <div className="grid gap-2">
                <Label htmlFor="maizeInputKg">Maize Input (kg)</Label>
                <Input id="maizeInputKg" name="maizeInputKg" type="number" placeholder="e.g., 1000" required disabled={isCalculating} />
                {calculationState.errors?.maizeInputKg && <p className="text-sm text-destructive">{calculationState.errors.maizeInputKg[0]}</p>}
              </div>
              <div className="flex justify-end">
                <SubmitButton label="Calculate" pending={isCalculating} />
              </div>
            </form>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Outputs</h3>
                {calculationState.data ? (
                    <form action={recordAction}>
                        <input type="hidden" name="maizeInput" value={calculationState.data.inputs.maizeInputKg} />
                        <input type="hidden" name="cassavaInput" value={calculationState.data.outputs.cassavaRequiredKg} />
                        <input type="hidden" name="maizeFlourOutput" value={calculationState.data.outputs.maizeFlourOutputKg} />
                        <input type="hidden" name="dussaOutput" value={calculationState.data.outputs.dussaOutputKg} />

                        <div className="grid grid-cols-1 gap-4">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">Required Cassava</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{calculationState.data.outputs.cassavaRequiredKg.toLocaleString()} kg</p>
                                    <p className="text-xs text-muted-foreground">13% of maize input</p>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-2 gap-4">
                               <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Maize Flour</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{calculationState.data.outputs.maizeFlourOutputKg.toLocaleString()} kg</p>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Dussa</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{calculationState.data.outputs.dussaOutputKg.toLocaleString()} kg</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <SubmitButton label="Record Production" pending={isRecording} icon={<ChevronsRight />} />
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg p-8 border border-dashed">
                        <p className="text-muted-foreground">Outputs will be shown here after calculation.</p>
                    </div>
                )}
            </div>
          </div>

        <DialogFooter className="mt-8">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
