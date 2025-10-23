import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function DataCleanup() {
  const { isDemo } = useAuth();
  const [isCleaning, setIsCleaning] = useState(false);

  const cleanupData = async () => {
    setIsCleaning(true);
    
    try {
      if (isDemo) {
        // Clean localStorage
        const keysToRemove = [
          'suppliers',
          'app_settings', 
          'inventory',
          'sales',
          'purchases',
          'expenses',
          'customers',
          'sales_items', // Clean sales items
          'purchase_items', // Clean purchase items
          'custom_roles', // Clean custom roles
          'demo_users_v1', // Also clean demo users
          'demo_session' // Clean demo session
        ];

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // Reset app settings to default
        localStorage.setItem('app_settings', JSON.stringify({
          app_name: "نظام المجوهرات",
          phone: "",
          email: ""
        }));

        toast.success("تم تنظيف البيانات التجريبية بنجاح");
        
        // Refresh the page to reset all state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // For production, you would call the cleanup script
        toast.info("يرجى تشغيل سكريبت التنظيف من الخادم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء التنظيف");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="w-5 h-5" />
          تنظيف البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              تحذير: هذا الإجراء لا يمكن التراجع عنه
            </p>
            <p className="text-sm text-muted-foreground">
              سيتم حذف جميع البيانات التجارية (المبيعات، المشتريات، المخزون، العملاء، الموردين، المحاسبة) 
              مع الحفاظ على حسابات المستخدمين والأدوار.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={isCleaning}
            >
              {isCleaning ? "جاري التنظيف..." : "تنظيف جميع البيانات"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">
                تأكيد تنظيف البيانات
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>هل أنت متأكد من أنك تريد حذف جميع البيانات التجارية؟</p>
                <p className="font-medium">سيتم حذف:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>جميع المبيعات والمشتريات</li>
                  <li>جميع عناصر المخزون</li>
                  <li>جميع العملاء والموردين</li>
                  <li>جميع المصروفات</li>
                  <li>جميع بيانات المحاسبة</li>
                  <li>إعدادات التطبيق (ستعود للافتراضية)</li>
                </ul>
                <p className="font-medium text-green-600">سيتم الحفاظ على:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>حسابات المستخدمين</li>
                  <li>الأدوار والصلاحيات</li>
                  <li>هيكل قاعدة البيانات</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  cleanupData();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                نعم، احذف البيانات
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
