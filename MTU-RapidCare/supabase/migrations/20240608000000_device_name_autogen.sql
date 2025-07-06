-- Migration: Auto-generate device_name as RapidCare-XX

-- Add device_number column
ALTER TABLE public.devices ADD COLUMN device_number SERIAL UNIQUE;

-- Create trigger function to set device_name
CREATE OR REPLACE FUNCTION set_device_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.device_name := 'RapidCare-' || LPAD(NEW.device_number::text, 2, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_device_name_trigger
  BEFORE INSERT ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION set_device_name(); 