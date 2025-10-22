-- Triggers to keep inventory in sync with purchases and sales including quantity and updates

-- PURCHASES
CREATE OR REPLACE FUNCTION public.inv_apply_purchase_insert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q integer; w numeric; 
BEGIN
  IF NEW.inventory_item_id IS NULL THEN RETURN NEW; END IF;
  q := COALESCE(NEW.quantity, 1);
  w := COALESCE(NEW.weight, 0);
  UPDATE public.inventory
    SET stock = stock + q,
        weight = weight + (w * q),
        price_per_gram = COALESCE(NEW.price_per_gram, price_per_gram)
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.inv_apply_purchase_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_q integer; new_q integer; old_w numeric; new_w numeric; delta_q integer; delta_w numeric;
BEGIN
  IF NEW.inventory_item_id IS NULL THEN RETURN NEW; END IF;
  old_q := COALESCE(OLD.quantity, 1); new_q := COALESCE(NEW.quantity, 1);
  old_w := COALESCE(OLD.weight, 0); new_w := COALESCE(NEW.weight, 0);
  delta_q := new_q - old_q;
  delta_w := (new_w * new_q) - (old_w * old_q);
  UPDATE public.inventory
    SET stock = stock + delta_q,
        weight = weight + delta_w,
        price_per_gram = COALESCE(NEW.price_per_gram, price_per_gram)
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.inv_apply_purchase_delete()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q integer; w numeric;
BEGIN
  IF OLD.inventory_item_id IS NULL THEN RETURN OLD; END IF;
  q := COALESCE(OLD.quantity, 1);
  w := COALESCE(OLD.weight, 0);
  UPDATE public.inventory
    SET stock = stock - q,
        weight = weight - (w * q)
  WHERE id = OLD.inventory_item_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS update_inventory_after_purchase ON public.purchase_items;
CREATE TRIGGER inv_purchase_after_insert
  AFTER INSERT ON public.purchase_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_purchase_insert();
CREATE TRIGGER inv_purchase_after_update
  AFTER UPDATE ON public.purchase_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_purchase_update();
CREATE TRIGGER inv_purchase_after_delete
  AFTER DELETE ON public.purchase_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_purchase_delete();

-- SALES
CREATE OR REPLACE FUNCTION public.inv_apply_sale_insert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q integer; w numeric; current_stock integer;
BEGIN
  IF NEW.inventory_item_id IS NULL THEN RETURN NEW; END IF;
  q := COALESCE(NEW.quantity, 1);
  w := COALESCE(NEW.weight, 0);
  SELECT stock INTO current_stock FROM public.inventory WHERE id = NEW.inventory_item_id FOR UPDATE;
  IF current_stock < q THEN
    RAISE EXCEPTION 'Insufficient stock: This item is out of inventory.';
  END IF;
  UPDATE public.inventory
    SET stock = stock - q,
        weight = weight - (w * q)
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.inv_apply_sale_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old_q integer; new_q integer; old_w numeric; new_w numeric; delta_q integer; delta_w numeric; current_stock integer;
BEGIN
  IF NEW.inventory_item_id IS NULL THEN RETURN NEW; END IF;
  old_q := COALESCE(OLD.quantity, 1); new_q := COALESCE(NEW.quantity, 1);
  old_w := COALESCE(OLD.weight, 0); new_w := COALESCE(NEW.weight, 0);
  delta_q := new_q - old_q;  -- positive if increasing sale quantity
  delta_w := (new_w * new_q) - (old_w * old_q);
  IF delta_q > 0 THEN
    SELECT stock INTO current_stock FROM public.inventory WHERE id = NEW.inventory_item_id FOR UPDATE;
    IF current_stock < delta_q THEN
      RAISE EXCEPTION 'Insufficient stock: This item is out of inventory.';
    END IF;
  END IF;
  UPDATE public.inventory
    SET stock = stock - delta_q,
        weight = weight - delta_w
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.inv_apply_sale_delete()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q integer; w numeric;
BEGIN
  IF OLD.inventory_item_id IS NULL THEN RETURN OLD; END IF;
  q := COALESCE(OLD.quantity, 1);
  w := COALESCE(OLD.weight, 0);
  UPDATE public.inventory
    SET stock = stock + q,
        weight = weight + (w * q)
  WHERE id = OLD.inventory_item_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS update_inventory_after_sale ON public.sales_items;
CREATE TRIGGER inv_sale_after_insert
  AFTER INSERT ON public.sales_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_sale_insert();
CREATE TRIGGER inv_sale_after_update
  AFTER UPDATE ON public.sales_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_sale_update();
CREATE TRIGGER inv_sale_after_delete
  AFTER DELETE ON public.sales_items FOR EACH ROW EXECUTE FUNCTION public.inv_apply_sale_delete();


