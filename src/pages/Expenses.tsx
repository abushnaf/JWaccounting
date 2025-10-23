import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, TrendingUp, Zap } from "lucide-react";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { Badge } from "@/components/ui/badge";

export default function Expenses() {
  const { isDemo } = useAuth();
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('expenses');
        const list = stored ? JSON.parse(stored) : [];
        return list.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      }
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const todayExpenses = expenses.filter(
    (expense) => expense.date === new Date().toISOString().split('T')[0]
  );
  const todayTotal = todayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const monthTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Calculate largest category
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || "أخرى";
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const largestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalRows = expenses.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedExpenses = expenses.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مصروفات اليوم
            </CardTitle>
            <Receipt className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {todayTotal.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayExpenses.length} معاملة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المصروفات
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {monthTotal.toLocaleString()} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} معاملة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              أكبر فئة
            </CardTitle>
            <Zap className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {largestCategory ? largestCategory[1].toLocaleString() : 0} د.ل
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {largestCategory ? largestCategory[0] : "لا توجد فئات"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">إدارة المصروفات</CardTitle>
            <ExpenseForm />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  لا توجد مصروفات بعد. انقر على "إضافة مصروف" للبدء
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-3 text-sm font-medium">التاريخ</th>
                      <th className="text-right p-3 text-sm font-medium">الفئة</th>
                      <th className="text-right p-3 text-sm font-medium">الوصف</th>
                      <th className="text-right p-3 text-sm font-medium">المبلغ</th>
                      <th className="text-right p-3 text-sm font-medium">طريقة الدفع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('ar-LY')}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">{expense.category}</Badge>
                        </td>
                        <td className="p-3">{expense.description}</td>
                        <td className="p-3 font-semibold text-destructive">
                          {Number(expense.amount).toLocaleString()} د.ل
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{expense.payment_method}</Badge>
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
                  {Math.min(totalRows, start + paginatedExpenses.length)} من {totalRows}
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
    </div>
  );
}
