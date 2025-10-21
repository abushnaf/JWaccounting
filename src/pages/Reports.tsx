import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Download, DollarSign, Package, ShoppingCart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Fetch sales data
  const { data: sales = [] } = useQuery({
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

  // Fetch purchases data
  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch inventory data
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  const totalProfit = totalSales - totalPurchases;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (Number(item.weight) * Number(item.price_per_gram) * Number(item.stock)), 0
  );

  const totalInventoryWeight = inventory.reduce((sum, item) => 
    sum + (Number(item.weight) * Number(item.stock)), 0
  );

  const lowStockItems = inventory.filter(item => item.stock <= 3).length;

  // Sales Report Statistics
  const salesStats = {
    totalAmount: totalSales,
    totalTransactions: sales.length,
    averageTransaction: sales.length > 0 ? totalSales / sales.length : 0,
    monthlySales: sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).reduce((sum, sale) => sum + Number(sale.amount), 0)
  };

  // Profit Report Statistics
  const profitStats = {
    totalProfit: totalProfit,
    profitMargin: profitMargin,
    totalRevenue: totalSales,
    totalCosts: totalPurchases,
    monthlyProfit: salesStats.monthlySales - purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
    }).reduce((sum, purchase) => sum + Number(purchase.amount), 0)
  };

  // Stock Evaluation Statistics
  const stockStats = {
    totalValue: totalInventoryValue,
    totalWeight: totalInventoryWeight,
    totalItems: inventory.length,
    lowStockCount: lowStockItems,
    averageItemValue: inventory.length > 0 ? totalInventoryValue / inventory.length : 0
  };

  // Gold Movement Statistics
  const goldStats = {
    totalGoldPurchased: purchases.reduce((sum, purchase) => {
      // This would need to be calculated from purchase_items with gold category
      return sum + Number(purchase.amount);
    }, 0),
    totalGoldSold: sales.reduce((sum, sale) => {
      // This would need to be calculated from sales_items with gold category
      return sum + Number(sale.amount);
    }, 0),
    netGoldMovement: 0, // Would be calculated from actual gold transactions
    goldInventoryValue: inventory.filter(item => item.category === 'ذهب').reduce((sum, item) => 
      sum + (Number(item.weight) * Number(item.price_per_gram) * Number(item.stock)), 0
    )
  };

  const getReportStats = () => {
    switch (selectedReport) {
      case 'sales':
        return salesStats;
      case 'profit':
        return profitStats;
      case 'stock':
        return stockStats;
      case 'gold':
        return goldStats;
      default:
        return null;
    }
  };

  const currentStats = getReportStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">التقارير والتحليلات</h2>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          تصدير Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={`shadow-md cursor-pointer transition-smooth ${
            selectedReport === 'sales' ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-gold'
          }`}
          onClick={() => setSelectedReport(selectedReport === 'sales' ? null : 'sales')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              تقرير المبيعات
              {selectedReport === 'sales' && <Badge variant="secondary">محدد</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingCart className="w-8 h-8 text-primary mb-2" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
              <p className="text-lg font-bold text-primary">
                {salesStats.totalAmount.toLocaleString()} د.ل
              </p>
              <p className="text-xs text-muted-foreground">
                {salesStats.totalTransactions} معاملة
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-md cursor-pointer transition-smooth ${
            selectedReport === 'profit' ? 'ring-2 ring-success bg-success/5' : 'hover:shadow-gold'
          }`}
          onClick={() => setSelectedReport(selectedReport === 'profit' ? null : 'profit')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              تقرير الأرباح
              {selectedReport === 'profit' && <Badge variant="secondary">محدد</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="w-8 h-8 text-success mb-2" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">صافي الربح</p>
              <p className={`text-lg font-bold ${profitStats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {profitStats.totalProfit.toLocaleString()} د.ل
              </p>
              <p className="text-xs text-muted-foreground">
                هامش ربح {profitStats.profitMargin.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-md cursor-pointer transition-smooth ${
            selectedReport === 'stock' ? 'ring-2 ring-secondary bg-secondary/5' : 'hover:shadow-gold'
          }`}
          onClick={() => setSelectedReport(selectedReport === 'stock' ? null : 'stock')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              تقييم المخزون
              {selectedReport === 'stock' && <Badge variant="secondary">محدد</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="w-8 h-8 text-secondary mb-2" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">قيمة المخزون</p>
              <p className="text-lg font-bold text-secondary">
                {stockStats.totalValue.toLocaleString()} د.ل
              </p>
              <p className="text-xs text-muted-foreground">
                {stockStats.totalItems} قطعة
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-md cursor-pointer transition-smooth ${
            selectedReport === 'gold' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:shadow-gold'
          }`}
          onClick={() => setSelectedReport(selectedReport === 'gold' ? null : 'gold')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              حركة الذهب
              {selectedReport === 'gold' && <Badge variant="secondary">محدد</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="w-8 h-8 text-yellow-600 mb-2" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">قيمة ذهب المخزون</p>
              <p className="text-lg font-bold text-yellow-600">
                {goldStats.goldInventoryValue.toLocaleString()} د.ل
              </p>
              <p className="text-xs text-muted-foreground">
                {inventory.filter(item => item.category === 'ذهب').length} قطعة ذهب
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>
            {selectedReport ? `ملخص ${getReportTitle(selectedReport)}` : 'ملخص الأداء العام'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {renderReportSummary(selectedReport!, currentStats)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">المبيعات</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-xl font-bold">{salesStats.totalAmount.toLocaleString()} د.ل</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">عدد المعاملات</p>
                  <p className="text-lg font-semibold">{salesStats.totalTransactions}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-success">الأرباح</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">صافي الربح</p>
                  <p className={`text-xl font-bold ${profitStats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {profitStats.totalProfit.toLocaleString()} د.ل
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">هامش الربح</p>
                  <p className="text-lg font-semibold">{profitStats.profitMargin.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-secondary">المخزون</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  <p className="text-xl font-bold">{stockStats.totalValue.toLocaleString()} د.ل</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">إجمالي الوزن</p>
                  <p className="text-lg font-semibold">{stockStats.totalWeight.toFixed(2)} جم</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-yellow-600">الذهب</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">قيمة ذهب المخزون</p>
                  <p className="text-xl font-bold">{goldStats.goldInventoryValue.toLocaleString()} د.ل</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">قطع الذهب</p>
                  <p className="text-lg font-semibold">{inventory.filter(item => item.category === 'ذهب').length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getReportTitle(reportType: string): string {
  switch (reportType) {
    case 'sales': return 'تقرير المبيعات';
    case 'profit': return 'تقرير الأرباح';
    case 'stock': return 'تقييم المخزون';
    case 'gold': return 'حركة الذهب';
    default: return '';
  }
}

function renderReportSummary(reportType: string, stats: any) {
  switch (reportType) {
    case 'sales':
      return (
        <>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">إجمالي المبيعات</h3>
            <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">عدد المعاملات</h3>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">متوسط المعاملة</h3>
            <p className="text-2xl font-bold">{stats.averageTransaction.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">مبيعات الشهر</h3>
            <p className="text-2xl font-bold">{stats.monthlySales.toLocaleString()} د.ل</p>
          </div>
        </>
      );
    case 'profit':
      return (
        <>
          <div className="space-y-2">
            <h3 className="font-semibold text-success">صافي الربح</h3>
            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {stats.totalProfit.toLocaleString()} د.ل
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-success">هامش الربح</h3>
            <p className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-success">إجمالي الإيرادات</h3>
            <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-success">إجمالي التكاليف</h3>
            <p className="text-2xl font-bold">{stats.totalCosts.toLocaleString()} د.ل</p>
          </div>
        </>
      );
    case 'stock':
      return (
        <>
          <div className="space-y-2">
            <h3 className="font-semibold text-secondary">قيمة المخزون</h3>
            <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-secondary">إجمالي الوزن</h3>
            <p className="text-2xl font-bold">{stats.totalWeight.toFixed(2)} جم</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-secondary">عدد القطع</h3>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-secondary">قطع منخفضة المخزون</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</p>
          </div>
        </>
      );
    case 'gold':
      return (
        <>
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-600">قيمة ذهب المخزون</h3>
            <p className="text-2xl font-bold">{stats.goldInventoryValue.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-600">إجمالي شراء الذهب</h3>
            <p className="text-2xl font-bold">{stats.totalGoldPurchased.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-600">إجمالي بيع الذهب</h3>
            <p className="text-2xl font-bold">{stats.totalGoldSold.toLocaleString()} د.ل</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-600">قطع الذهب</h3>
            <p className="text-2xl font-bold">{inventory.filter(item => item.category === 'ذهب').length}</p>
          </div>
        </>
      );
    default:
      return null;
  }
}
