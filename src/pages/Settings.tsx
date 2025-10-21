import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, DollarSign, Database } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import RoleManagement from "@/components/RoleManagement";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">الإعدادات</h2>
      
      {/* Role Management Section */}
      <RoleManagement />

      {/* User Management Section */}
      <UserManagement />

      {/* Other Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth btn-active">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-sm md:text-base">أسعار الذهب</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground">
              تحديث أسعار الذهب اليومية لجميع الأعيرة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth btn-active">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-secondary" />
              </div>
              <CardTitle className="text-sm md:text-base">الضرائب والرسوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground">
              إدارة نسب الضرائب والرسوم الإضافية
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth btn-active">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-sm md:text-base">النسخ الاحتياطي</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground">
              إعدادات النسخ الاحتياطي التلقائي والمزامنة
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
