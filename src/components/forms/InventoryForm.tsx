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

const karatTypes = ["24K", "21K", "18K", "14K", "فضة"];

export default function InventoryForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    karat: "21K",
    weight: "",
    price_per_gram: "",
    stock: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("inventory").insert({
        name: formData.name,
        karat: formData.karat,
        weight: parseFloat(formData.weight),
        price_per_gram: parseFloat(formData.price_per_gram),
        stock: parseInt(formData.stock),
        status: parseInt(formData.stock) > 5 ? "متوفر" : "منخفض",
      });

      if (error) throw error;

      toast.success("تمت إضافة القطعة بنجاح");
      setOpen(false);
      setFormData({
        name: "",
        karat: "21K",
        weight: "",
        price_per_gram: "",
        stock: "1",
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
