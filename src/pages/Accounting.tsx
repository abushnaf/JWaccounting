import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, FileText, TrendingUp } from "lucide-react";

export default function Accounting() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">المحاسبة</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              دليل الحسابات
            </CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">45</div>
            <p className="text-xs text-muted-foreground mt-1">حساب نشط</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              القوائم المالية
            </CardTitle>
            <Receipt className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">متاحة</div>
            <p className="text-xs text-muted-foreground mt-1">محدثة</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الميزانية العمومية
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">موجبة</div>
            <p className="text-xs text-muted-foreground mt-1">صحية</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>النظام المحاسبي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">النظام المحاسبي الكامل قيد التطوير</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
