-- Fix search_path for update_inventory_on_sale function
CREATE OR REPLACE FUNCTION public.update_inventory_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.inventory
    SET weight = weight - NEW.weight,
        stock = stock - 1
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix search_path for update_inventory_on_purchase function
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.inventory
    SET weight = weight + NEW.weight,
        stock = stock + 1
    WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$function$;