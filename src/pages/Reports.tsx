import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
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
        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <CardTitle className="text-sm font-medium">تقرير المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3 className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">تحليل المبيعات الشهرية</p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <CardTitle className="text-sm font-medium">تقرير الأرباح</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="w-8 h-8 text-success mb-2" />
            <p className="text-xs text-muted-foreground">هوامش الربح والخسارة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <CardTitle className="text-sm font-medium">تقييم المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart className="w-8 h-8 text-secondary mb-2" />
            <p className="text-xs text-muted-foreground">قيمة المخزون حسب العيار</p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <CardTitle className="text-sm font-medium">حركة الذهب</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3 className="w-8 h-8 text-info mb-2" />
            <p className="text-xs text-muted-foreground">تتبع شراء وبيع الذهب</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>ملخص الأداء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">سيتم عرض الرسوم البيانية هنا</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
