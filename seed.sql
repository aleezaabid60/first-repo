-- Seed data for AI-Based Duty Scheduling and Timetable System

-- 1. Insert Teachers
INSERT INTO teachers (first_name, last_name, email, phone, department, max_weekly_hours, priority_level)
VALUES 
('Sarah', 'Khan', 'sarah.khan@example.com', '1234567890', 'Computer Science', 35, 1),
('Ahmed', 'Ali', 'ahmed.ali@example.com', '2345678901', 'Mathematics', 40, 2),
('Fatima', 'Noor', 'fatima.noor@example.com', '3456789012', 'Physics', 30, 1),
('Ayesha', 'Malik', 'ayesha.malik@example.com', '4567890123', 'English', 40, 3),
('Hina', 'Shah', 'hina.shah@example.com', '5678901234', 'Chemistry', 35, 2);

-- 2. Insert Subjects
INSERT INTO subjects (code, name, department)
VALUES 
('CS101', 'Introduction to Computing', 'Computer Science'),
('MATH201', 'Calculus I', 'Mathematics'),
('PHYS101', 'General Physics', 'Physics'),
('ENG101', 'Functional English', 'English'),
('CHEM101', 'Organic Chemistry', 'Chemistry');

-- 3. Insert Rooms
INSERT INTO rooms (name, capacity, room_type)
VALUES 
('Lab 101', 30, 'Lab'),
('Room 203', 40, 'Lecture Hall'),
('Lab 202', 25, 'Lab'),
('Room 105', 35, 'Lecture Hall'),
('Lab 303', 30, 'Lab');

-- 4. Insert Classes
INSERT INTO classes (name, section, capacity, home_room_id)
SELECT 'Grade 10', 'A', 30, id FROM rooms WHERE name = 'Room 203' LIMIT 1;

INSERT INTO classes (name, section, capacity, home_room_id)
SELECT 'Grade 11', 'B', 35, id FROM rooms WHERE name = 'Room 105' LIMIT 1;

-- 5. Insert Teacher-Subject Mappings
INSERT INTO teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id FROM teachers t, subjects s WHERE t.last_name = 'Khan' AND s.code = 'CS101';

INSERT INTO teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id FROM teachers t, subjects s WHERE t.last_name = 'Ali' AND s.code = 'MATH201';

-- 6. Insert Leave Requests
INSERT INTO leave_requests (teacher_id, type, start_date, end_date, status)
SELECT id, 'Sick Leave', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'pending' FROM teachers WHERE last_name = 'Ali';

INSERT INTO leave_requests (teacher_id, type, start_date, end_date, status)
SELECT id, 'Annual Leave', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '15 days', 'pending' FROM teachers WHERE last_name = 'Shah';

-- 7. Insert Timetable Entries
INSERT INTO timetable (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time)
SELECT 
    c.id, s.id, t.id, r.id, 'Monday', '08:00:00', '09:30:00'
FROM classes c, subjects s, teachers t, rooms r
WHERE c.name = 'Grade 10' AND s.code = 'CS101' AND t.last_name = 'Khan' AND r.name = 'Lab 101' LIMIT 1;

INSERT INTO timetable (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time)
SELECT 
    c.id, s.id, t.id, r.id, 'Monday', '11:00:00', '12:30:00'
FROM classes c, subjects s, teachers t, rooms r
WHERE c.name = 'Grade 10' AND s.code = 'MATH201' AND t.last_name = 'Ali' AND r.name = 'Room 203' LIMIT 1;
