import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, TrendingDown, Eye } from "lucide-react";
import PurchaseFormNew from "@/components/forms/PurchaseFormNew";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InvoiceDetailDialog from "@/components/InvoiceDetailDialog";

export default function Purchases() {
  const { isDemo } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('purchases');
        const list = stored ? JSON.parse(stored) : [];
        return list.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      }
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: purchaseItems = [] } = useQuery({
    queryKey: ["purchase_items", selectedPurchase],
    queryFn: async () => {
      if (!selectedPurchase) return [];
      const { data, error } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", selectedPurchase);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPurchase,
  });

  const selectedPurchaseData = purchases.find((p) => p.id === selectedPurchase);

  const monthTotal = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  const averagePrice = purchases.length > 0 ? monthTotal / purchases.length : 0;

  const totalRows = purchases.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedPurchases = purchases.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المشتريات
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {monthTotal.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {purchases.length} طلب شراء
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عدد الطلبيات
            </CardTitle>
            <Package className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{purchases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط السعر
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">لكل طلب</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">طلبيات الشراء</CardTitle>
            <PurchaseFormNew />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  لا توجد طلبيات بعد. انقر على "طلب شراء جديد" للبدء
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">التاريخ</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الوصف</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">المبلغ الإجمالي</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">طريقة الدفع</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="p-1.5 md:p-3 text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(purchase.date).toLocaleDateString('ar-LY')}
                        </td>
                        <td className="p-1.5 md:p-3 text-[10px] md:text-sm">{purchase.description}</td>
                        <td className="p-1.5 md:p-3 text-xs md:text-base font-bold text-secondary whitespace-nowrap">
                          {Number(purchase.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
                        </td>
                        <td className="p-1.5 md:p-3">
                          <Badge variant="outline" className="text-[9px] md:text-xs">{purchase.payment_method}</Badge>
                        </td>
                        <td className="p-1.5 md:p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPurchase(purchase.id)}
                            className="h-7 md:h-8 text-[10px] md:text-sm px-2 md:px-3"
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                            <span className="hidden sm:inline">عرض</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/30">
                <div className="text-xs text-muted-foreground">
                  عرض {Math.min(totalRows, start + 1)}-
                  {Math.min(totalRows, start + paginatedPurchases.length)} من {totalRows}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                    value={pageSize}
                    onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
                  >
                    {[10, 20, 50].map(s => (
                      <option key={s} value={s}>{s} / صفحة</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 px-2 rounded-md border text-xs disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      السابق
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className="h-8 px-2 rounded-md border text-xs disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceDetailDialog
        open={!!selectedPurchase}
        onOpenChange={(open) => !open && setSelectedPurchase(null)}
        invoice={selectedPurchaseData || null}
        items={purchaseItems}
        type="purchase"
      />
    </div>
  );
}
