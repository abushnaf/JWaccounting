import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BackupButton() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      // Fetch all data from all tables
      const [
        { data: inventory },
        { data: sales },
        { data: salesItems },
        { data: purchases },
        { data: purchaseItems },
        { data: expenses },
        { data: profiles },
        { data: userRoles },
      ] = await Promise.all([
        supabase.from("inventory").select("*"),
        supabase.from("sales").select("*"),
        supabase.from("sales_items").select("*"),
        supabase.from("purchases").select("*"),
        supabase.from("purchase_items").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        inventory: inventory || [],
        sales: sales || [],
        sales_items: salesItems || [],
        purchases: purchases || [],
        purchase_items: purchaseItems || [],
        expenses: expenses || [],
        profiles: profiles || [],
        user_roles: userRoles || [],
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("تم إنشاء النسخة الاحتياطية بنجاح");
    } catch (error) {
      console.error("Backup error:", error);
      toast.error("حدث خطأ أثناء إنشاء النسخة الاحتياطية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBackup}
      disabled={loading}
      className="gap-2"
      variant="outline"
    >
      {loading ? (
        <>
          <Database className="w-4 h-4 animate-spin" />
          جاري إنشاء النسخة...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          تحميل نسخة احتياطية
        </>
      )}
    </Button>
  );
}