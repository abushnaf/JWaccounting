import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, Clock } from "lucide-react";

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة العملاء</h2>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="w-4 h-4" />
          عميل جديد
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي العملاء
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">248</div>
            <p className="text-xs text-muted-foreground mt-1">عميل مسجل</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عملاء نشطون
            </CardTitle>
            <UserCheck className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">186</div>
            <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              أقساط معلقة
            </CardTitle>
            <Clock className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">12</div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج متابعة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>قاعدة بيانات العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">سجلات العملاء وتاريخ المشتريات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
