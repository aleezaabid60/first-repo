-- Enable btree_gist extension for exclusion constraints (preventing double booking)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Custom Types (with safety checks to avoid "already exists" errors)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_of_week') THEN
        CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'timerange') THEN
        CREATE TYPE timerange AS RANGE (subtype = time);
    END IF;
END $$;

-- ==========================================
-- 1. CORE ENTITIES
-- ==========================================

-- Teachers Table
-- Includes AI optimization fields for workload and prioritization
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    
    -- AI Optimization Fields
    max_weekly_hours INTEGER DEFAULT 40,
    preferred_hours INTEGER,
    priority_level INTEGER DEFAULT 1, -- Can be used to prioritize certain teachers during scheduling
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teacher-Subject Mapping Table (Many-to-Many)
-- Determines which teachers are qualified to teach which subjects
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, subject_id)
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'Room 101', 'Science Lab'
    capacity INTEGER NOT NULL,
    room_type VARCHAR(50), -- e.g., 'Lecture Hall', 'Lab'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table
-- Represents a group of students (e.g., Grade 10 Section A)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- e.g., 'Grade 10'
    section VARCHAR(10) NOT NULL, -- e.g., 'A'
    capacity INTEGER NOT NULL,
    home_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, section)
);

-- ==========================================
-- 2. SCHEDULING & AI AVAILABILITY
-- ==========================================

-- Teacher Availability Table
-- Used by the AI to know when a teacher is available to be scheduled
CREATE TABLE IF NOT EXISTS teacher_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true, -- true = available block, false = hard block (unavailable)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: start_time must be before end_time
    CONSTRAINT check_time_order CHECK (start_time < end_time),
    
    -- Prevent overlapping availability records for the same teacher on the same day
    EXCLUDE USING gist (
        teacher_id WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    )
);

-- Timetable Table
-- Core scheduling table
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: start_time must be before end_time
    CONSTRAINT check_time_order CHECK (start_time < end_time),
    
    -- Prevent double booking a teacher
    EXCLUDE USING gist (
        teacher_id WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    ),
    
    -- Prevent double booking a class
    EXCLUDE USING gist (
        class_id WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    ),
    
    -- Prevent double booking a room
    EXCLUDE USING gist (
        room_id WITH =,
        day_of_week WITH =,
        timerange(start_time, end_time) WITH &&
    )
);

-- Duties Table
-- For extra-curricular or administrative responsibilities
CREATE TABLE IF NOT EXISTS duties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duty_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL, -- Location of the duty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: start_time must be before end_time
    CONSTRAINT check_time_order CHECK (start_time < end_time),
    
    -- Prevent double booking a teacher for a duty on the same day
    EXCLUDE USING gist (
        teacher_id WITH =,
        duty_date WITH =,
        timerange(start_time, end_time) WITH &&
    )
);

-- ==========================================
-- 3. INDEXES & TRIGGERS
-- ==========================================

-- Indexes for frequent lookups and foreign keys
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher_id ON timetable(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class_id ON timetable(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_room_id ON timetable(room_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day_of_week ON timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_teacher_avail_teacher_id ON teacher_availability(teacher_id);
CREATE INDEX IF NOT EXISTS idx_duties_teacher_id ON duties(teacher_id);
CREATE INDEX IF NOT EXISTS idx_duties_duty_date ON duties(duty_date);

-- Trigger function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers to all tables
DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_availability_updated_at ON teacher_availability;
CREATE TRIGGER update_teacher_availability_updated_at BEFORE UPDATE ON teacher_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timetable_updated_at ON timetable;
CREATE TRIGGER update_timetable_updated_at BEFORE UPDATE ON timetable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Leave Requests Table
-- For managing staff leave applications and approvals
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Sick Leave', 'Annual Leave'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_date_order CHECK (start_date <= end_date)
);

-- Trigger for leave_requests
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

