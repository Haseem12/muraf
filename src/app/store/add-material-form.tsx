
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleAddMaterial } from './actions';

const initialState = {
  message: '',
  data: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      Add Material
    </Button>
  );
}

export default function AddMaterialForm({ onMaterialAdded }: { onMaterialAdded: () => void }) {
  const [state, formAction, isPending] = useActionState(handleAddMaterial, initialState);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only when the form submission is complete (isPending becomes false)
    // and there's a message to show.
    if (!isPending && state.message) {
      if (state.errors) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
        onMaterialAdded();
        setOpen(false);
      }
    }
  }, [state, isPending, toast, onMaterialAdded]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Raw Material</DialogTitle>
          <DialogDescription>Add a new batch of raw materials to your inventory.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="material">Material</Label>
            <Select name="material" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select a material" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Maize">Maize</SelectItem>
                    <SelectItem value="Cassava">Cassava</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            {state.errors?.material && <p className="text-sm text-destructive">{state.errors.material[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="e.g., 1000" required />
            {state.errors?.quantity && <p className="text-sm text-destructive">{state.errors.quantity[0]}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Select name="unit" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                </SelectContent>
            </Select>
            {state.errors?.unit && <p className="text-sm text-destructive">{state.errors.unit[0]}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
