-- Add show_sale_page setting to store_settings
INSERT INTO store_settings (key, value, description) 
VALUES ('show_sale_page', 'true', 'Whether to show the Sale page and menu item on the website.')
ON CONFLICT (key) DO NOTHING;
