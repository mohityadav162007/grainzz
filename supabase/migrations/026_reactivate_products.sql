-- Reactivate all products that were accidentally deactivated
UPDATE products SET is_active = true WHERE is_active = false;
