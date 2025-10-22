-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  karat TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_gram DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'متوفر',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory
CREATE POLICY "Anyone can view inventory" ON public.inventory
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert inventory" ON public.inventory
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update inventory" ON public.inventory
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete inventory" ON public.inventory
  FOR DELETE USING (true);

-- Create sales_items table
CREATE TABLE public.sales_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_gram DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales_items
CREATE POLICY "Anyone can view sales_items" ON public.sales_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert sales_items" ON public.sales_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sales_items" ON public.sales_items
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete sales_items" ON public.sales_items
  FOR DELETE USING (true);

-- Create purchase_items table
CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_gram DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchase_items
CREATE POLICY "Anyone can view purchase_items" ON public.purchase_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert purchase_items" ON public.purchase_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update purchase_items" ON public.purchase_items
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete purchase_items" ON public.purchase_items
  FOR DELETE USING (true);

-- Function to update inventory on sale
CREATE OR REPLACE FUNCTION public.update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.inventory
    SET weight = weight - NEW.weight,
        stock = stock - 1
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for sales
CREATE TRIGGER update_inventory_after_sale
  AFTER INSERT ON public.sales_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_on_sale();

-- Function to update inventory on purchase
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.inventory
    SET weight = weight + NEW.weight,
        stock = stock + 1
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for purchases
CREATE TRIGGER update_inventory_after_purchase
  AFTER INSERT ON public.purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_on_purchase();