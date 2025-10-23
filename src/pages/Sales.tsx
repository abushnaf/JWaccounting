import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, TrendingUp, Eye } from "lucide-react";
import SaleFormNew from "@/components/forms/SaleFormNew";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import InvoiceDetailDialog from "@/components/InvoiceDetailDialog";

export default function Sales() {
  const { isDemo } = useAuth();
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('sales');
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: saleItems = [] } = useQuery({
    queryKey: ["sale_items", selectedSale],
    queryFn: async () => {
      if (!selectedSale) return [];
      if (isDemo) {
        const stored = localStorage.getItem('sales_items');
        const allItems = stored ? JSON.parse(stored) : [];
        return allItems.filter((item: any) => item.sale_id === selectedSale);
      }
      const { data, error } = await supabase
        .from("sales_items")
        .select("*")
        .eq("sale_id", selectedSale);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSale,
  });

  const selectedSaleData = sales.find((s) => s.id === selectedSale);

  const todaySales = sales.filter(
    (sale) => sale.date === new Date().toISOString().split('T')[0]
  );
  const todayTotal = todaySales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const monthTotal = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const averageInvoice = sales.length > 0 ? monthTotal / sales.length : 0;

  const totalRows = sales.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedSales = sales.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مبيعات اليوم
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {todayTotal.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySales.length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المبيعات
            </CardTitle>
            <DollarSign className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {monthTotal.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الفاتورة
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageInvoice.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">لكل عملية بيع</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">فواتير المبيعات</CardTitle>
            <SaleFormNew />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : sales.length === 0 ? (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  لا توجد فواتير بعد. انقر على "فاتورة جديدة" للبدء
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
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الأصناف</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">المبلغ الإجمالي</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">طريقة الدفع</th>
                      <th className="text-right p-1.5 md:p-3 text-[10px] md:text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="p-1.5 md:p-3 text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(sale.date).toLocaleDateString('ar-LY')}
                        </td>
                        <td className="p-1.5 md:p-3 text-[10px] md:text-sm">{sale.description}</td>
                        <td className="p-1.5 md:p-3 text-[10px] md:text-sm text-muted-foreground">
                          <SaleItemNames saleId={sale.id} />
                        </td>
                        <td className="p-1.5 md:p-3 text-xs md:text-base font-bold text-secondary whitespace-nowrap">
                          {Number(sale.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
                        </td>
                        <td className="p-1.5 md:p-3">
                          <Badge variant="outline" className="text-[9px] md:text-xs">{sale.payment_method}</Badge>
                        </td>
                        <td className="p-1.5 md:p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSale(sale.id)}
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
                  {Math.min(totalRows, start + paginatedSales.length)} من {totalRows}
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
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
        invoice={selectedSaleData || null}
        items={saleItems}
        type="sale"
      />
    </div>
  );
}

// Component to display sale item names
function SaleItemNames({ saleId }: { saleId: string }) {
  const { isDemo } = useAuth();
  const [itemNames, setItemNames] = useState<string>('');

  useEffect(() => {
    const fetchItemNames = async () => {
      if (isDemo) {
        const stored = localStorage.getItem('sales_items');
        const allItems = stored ? JSON.parse(stored) : [];
        const items = allItems.filter((item: any) => item.sale_id === saleId);
        setItemNames(items.map((item: any) => item.item_name).join(', '));
      } else {
        const { data, error } = await supabase
          .from("sales_items")
          .select("item_name")
          .eq("sale_id", saleId);
        
        if (!error && data) {
          setItemNames(data.map(item => item.item_name).join(', '));
        }
      }
    };

    fetchItemNames();
  }, [saleId, isDemo]);

  return (
    <span className="truncate max-w-[150px] block" title={itemNames}>
      {itemNames || 'جاري التحميل...'}
    </span>
  );
}
