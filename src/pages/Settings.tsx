import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, DollarSign, Shield, Database } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الإعدادات</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base">أسعار الذهب</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              تحديث أسعار الذهب اليومية لجميع الأعيرة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-secondary" />
              </div>
              <CardTitle className="text-base">الضرائب والرسوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إدارة نسب الضرائب والرسوم الإضافية
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-base">النسخ الاحتياطي</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إعدادات النسخ الاحتياطي التلقائي والمزامنة
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md cursor-pointer hover:shadow-gold transition-smooth">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <CardTitle className="text-base">الصلاحيات</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إدارة صلاحيات المستخدمين والأدوار
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
