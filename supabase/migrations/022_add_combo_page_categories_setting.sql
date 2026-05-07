-- ============================================================================
-- Insert Combos Page Categories setting
-- ============================================================================

INSERT INTO store_settings (key, value, description)
VALUES ('combo_page_categories', 'Combos, Gift Packs', 'Comma-separated list of categories to display on the Combos page.')
ON CONFLICT (key) DO NOTHING;
