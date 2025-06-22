-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id TEXT NOT NULL,
    message TEXT DEFAULT 'Emergency alert triggered!',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all alerts"
    ON public.alerts
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create alerts"
    ON public.alerts
    FOR INSERT
    WITH CHECK (auth.uid()::text = sender_id);

-- Grant necessary permissions
GRANT ALL ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at); 