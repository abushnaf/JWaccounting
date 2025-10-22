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
          <DialogTitle className="text-base md:text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          {/* Invoice Header Info */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-[10px] md:text-sm text-muted-foreground mb-1">التاريخ</p>
              <p className="text-xs md:text-base font-medium">
                {new Date(invoice.date).toLocaleDateString('ar-LY')}
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-sm text-muted-foreground mb-1">طريقة الدفع</p>
              <Badge variant="outline" className="text-[10px] md:text-xs">{invoice.payment_method}</Badge>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] md:text-sm text-muted-foreground mb-1">الوصف</p>
              <p className="text-xs md:text-base font-medium">{invoice.description}</p>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-2 md:mb-3 text-sm md:text-lg">الأصناف</h3>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الصنف</th>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">النوع</th>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الكمية</th>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الوزن</th>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">السعر/غ</th>
                    <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="p-1.5 md:p-3 text-[10px] md:text-sm font-medium">{item.item_name}</td>
                      <td className="p-1.5 md:p-3">
                        <Badge variant="secondary" className="text-[9px] md:text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-1.5 md:p-3 text-[10px] md:text-sm">{item.quantity}</td>
                      <td className="p-1.5 md:p-3 text-[10px] md:text-sm">
                        {Number(item.weight).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 md:p-3 text-[10px] md:text-sm">
                        {Number(item.price_per_gram).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 md:p-3 text-[10px] md:text-sm font-semibold text-secondary">
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
          <div className="flex justify-between items-center p-3 md:p-4 bg-primary/10 rounded-lg">
            <span className="text-sm md:text-lg font-semibold">المبلغ الإجمالي</span>
            <span className="text-lg md:text-2xl font-bold text-primary">
              {Number(invoice.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
