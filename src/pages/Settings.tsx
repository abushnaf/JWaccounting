import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, DollarSign, Users, Shield, Building2, Trash2, Info } from "lucide-react";
import UserManagementNew from "@/components/UserManagementNew";
import RoleManagementNew from "@/components/RoleManagementNew";
import BackupButton from "@/components/BackupButton";
import AppInfoSettings from "@/components/AppInfoSettings";
import SuppliersSettings from "@/components/SuppliersSettings";
import DataCleanup from "@/components/DataCleanup";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-bold">الإعدادات</h2>
          <p className="text-xs md:text-sm text-muted-foreground">إدارة النظام والإعدادات العامة</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex w-full gap-1 overflow-x-auto md:grid md:grid-cols-4 md:gap-0 scroll-px-3 snap-x snap-mandatory">
          <TabsTrigger value="general" className="flex items-center gap-2 px-2 py-2 text-xs md:px-3 md:py-2 md:text-sm snap-start">
            <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">عام</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 px-2 py-2 text-xs md:px-3 md:py-2 md:text-sm snap-start">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">المستخدمين</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2 px-2 py-2 text-xs md:px-3 md:py-2 md:text-sm snap-start">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">الأدوار</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 px-2 py-2 text-xs md:px-3 md:py-2 md:text-sm snap-start">
            <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">النظام</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* App Information */}
            <AppInfoSettings />
            
            {/* Suppliers */}
            <SuppliersSettings />
          </div>

          {/* Additional Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
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

            <Card className="shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
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
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementNew />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagementNew />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Backup */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  النسخ الاحتياطي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  قم بتحميل نسخة احتياطية من جميع البيانات في قاعدة البيانات
                </p>
                <BackupButton />
              </CardContent>
            </Card>

            {/* Data Cleanup */}
            <DataCleanup />
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                معلومات النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">إصدار النظام</Label>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">نوع قاعدة البيانات</Label>
                  <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">وضع التشغيل</Label>
                  <p className="text-sm text-muted-foreground">وضع تجريبي</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">آخر تحديث</Label>
                  <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
