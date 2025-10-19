import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import SaleFormNew from "@/components/forms/SaleFormNew";
import { Badge } from "@/components/ui/badge";

export default function Sales() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const todaySales = sales.filter(
    (sale) => sale.date === new Date().toISOString().split('T')[0]
  );
  const todayTotal = todaySales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const monthTotal = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const averageInvoice = sales.length > 0 ? monthTotal / sales.length : 0;

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
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium">التاريخ</th>
                      <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium">الوصف</th>
                      <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium">المبلغ الإجمالي</th>
                      <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium">طريقة الدفع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="p-2 md:p-3 text-xs md:text-sm text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString('ar-LY')}
                        </td>
                        <td className="p-2 md:p-3 text-xs md:text-sm">{sale.description}</td>
                        <td className="p-2 md:p-3 text-sm md:text-base font-bold text-secondary">
                          {Number(sale.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ل
                        </td>
                        <td className="p-2 md:p-3">
                          <Badge variant="outline" className="text-xs">{sale.payment_method}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
