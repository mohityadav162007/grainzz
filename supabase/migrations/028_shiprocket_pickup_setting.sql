-- Add Shiprocket Pickup Location Setting
INSERT INTO store_settings (key, value, description)
VALUES ('shiprocket_pickup_location', 'Primary', 'The nickname of the pickup location configured in Shiprocket (must match exactly).')
ON CONFLICT (key) DO NOTHING;
