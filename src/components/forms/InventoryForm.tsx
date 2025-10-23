import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const categoryTypes = ["ذهب", "فضة", "ماس", "أحجار كريمة"];
const karatTypes = ["24K", "21K", "18K", "14K", "فضة"];
const conditionTypes = ["جديد", "مستعمل", "إعادة تصنيع"];

export default function InventoryForm() {
  const { isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    category: "ذهب",
    karat: "21K",
    weight: "",
    price_per_gram: "",
    stock: "1",
    condition: "جديد",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDemo) {
        // Save to localStorage in demo mode
        const stored = localStorage.getItem('inventory');
        const inventory = stored ? JSON.parse(stored) : [];
        const newItem = {
          id: Date.now().toString(),
          ...formData,
          weight: parseFloat(formData.weight),
          price_per_gram: parseFloat(formData.price_per_gram),
          stock: parseInt(formData.stock),
          status: parseInt(formData.stock) > 5 ? "متوفر" : "منخفض",
          created_at: new Date().toISOString()
        };
        localStorage.setItem('inventory', JSON.stringify([...inventory, newItem]));
      } else {
        const { error } = await supabase.from("inventory").insert({
          name: formData.name,
          category: formData.category,
          karat: formData.karat,
          weight: parseFloat(formData.weight),
          price_per_gram: parseFloat(formData.price_per_gram),
          stock: parseInt(formData.stock),
          condition: formData.condition,
          status: parseInt(formData.stock) > 5 ? "متوفر" : "منخفض",
        });

        if (error) throw error;
      }

      toast.success("تمت إضافة القطعة بنجاح");
      setOpen(false);
      setFormData({
        name: "",
        category: "ذهب",
        karat: "21K",
        weight: "",
        price_per_gram: "",
        stock: "1",
        condition: "جديد",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("حدث خطأ أثناء إضافة القطعة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="w-4 h-4" />
          إضافة قطعة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة قطعة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم القطعة</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {categoryTypes.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="karat">العيار</Label>
            <Select
              value={formData.karat}
              onValueChange={(value) => setFormData({ ...formData, karat: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {karatTypes.map((karat) => (
                  <SelectItem key={karat} value={karat}>
                    {karat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">حالة القطعة</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditionTypes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">الوزن (جرام)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_gram">سعر الجرام (د.ل)</Label>
            <Input
              id="price_per_gram"
              type="number"
              step="0.01"
              required
              value={formData.price_per_gram}
              onChange={(e) =>
                setFormData({ ...formData, price_per_gram: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">الكمية</Label>
            <Input
              id="stock"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">الحالة</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditionTypes.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Display */}
          {formData.weight && formData.price_per_gram && formData.stock && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">الإجمالي:</span>
                <span className="text-xl font-bold text-secondary">
                  {(
                    parseFloat(formData.weight) *
                    parseFloat(formData.price_per_gram) *
                    parseInt(formData.stock)
                  ).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  د.ل
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
