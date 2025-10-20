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

interface SaleItem {
  inventory_item_id: string;
  item_name: string;
  category: string;
  weight: string;
  price_per_gram: string;
  quantity: string;
  condition: string;
  available_stock?: number;
}

const conditionTypes = ["جديد", "مستعمل", "إعادة تصنيع"];

export default function SaleFormNew() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    payment_method: "نقدي",
    description: "",
  });

  const [items, setItems] = useState<SaleItem[]>([
    { inventory_item_id: "", item_name: "", category: "", weight: "", price_per_gram: "", quantity: "1", condition: "جديد" },
  ]);

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .gt("stock", 0)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      { inventory_item_id: "", item_name: "", category: "", weight: "", price_per_gram: "", quantity: "1", condition: "جديد" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    
    if (field === "available_stock") {
      newItems[index][field] = value as number;
    } else if (field === "inventory_item_id") {
      newItems[index][field] = value as string;
      const selectedItem = inventory.find((item) => item.id === value);
      if (selectedItem) {
        newItems[index].item_name = selectedItem.name;
        newItems[index].category = selectedItem.category;
        newItems[index].price_per_gram = selectedItem.price_per_gram.toString();
        newItems[index].weight = selectedItem.weight.toString();
        newItems[index].available_stock = selectedItem.stock;
      }
    } else {
      newItems[index][field as keyof Omit<SaleItem, "available_stock">] = value as string;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const pricePerGram = parseFloat(item.price_per_gram) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return sum + weight * pricePerGram * quantity;
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

    // Check stock availability
    for (const item of validItems) {
      const quantity = parseInt(item.quantity) || 1;
      if (item.available_stock !== undefined && quantity > item.available_stock) {
        toast.error(`الكمية المطلوبة من ${item.item_name} تتجاوز المخزون المتاح (${item.available_stock})`);
        return;
      }
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          date: formData.date,
          amount: totalAmount,
          description: formData.description || "فاتورة بيع",
          payment_method: formData.payment_method,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItems = validItems.map((item) => ({
        sale_id: sale.id,
        inventory_item_id: item.inventory_item_id || null,
        item_name: item.item_name,
        category: item.category,
        weight: parseFloat(item.weight),
        price_per_gram: parseFloat(item.price_per_gram),
        quantity: parseInt(item.quantity),
        amount: parseFloat(item.weight) * parseFloat(item.price_per_gram) * parseInt(item.quantity),
        condition: item.condition,
      }));

      const { error: itemsError } = await supabase
        .from("sales_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      toast.success("تمت إضافة الفاتورة بنجاح");
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        payment_method: "نقدي",
        description: "",
      });
      setItems([
        { inventory_item_id: "", item_name: "", category: "", weight: "", price_per_gram: "", quantity: "1", condition: "جديد" },
      ]);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("حدث خطأ أثناء إضافة الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          فاتورة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>فاتورة بيع جديدة</DialogTitle>
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
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">الصنف</Label>
                  <Select
                    value={item.inventory_item_id}
                    onValueChange={(value) =>
                      updateItem(index, "inventory_item_id", value)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="اختر من المخزون" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((invItem) => (
                        <SelectItem key={invItem.id} value={invItem.id}>
                          {invItem.name} - {invItem.category} ({invItem.karat})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">الفئة</Label>
                  <Input
                    className="h-9"
                    value={item.category}
                    readOnly
                    placeholder="تلقائي"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-9"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>

                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">الوزن (جم)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={item.weight}
                    onChange={(e) => updateItem(index, "weight", e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-1">
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
                      (parseFloat(item.price_per_gram) || 0) *
                      (parseFloat(item.quantity) || 0)
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
              {loading ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
