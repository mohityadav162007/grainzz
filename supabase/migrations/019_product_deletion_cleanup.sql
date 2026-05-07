-- ============================================================================
-- Product Deletion Cleanup — Auto-remove orphan product references
-- ============================================================================
-- When a product is deleted, this trigger automatically cleans up references
-- stored in JSON blobs in the store_settings table (product_tabs, team_favourites,
-- powered_by cards). Foreign-keyed tables (related_products_section, reviews,
-- offer_products) already have ON DELETE CASCADE so they self-clean.
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_product_references()
RETURNS TRIGGER AS $$
DECLARE
  deleted_id TEXT;
  current_value TEXT;
  parsed JSONB;
  tab JSONB;
  new_tabs JSONB;
  new_ids JSONB;
  i INT;
BEGIN
  deleted_id := OLD.id::TEXT;

  -- ─── 1. Clean product_tabs_json ──────────────────────────────────────
  SELECT value INTO current_value
    FROM store_settings WHERE key = 'product_tabs_json';

  IF current_value IS NOT NULL THEN
    BEGIN
      parsed := current_value::JSONB;
      IF jsonb_typeof(parsed) = 'array' THEN
        new_tabs := '[]'::JSONB;
        FOR i IN 0..jsonb_array_length(parsed) - 1 LOOP
          tab := parsed->i;
          -- Remove deleted product_id from the product_ids array
          new_ids := '[]'::JSONB;
          IF tab->'product_ids' IS NOT NULL AND jsonb_typeof(tab->'product_ids') = 'array' THEN
            SELECT COALESCE(jsonb_agg(elem), '[]'::JSONB) INTO new_ids
              FROM jsonb_array_elements_text(tab->'product_ids') AS elem
              WHERE elem != deleted_id;
          END IF;
          new_tabs := new_tabs || jsonb_build_array(
            jsonb_set(tab, '{product_ids}', new_ids)
          );
        END LOOP;
        UPDATE store_settings SET value = new_tabs::TEXT WHERE key = 'product_tabs_json';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If JSON is malformed, skip silently
      NULL;
    END;
  END IF;

  -- ─── 2. Clean team_favourites ────────────────────────────────────────
  SELECT value INTO current_value
    FROM store_settings WHERE key = 'team_favourites';

  IF current_value IS NOT NULL THEN
    BEGIN
      parsed := current_value::JSONB;
      IF parsed->'product_ids' IS NOT NULL AND jsonb_typeof(parsed->'product_ids') = 'array' THEN
        SELECT COALESCE(jsonb_agg(elem), '[]'::JSONB) INTO new_ids
          FROM jsonb_array_elements_text(parsed->'product_ids') AS elem
          WHERE elem != deleted_id;
        parsed := jsonb_set(parsed, '{product_ids}', new_ids);
        UPDATE store_settings SET value = parsed::TEXT WHERE key = 'team_favourites';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- ─── 3. Clean powered_by_json ────────────────────────────────────────
  SELECT value INTO current_value
    FROM store_settings WHERE key = 'powered_by_json';

  IF current_value IS NOT NULL THEN
    BEGIN
      parsed := current_value::JSONB;
      IF jsonb_typeof(parsed) = 'array' THEN
        new_tabs := '[]'::JSONB;
        FOR i IN 0..jsonb_array_length(parsed) - 1 LOOP
          tab := parsed->i;
          IF (tab->>'product_id') = deleted_id THEN
            -- Nullify the product reference on this card
            tab := tab - 'product_id';
            tab := jsonb_set(tab, '{title}', '""'::JSONB);
            tab := jsonb_set(tab, '{link}', '"#"'::JSONB);
          END IF;
          new_tabs := new_tabs || jsonb_build_array(tab);
        END LOOP;
        UPDATE store_settings SET value = new_tabs::TEXT WHERE key = 'powered_by_json';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- ─── 4. Clean homepage_sections product_ids arrays ───────────────────
  UPDATE homepage_sections
    SET product_ids = array_remove(product_ids, OLD.id)
    WHERE OLD.id = ANY(product_ids);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger BEFORE DELETE so it runs for every product deletion
DROP TRIGGER IF EXISTS trg_cleanup_product_refs ON products;
CREATE TRIGGER trg_cleanup_product_refs
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_product_references();
