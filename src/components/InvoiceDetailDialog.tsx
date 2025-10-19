import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface InvoiceItem {
  id: string;
  item_name: string;
  category: string;
  weight: number;
  price_per_gram: number;
  quantity: number;
  amount: number;
}

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    date: string;
    description: string;
    payment_method: string;
    amount: number;
  } | null;
  items: InvoiceItem[];
  type: "purchase" | "sale";
}

export default function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  items,
  type,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const title = type === "purchase" ? "تفاصيل طلب الشراء" : "تفاصيل فاتورة البيع";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">التاريخ</p>
              <p className="font-medium">
                {new Date(invoice.date).toLocaleDateString('ar-LY')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">طريقة الدفع</p>
              <Badge variant="outline">{invoice.payment_method}</Badge>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-1">الوصف</p>
              <p className="font-medium">{invoice.description}</p>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">الأصناف</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-3 text-sm font-medium">الصنف</th>
                    <th className="text-right p-3 text-sm font-medium">النوع</th>
                    <th className="text-right p-3 text-sm font-medium">الكمية</th>
                    <th className="text-right p-3 text-sm font-medium">الوزن (غرام)</th>
                    <th className="text-right p-3 text-sm font-medium">السعر/غرام</th>
                    <th className="text-right p-3 text-sm font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="p-3 text-sm">{item.item_name}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{item.quantity}</td>
                      <td className="p-3 text-sm">
                        {Number(item.weight).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-sm">
                        {Number(item.price_per_gram).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-semibold text-secondary">
                        {Number(item.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
            <span className="text-lg font-semibold">المبلغ الإجمالي</span>
            <span className="text-2xl font-bold text-primary">
              {Number(invoice.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
