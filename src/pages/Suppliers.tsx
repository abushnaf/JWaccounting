import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle, Star, Package } from "lucide-react";

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة الموردين</h2>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="w-4 h-4" />
          مورد جديد
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الموردين
            </CardTitle>
            <UserCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">18</div>
            <p className="text-xs text-muted-foreground mt-1">مورد نشط</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تقييم عالي
            </CardTitle>
            <Star className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">12</div>
            <p className="text-xs text-muted-foreground mt-1">5 نجوم</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              طلبيات نشطة
            </CardTitle>
            <Package className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">5</div>
            <p className="text-xs text-muted-foreground mt-1">قيد التنفيذ</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>سجل الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <UserCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">تقييمات الموردين وتاريخ الأسعار</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
