import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Accounting() {
  const { isDemo } = useAuth();

  const { data: sales = [] } = useQuery({
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

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('purchases');
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">المحاسبة</h2>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المبيعات
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {totalSales.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">{sales.length} فاتورة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المشتريات
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {totalPurchases.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">{purchases.length} طلب</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المصروفات
            </CardTitle>
            <Receipt className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {totalExpenses.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} مصروف</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              صافي الربح
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {netProfit.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netProfit >= 0 ? 'موجب' : 'سالب'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>ملخص الحسابات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-muted-foreground">المبيعات</span>
                <span className="font-semibold text-success">
                  +{totalSales.toLocaleString()} د.ل
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-muted-foreground">المشتريات</span>
                <span className="font-semibold text-secondary">
                  -{totalPurchases.toLocaleString()} د.ل
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-muted-foreground">المصروفات</span>
                <span className="font-semibold text-destructive">
                  -{totalExpenses.toLocaleString()} د.ل
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded border-2 border-primary/20">
                <span className="font-semibold">صافي الربح</span>
                <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {netProfit.toLocaleString()} د.ل
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>نسب التوزيع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">المبيعات</span>
                  <span className="text-sm font-semibold">
                    {totalSales > 0 ? ((totalSales / (totalSales + totalPurchases + totalExpenses)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{
                      width: `${totalSales > 0 ? ((totalSales / (totalSales + totalPurchases + totalExpenses)) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">المشتريات</span>
                  <span className="text-sm font-semibold">
                    {totalPurchases > 0 ? ((totalPurchases / (totalSales + totalPurchases + totalExpenses)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{
                      width: `${totalPurchases > 0 ? ((totalPurchases / (totalSales + totalPurchases + totalExpenses)) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">المصروفات</span>
                  <span className="text-sm font-semibold">
                    {totalExpenses > 0 ? ((totalExpenses / (totalSales + totalPurchases + totalExpenses)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-destructive h-2 rounded-full"
                    style={{
                      width: `${totalExpenses > 0 ? ((totalExpenses / (totalSales + totalPurchases + totalExpenses)) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
