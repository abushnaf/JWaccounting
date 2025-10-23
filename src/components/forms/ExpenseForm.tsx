import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ExpenseForm() {
  const { isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    payment_method: "نقدي",
    category: "أخرى",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDemo) {
        // Save to localStorage in demo mode
        const expense = {
          id: Date.now().toString(),
          date: formData.date,
          amount: parseFloat(formData.amount),
          description: formData.description,
          payment_method: formData.payment_method,
          category: formData.category,
          created_at: new Date().toISOString()
        };

        const storedExpenses = localStorage.getItem('expenses');
        const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
        localStorage.setItem('expenses', JSON.stringify([...expenses, expense]));

        toast.success("تم إضافة المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        setOpen(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: "",
          description: "",
          payment_method: "نقدي",
          category: "أخرى",
        });
        return;
      }

      const { error } = await supabase.from("expenses").insert([
        {
          date: formData.date,
          amount: parseFloat(formData.amount),
          description: formData.description,
          payment_method: formData.payment_method,
          category: formData.category,
        },
      ]);

      if (error) throw error;

      toast.success("تم إضافة المصروف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        description: "",
        payment_method: "نقدي",
        category: "أخرى",
      });
    } catch (error: any) {
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="w-4 h-4" />
          إضافة مصروف
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>مصروف جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">التاريخ</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ (د.ل)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="رواتب">رواتب وأجور</SelectItem>
                <SelectItem value="إيجار">إيجار</SelectItem>
                <SelectItem value="كهرباء">كهرباء</SelectItem>
                <SelectItem value="صيانة">صيانة</SelectItem>
                <SelectItem value="مستلزمات">مستلزمات</SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              placeholder="تفاصيل المصروف..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">طريقة الدفع</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقدي">نقدي</SelectItem>
                <SelectItem value="بطاقة">بطاقة</SelectItem>
                <SelectItem value="تحويل">تحويل بنكي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "حفظ المصروف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
