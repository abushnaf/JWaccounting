-- Enum for item condition
DO $$ BEGIN
  CREATE TYPE public.item_condition AS ENUM ('New', 'Used', 'Broken');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add condition column to inventory (default New)
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS condition public.item_condition NOT NULL DEFAULT 'New';

-- Add condition column to sales_items and purchase_items (nullable, copied from inventory if linked)
ALTER TABLE public.sales_items
ADD COLUMN IF NOT EXISTS condition public.item_condition;

ALTER TABLE public.purchase_items
ADD COLUMN IF NOT EXISTS condition public.item_condition;

-- Ensure stock cannot go negative at DB level
ALTER TABLE public.inventory
ADD CONSTRAINT inventory_stock_non_negative CHECK (stock >= 0);

-- Guard sale trigger to prevent negative stock
CREATE OR REPLACE FUNCTION public.update_inventory_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    SELECT stock INTO current_stock FROM public.inventory WHERE id = NEW.inventory_item_id FOR UPDATE;
    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Inventory item not found';
    END IF;
    IF current_stock <= 0 THEN
      RAISE EXCEPTION 'Insufficient stock: This item is out of inventory.';
    END IF;
    UPDATE public.inventory
    SET weight = weight - NEW.weight,
        stock = stock - 1
    WHERE id = NEW.inventory_item_id;
    -- Copy condition if not provided
    IF NEW.condition IS NULL THEN
      NEW.condition := (SELECT condition FROM public.inventory WHERE id = NEW.inventory_item_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Guard purchase trigger (increase only)
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.inventory
    SET weight = weight + NEW.weight,
        stock = stock + 1
    WHERE id = NEW.inventory_item_id;
    -- Copy condition if not provided
    IF NEW.condition IS NULL THEN
      NEW.condition := (SELECT condition FROM public.inventory WHERE id = NEW.inventory_item_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


