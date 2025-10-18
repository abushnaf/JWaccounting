import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface PurchaseItem {
  inventory_item_id: string;
  item_name: string;
  weight: string;
  price_per_gram: string;
}

export default function PurchaseFormNew() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    payment_method: "نقدي",
    description: "",
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { inventory_item_id: "", item_name: "", weight: "", price_per_gram: "" },
  ]);

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      { inventory_item_id: "", item_name: "", weight: "", price_per_gram: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "inventory_item_id" && value) {
      const selectedItem = inventory.find((item) => item.id === value);
      if (selectedItem) {
        newItems[index].item_name = selectedItem.name;
        newItems[index].price_per_gram = selectedItem.price_per_gram.toString();
      }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const pricePerGram = parseFloat(item.price_per_gram) || 0;
      return sum + weight * pricePerGram;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(
      (item) => item.weight && item.price_per_gram && item.item_name
    );

    if (validItems.length === 0) {
      toast.error("يجب إضافة صنف واحد على الأقل");
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();

      // Insert purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          date: formData.date,
          amount: totalAmount,
          description: formData.description || "طلب شراء",
          payment_method: formData.payment_method,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Insert purchase items
      const purchaseItems = validItems.map((item) => ({
        purchase_id: purchase.id,
        inventory_item_id: item.inventory_item_id || null,
        item_name: item.item_name,
        weight: parseFloat(item.weight),
        price_per_gram: parseFloat(item.price_per_gram),
        amount: parseFloat(item.weight) * parseFloat(item.price_per_gram),
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      toast.success("تمت إضافة الطلب بنجاح");
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        payment_method: "نقدي",
        description: "",
      });
      setItems([
        { inventory_item_id: "", item_name: "", weight: "", price_per_gram: "" },
      ]);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast.error("حدث خطأ أثناء إضافة الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          طلب شراء جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طلب شراء جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">طريقة الدفع</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="بطاقة">بطاقة</SelectItem>
                  <SelectItem value="تحويل">تحويل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">الأصناف</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 ml-1" />
                إضافة صنف
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/30"
              >
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">اسم الصنف</Label>
                  <Input
                    className="h-9"
                    value={item.item_name}
                    onChange={(e) => updateItem(index, "item_name", e.target.value)}
                    placeholder="أدخل اسم الصنف"
                  />
                </div>

                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">الوزن (جم)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={item.weight}
                    onChange={(e) => updateItem(index, "weight", e.target.value)}
                  />
                </div>

                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">سعر الجرام</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={item.price_per_gram}
                    onChange={(e) =>
                      updateItem(index, "price_per_gram", e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {(
                      (parseFloat(item.weight) || 0) *
                      (parseFloat(item.price_per_gram) || 0)
                    ).toFixed(2)}
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg font-bold">الإجمالي:</div>
            <div className="text-2xl font-bold text-secondary">
              {calculateTotal().toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              د.ل
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ الطلب"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
