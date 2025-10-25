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
import { useAuth } from "@/contexts/AuthContext";

interface SaleItem {
  inventory_item_id: string;
  item_name: string;
  category: string;
  condition?: string;
  weight: string;
  price_per_gram: string;
  quantity: string;
  available_stock?: number;
}

const conditionTypes = ["جديد", "مستعمل", "إعادة تصنيع"];

export default function SaleFormNew() {
  const { isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    payment_method: "نقدي",
    description: "",
    customer_name: "",
  });

  const [items, setItems] = useState<SaleItem[]>([
    { inventory_item_id: "", item_name: "", category: "", condition: "جديد", weight: "", price_per_gram: "", quantity: "1" },
  ]);

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      if (isDemo) {
        const stored = localStorage.getItem('inventory');
        return stored ? JSON.parse(stored) : [];
      }
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
        newItems[index].condition = selectedItem.condition;
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
      // Client-side stock validation per item
      for (const item of items) {
        if (item.inventory_item_id) {
          const inv = inventory.find((i: any) => i.id === item.inventory_item_id);
          const requestedQty = parseInt(item.quantity || '0');
          const available = inv?.stock ?? 0;
          if (available <= 0 || requestedQty > available) {
            toast.error("Insufficient stock: This item is out of inventory.");
            return;
          }
        }
      }
      const totalAmount = calculateTotal();

      if (isDemo) {
        // Save to localStorage in demo mode
        const saleId = Date.now().toString();
        const sale = {
          id: saleId,
          date: formData.date,
          amount: totalAmount,
          description: formData.description || "فاتورة بيع",
          payment_method: formData.payment_method,
          created_at: new Date().toISOString()
        };

        // Save sale
        const storedSales = localStorage.getItem('sales');
        const sales = storedSales ? JSON.parse(storedSales) : [];
        localStorage.setItem('sales', JSON.stringify([...sales, sale]));

        // Save sale items
        const saleItems = validItems.map((item) => ({
          id: Date.now().toString() + Math.random(),
          sale_id: saleId,
          inventory_item_id: item.inventory_item_id || null,
          item_name: item.item_name,
          category: item.category,
          condition: item.condition,
          weight: parseFloat(item.weight),
          price_per_gram: parseFloat(item.price_per_gram),
          quantity: parseInt(item.quantity),
          amount: parseFloat(item.weight) * parseFloat(item.price_per_gram) * parseInt(item.quantity),
          created_at: new Date().toISOString()
        }));

        const storedSaleItems = localStorage.getItem('sales_items');
        const allSaleItems = storedSaleItems ? JSON.parse(storedSaleItems) : [];
        localStorage.setItem('sales_items', JSON.stringify([...allSaleItems, ...saleItems]));

        // Decrement inventory stock for linked items
        const invRaw = localStorage.getItem('inventory');
        const inv = invRaw ? JSON.parse(invRaw) : [];
        saleItems.forEach((si) => {
          if (!si.inventory_item_id) return;
          const idx = inv.findIndex((x: any) => x.id === si.inventory_item_id);
          if (idx !== -1) {
            const currentStock = parseInt(inv[idx].stock || 0);
            const newStock = Math.max(0, currentStock - si.quantity);
            inv[idx].stock = newStock;
            inv[idx].status = newStock > 0 ? "متوفر" : "غير متوفر";
          }
        });
        localStorage.setItem('inventory', JSON.stringify(inv));

        toast.success("تمت إضافة الفاتورة بنجاح");
        setOpen(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          payment_method: "نقدي",
          description: "",
          customer_name: "",
        });
        setItems([
          { inventory_item_id: "", item_name: "", category: "", condition: "جديد", weight: "", price_per_gram: "", quantity: "1" },
        ]);
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        return;
      }

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
        condition: item.condition,
        weight: parseFloat(item.weight),
        price_per_gram: parseFloat(item.price_per_gram),
        quantity: parseInt(item.quantity),
        amount: parseFloat(item.weight) * parseFloat(item.price_per_gram) * parseInt(item.quantity),
      }));

      const { error: itemsError } = await supabase
        .from("sales_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Decrement inventory stock for linked items in Supabase
      const updatesByItem: Record<string, number> = {};
      saleItems.forEach((si) => {
        if (!si.inventory_item_id) return;
        updatesByItem[si.inventory_item_id] = (updatesByItem[si.inventory_item_id] || 0) + si.quantity;
      });

      const ids = Object.keys(updatesByItem);
      if (ids.length > 0) {
        const { data: currentInv, error: invFetchError } = await supabase
          .from("inventory")
          .select("id, stock")
          .in("id", ids);
        if (invFetchError) throw invFetchError;

        for (const row of currentInv || []) {
          const soldQty = updatesByItem[row.id] || 0;
          const currentStock = parseInt((row as any).stock || 0) || 0;
          const newStock = Math.max(0, currentStock - soldQty);
          const { error: invUpdateError } = await supabase
            .from("inventory")
            .update({
              stock: newStock,
              status: newStock > 0 ? "متوفر" : "غير متوفر",
            })
            .eq("id", row.id);
          if (invUpdateError) throw invUpdateError;
        }
      }

      toast.success("تمت إضافة الفاتورة بنجاح");
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        payment_method: "نقدي",
        description: "",
        customer_name: "",
      });
      setItems([
        { inventory_item_id: "", item_name: "", category: "", condition: "جديد", weight: "", price_per_gram: "", quantity: "1" },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="customer_name">اسم العميل</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="أدخل اسم العميل"
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end p-4 border rounded-lg bg-muted/30"
              >
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label className="text-sm font-medium">الصنف</Label>
                  <Select
                    value={item.inventory_item_id}
                    onValueChange={(value) =>
                      updateItem(index, "inventory_item_id", value)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر من المخزون" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((invItem) => (
                        <SelectItem key={invItem.id} value={invItem.id}>
                          {invItem.name} - {invItem.category} ({invItem.karat}) - متاح: {invItem.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 space-y-2">
                  <Label className="text-sm font-medium">الفئة</Label>
                  <Input
                    className="h-11"
                    value={item.category}
                    readOnly
                    placeholder="تلقائي"
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <Label className="text-sm font-medium">الحالة</Label>
                  <Input
                    className="h-11"
                    value={item.condition || ''}
                    readOnly
                    placeholder="تلقائي"
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <Label className="text-sm font-medium">الكمية</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-11"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <Label className="text-sm font-medium">الوزن (جم)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-11"
                    value={item.weight}
                    onChange={(e) => updateItem(index, "weight", e.target.value)}
                  />
                </div>

                <div className="col-span-1 space-y-2">
                  <Label className="text-sm font-medium">سعر الجرام</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-11"
                    value={item.price_per_gram}
                    onChange={(e) =>
                      updateItem(index, "price_per_gram", e.target.value)
                    }
                  />
                </div>

                <div className="col-span-1 flex items-center justify-between">
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
