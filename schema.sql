-- Create staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create timetable table
CREATE TABLE IF NOT EXISTS public.timetable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    period TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create duties table
CREATE TABLE IF NOT EXISTS public.duties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    duty_date DATE NOT NULL,
    duty_type TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duties ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all access for now, assuming client acts as admin or we handle auth later)
-- Note: In a production app, these should be restricted based on user roles.
DO $$ 
BEGIN
    -- Drop existing policies if they exist to make the script idempotent
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.staff;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.staff;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON public.staff;
    
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.timetable;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.timetable;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.timetable;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON public.timetable;
    
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.duties;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.duties;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.duties;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON public.duties;
END $$;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.staff FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.staff FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.timetable FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.timetable FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.timetable FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.duties FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.duties FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.duties FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.duties FOR DELETE USING (true);
