
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Loader2, PlusCircle, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleAddOrder } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PACKAGE_SIZES, CUSTOMER_TYPES, PRODUCTS } from '@/lib/pricing';


const initialState = {
  message: '',
  data: null,
  errors: null,
};


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Order
    </Button>
  );
}

export default function AddOrderForm({ onOrderAdded }: { onOrderAdded: () => void }) {
  const [state, formAction, isPending] = useActionState(handleAddOrder, initialState);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [items, setItems] = useState([{ product: 'Maize Flour', packageSize: '', quantity: '' }]);
  const [newInvoiceId, setNewInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && state.message) {
      if (state.errors || state.message.toLowerCase().includes('error') || state.message.toLowerCase().includes('fail')) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else if (state.data?.invoice_id) {
        toast({
          title: 'Success',
          description: state.message,
        });
        onOrderAdded();
        
        if (state.data.invoice_id) {
          setNewInvoiceId(state.data.invoice_id);
        }
      }
    }
  }, [state, isPending, toast, onOrderAdded]);
  
  const handleItemChange = (index: number, field: 'product' | 'packageSize' | 'quantity', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: 'Maize Flour', packageSize: '', quantity: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const handleDialogClose = () => {
    setOpen(false);
    // Use a timeout to avoid flicker
    setTimeout(() => {
        setNewInvoiceId(null);
        setItems([{ product: 'Maize Flour', packageSize: '', quantity: ''}]);
        if (state) {
            state.message = '';
            state.data = null;
            state.errors = null;
        }
    }, 200)
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleDialogClose();
    } else {
      setOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{newInvoiceId ? `Order #${newInvoiceId} Created` : 'Create Sales Order'}</DialogTitle>
          <DialogDescription>{newInvoiceId ? 'You can now print the receipt.' : 'Add customer details and order items.'}</DialogDescription>
        </DialogHeader>
        
        {newInvoiceId ? (
            <div className="space-y-4 py-4">
                 <Alert>
                    <AlertTitle>Print Receipt</AlertTitle>
                    <AlertDescription>
                        The order has been created successfully. Click the button below to print the thermal receipt.
                    </AlertDescription>
                </Alert>
                <a
                  href={`my.bluetoothprint.scheme://https://sajfoods.net/muraf/response.php?saleId=${newInvoiceId}`}
                  className={cn(buttonVariants({ variant: 'default' }), "w-full")}
                  target="_blank"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print to Thermal
                </a>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="ghost" onClick={handleDialogClose}>
                        Close
                    </Button>
                </DialogFooter>
            </div>
        ) : (
            <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" name="customerName" type="text" placeholder="e.g., John Doe" required />
                    {state?.errors?.customerName && <p className="text-sm text-destructive">{state.errors.customerName[0]}</p>}
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="customerType">Customer Type</Label>
                    <Select name="customerType" required>
                        <SelectTrigger id="customerType">
                            <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent>
                            {CUSTOMER_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {state?.errors?.customerType && <p className="text-sm text-destructive">{state.errors.customerType[0]}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <Label>Order Items</Label>
                {items.map((item, index) => (
                    <div key={index} className="flex items-end gap-2">
                        <div className="grid gap-1.5 w-full">
                           <Label htmlFor={`product-${index}`} className="text-xs">Product</Label>
                             <Select 
                                name={`items[${index}][product]`}
                                required
                                value={item.product}
                                onValueChange={(value) => handleItemChange(index, 'product', value)}
                            >
                                <SelectTrigger id={`product-${index}`}>
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRODUCTS.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5 w-full">
                            <Label htmlFor={`packageSize-${index}`} className="text-xs">Package Size (kg)</Label>
                            <Select 
                                name={`items[${index}][packageSize]`}
                                required
                                value={item.packageSize}
                                onValueChange={(value) => handleItemChange(index, 'packageSize', value)}
                            >
                                <SelectTrigger id={`packageSize-${index}`}>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PACKAGE_SIZES.map(size => (
                                        <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5 w-full">
                            <Label htmlFor={`quantity-${index}`} className="text-xs">No. of Packages</Label>
                            <Input 
                                id={`quantity-${index}`} 
                                name={`items[${index}][quantity]`} 
                                type="number" 
                                placeholder="e.g., 10" 
                                required 
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                        </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)} disabled={items.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {state?.errors?.items && <p className="text-sm text-destructive">{state.errors.items[0]}</p>}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
            </Button>

            <DialogFooter className="mt-4">
                <Button type="button" variant="ghost" onClick={handleDialogClose}>
                Cancel
                </Button>
                <SubmitButton />
            </DialogFooter>
            </form>
        )}
        
      </DialogContent>
    </Dialog>
  );
}
