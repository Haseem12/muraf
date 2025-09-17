import React from 'react';

interface InvoiceProps {
  invoice: any; // Replace 'any' with a more specific type if possible
}

const InvoiceTemplate: React.FC<InvoiceProps> = ({ invoice }) => {
  // Calculate subtotal from items if not provided
  const subtotal = invoice.subtotal ?? (invoice.items || []).reduce((acc: number, item: any) => acc + Number(item.total_price || item.total || 0), 0);
  const grandTotal = invoice.grand_total ?? subtotal;

  return (
    <div className="invoice-template bg-white text-black p-8 font-sans text-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Muraf Maize Flower Company</h1>
        <p>KM 142 Kano-Kaduna Expressway, Maraban Gwanda, Sabon Gari, Zaria Kaduna State Nigeria</p>
        <p>Phone: 08170707020, 08076545454</p>
        <p>Website: www.sajfoods.net</p>
      </div>
      
      <div className="border-b-2 border-black pb-4 mb-4">
        <h2 className="text-xl font-bold">INVOICE</h2>
        <div className="flex justify-between mt-2">
          <div>
            <p><span className="font-bold">Invoice ID:</span> {invoice.id}</p>
            <p><span className="font-bold">Date:</span> {invoice.invoice_date}</p>
          </div>
          <div>
            <p className="font-bold">Bill To:</p>
            <p>{invoice.customer_name}</p>
          </div>
        </div>
      </div>

      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2">Item (Size)</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-center">Total KG</th>
            <th className="py-2 text-right">Total (₦)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((item: any, index: number) => (
            <tr key={item.id || index} className="border-b border-gray-300">
              <td className="py-2">{item.product_description || `${item.product_name} (${item.package_size}kg)`}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-center">{item.total_kg || item.quantity}kg</td>
              <td className="py-2 text-right">{Number(item.total_price || item.total).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between mb-2">
            <span className="font-bold">Subtotal:</span>
            <span>₦{Number(subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
            <span>Grand Total:</span>
            <span>₦{Number(grandTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

       <div className="text-center mt-8 pt-4 border-t-2 border-dashed border-black">
        <p className="font-bold">Thank you for your patronage!</p>
        <p className="text-xs mt-1">Powered by Sagheer+ Lab, sagheerplus.com.ng</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
