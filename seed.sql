-- Clear existing data (Be careful running this in production!)
TRUNCATE TABLE public.duties CASCADE;
TRUNCATE TABLE public.timetable CASCADE;
TRUNCATE TABLE public.staff CASCADE;

-- Insert Staff
INSERT INTO public.staff (name, role, department, email) VALUES
('Mr Hamza', 'Teacher', 'Information Technology', 'hamza@rwu.edu.pk'),
('Ms Tabassum Kanwal', 'Teacher', 'Information Technology', 'tabassum@rwu.edu.pk'),
('Mr Umer sultan', 'Teacher', 'Information Technology', 'umer@rwu.edu.pk'),
('Dr Hshmat', 'Teacher', 'Mathematics', 'hshmat@rwu.edu.pk'),
('Dr Qurat ul Ain', 'Teacher', 'Islamic Studies', 'quratulain@rwu.edu.pk'),
('Ms Tayyba', 'Teacher', 'Information Technology', 'tayyba@rwu.edu.pk'),
('Mr Ahsan', 'Teacher', 'Information Technology', 'ahsan@rwu.edu.pk'),
('col batkhair', 'Teacher', 'Management', 'batkhair@rwu.edu.pk'),
('Ayesha Sarfraz', 'Teacher', 'English', 'ayesha@rwu.edu.pk'),
('Ms Mehwish', 'Teacher', 'English', 'mehwish@rwu.edu.pk'),
('Ms. Sana Ghafoor', 'Teacher', 'Social Sciences', 'sana@rwu.edu.pk'),
('Mr. Kashif', 'Teacher', 'Management', 'kashif@rwu.edu.pk'),
('Mr Zeeshan', 'Teacher', 'Information Technology', 'zeeshan@rwu.edu.pk'),
('kamran', 'Teacher', 'Information Technology', 'kamran@rwu.edu.pk'),
('Ms Attia', 'Teacher', 'Information Technology', 'attia@rwu.edu.pk'),
('MR Awais', 'Teacher', 'Information Technology', 'awais@rwu.edu.pk'),
('Mr Mujhaid', 'Teacher', 'Information Technology', 'mujhaid@rwu.edu.pk'),
('Dr. adnan', 'Teacher', 'Information Technology', 'adnan@rwu.edu.pk'),
('tariq', 'Teacher', 'Management', 'tariq@rwu.edu.pk'),
('haroon', 'Teacher', 'Management', 'haroon@rwu.edu.pk'),
('dr bilal', 'Teacher', 'Information Technology', 'bilal@rwu.edu.pk'),
('Dr. Ume Rubaca', 'Teacher', 'Information Technology', 'rubaca@rwu.edu.pk'),
('nighat', 'Teacher', 'Information Technology', 'nighat@rwu.edu.pk');

-- Insert Timetable (Semester 2)
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 1 (08:00 - 09:30)', 'Professional Practices', 'Semester 2 - Sec A', 'Room 101' FROM public.staff WHERE name = 'Mr Hamza';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Tuesday', 'Period 1 (08:00 - 09:30)', 'Professional Practices', 'Semester 2 - Sec B', 'Room 102' FROM public.staff WHERE name = 'Mr Hamza';

INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 2 (09:30 - 11:00)', 'Object Oriented Programming', 'Semester 2 - Sec A', 'Room 103' FROM public.staff WHERE name = 'Ms Tabassum Kanwal';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Wednesday', 'Period 2 (09:30 - 11:00)', 'OOP (Lab)', 'Semester 2 - Sec A', 'Lab 1' FROM public.staff WHERE name = 'Ms Tabassum Kanwal';

INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Tuesday', 'Period 3 (11:00 - 12:30)', 'Digital Logic Design', 'Semester 2 - Sec A', 'Room 104' FROM public.staff WHERE name = 'Mr Umer sultan';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Thursday', 'Period 3 (11:00 - 12:30)', 'DLD (Lab)', 'Semester 2 - Sec A', 'Lab 2' FROM public.staff WHERE name = 'Mr Umer sultan';

INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 4 (01:00 - 02:30)', 'Multivariable Calculus', 'Semester 2 - Sec A', 'Room 105' FROM public.staff WHERE name = 'Dr Hshmat';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Friday', 'Period 1 (08:00 - 09:30)', 'Islamic Studies', 'Semester 2 - Sec A', 'Room 106' FROM public.staff WHERE name = 'Dr Qurat ul Ain';

INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Wednesday', 'Period 4 (01:00 - 02:30)', 'Discrete Structures', 'Semester 2 - Sec A', 'Room 101' FROM public.staff WHERE name = 'Ms Tayyba';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Thursday', 'Period 4 (01:00 - 02:30)', 'Discrete Structures', 'Semester 2 - Sec B', 'Room 102' FROM public.staff WHERE name = 'Mr Ahsan';

-- Insert Timetable (Semester 4)
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 3 (11:00 - 12:30)', 'Intro to Management', 'Semester 4 - Sec A', 'Room 201' FROM public.staff WHERE name = 'col batkhair';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Tuesday', 'Period 4 (01:00 - 02:30)', 'Expository Writing', 'Semester 4 - Sec A', 'Room 202' FROM public.staff WHERE name = 'Ayesha Sarfraz';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Wednesday', 'Period 1 (08:00 - 09:30)', 'Expository Writing', 'Semester 4 - Sec B', 'Room 203' FROM public.staff WHERE name = 'Ms Mehwish';

INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Thursday', 'Period 2 (09:30 - 11:00)', 'Artificial Intelligence', 'Semester 4 - Sec A', 'Room 204' FROM public.staff WHERE name = 'Mr Umer sultan';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Friday', 'Period 2 (09:30 - 11:00)', 'Entrepreneurship', 'Semester 4 - Sec A', 'Room 205' FROM public.staff WHERE name = 'Mr. Kashif';

-- Insert Timetable (Semester 6)
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 1 (08:00 - 09:30)', 'IT Infrastructure', 'Semester 6 - Sec A', 'Room 301' FROM public.staff WHERE name = 'Mr Zeeshan';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Tuesday', 'Period 2 (09:30 - 11:00)', 'Cybersecurity', 'Semester 6 - Sec A', 'Room 302' FROM public.staff WHERE name = 'kamran';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Wednesday', 'Period 3 (11:00 - 12:30)', 'Cloud Computing', 'Semester 6 - Sec A', 'Room 303' FROM public.staff WHERE name = 'Ms Attia';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Thursday', 'Period 1 (08:00 - 09:30)', 'Network Security', 'Semester 6 - Sec A', 'Room 304' FROM public.staff WHERE name = 'MR Awais';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Friday', 'Period 3 (11:00 - 12:30)', 'Virtual Systems', 'Semester 6 - Sec A', 'Room 305' FROM public.staff WHERE name = 'Mr Mujhaid';

-- Insert Timetable (Semester 8)
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Monday', 'Period 2 (09:30 - 11:00)', 'Database Administration', 'Semester 8 - Sec A', 'Room 401' FROM public.staff WHERE name = 'Dr. adnan';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Tuesday', 'Period 1 (08:00 - 09:30)', 'Formal Methods', 'Semester 8 - Sec A', 'Room 402' FROM public.staff WHERE name = 'dr bilal';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Wednesday', 'Period 1 (08:00 - 09:30)', 'Entrepreneurship', 'Semester 8 - Sec A', 'Room 403' FROM public.staff WHERE name = 'tariq';
INSERT INTO public.timetable (staff_id, day_of_week, period, subject, class_name, room)
SELECT id, 'Thursday', 'Period 2 (09:30 - 11:00)', 'Professional Practices', 'Semester 8 - Sec A', 'Room 404' FROM public.staff WHERE name = 'Dr. Ume Rubaca';

