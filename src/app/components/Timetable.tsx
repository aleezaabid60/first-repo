'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, User, Sparkles, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

const timeSlots = [
  { id: 'Period 1', label: '08:00 - 09:30 AM' },
  { id: 'Period 2', label: '09:30 - 11:00 AM' },
  { id: 'Period 3', label: '11:00 - 12:30 PM' },
  { id: 'Period 4', label: '01:00 - 02:30 PM' },
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Course Assignments to schedule
const COURSE_ASSIGNMENTS = [
  { subject: 'Professional Practices', class_name: 'Semester 2 - Sec A', room: '101', teacher_name: 'Mr Hamza' },
  { subject: 'Professional Practices', class_name: 'Semester 2 - Sec B', room: '102', teacher_name: 'Mr Hamza' },
  { subject: 'Object Oriented Programming', class_name: 'Semester 2 - Sec A', room: '103', teacher_name: 'Ms Tabassum Kanwal' },
  { subject: 'OOP Lab', class_name: 'Semester 2 - Sec A', room: 'Lab 1', teacher_name: 'Ms Tabassum Kanwal' },
  { subject: 'Digital Logic', class_name: 'Semester 2 - Sec A', room: '104', teacher_name: 'Mr Umer sultan' },
  { subject: 'DLD Lab', class_name: 'Semester 2 - Sec A', room: 'Lab 2', teacher_name: 'Mr Umer sultan' },
  { subject: 'Calculus', class_name: 'Semester 2 - Sec A', room: '105', teacher_name: 'Dr Hshmat' },
  { subject: 'Islamic Studies', class_name: 'Semester 2 - Sec A', room: '106', teacher_name: 'Dr Qurat ul Ain' },
  { subject: 'Discrete Structures', class_name: 'Semester 2 - Sec A', room: '101', teacher_name: 'Ms Tayyba' },
  { subject: 'Discrete Structures', class_name: 'Semester 2 - Sec B', room: '102', teacher_name: 'Mr Ahsan' },
  { subject: 'Intro to Mgt', class_name: 'Semester 4 - Sec A', room: '201', teacher_name: 'col batkhair' },
  { subject: 'Expository Writing', class_name: 'Semester 4 - Sec A', room: '202', teacher_name: 'Ayesha Sarfraz' },
  { subject: 'Expository Writing', class_name: 'Semester 4 - Sec B', room: '203', teacher_name: 'Ms Mehwish' },
  { subject: 'AI', class_name: 'Semester 4 - Sec A', room: '204', teacher_name: 'Mr Umer sultan' },
  { subject: 'Entrepreneurship', class_name: 'Semester 4 - Sec A', room: '205', teacher_name: 'Mr. Kashif' },
  { subject: 'IT Infrastructure', class_name: 'Semester 6 - Sec A', room: '301', teacher_name: 'Mr Zeeshan' },
  { subject: 'Cybersecurity', class_name: 'Semester 6 - Sec A', room: '302', teacher_name: 'kamran' },
  { subject: 'Cloud Computing', class_name: 'Semester 6 - Sec A', room: '303', teacher_name: 'Ms Attia' },
  { subject: 'Network Security', class_name: 'Semester 6 - Sec A', room: '304', teacher_name: 'MR Awais' },
  { subject: 'Virtual Systems', class_name: 'Semester 6 - Sec A', room: '305', teacher_name: 'Mr Mujhaid' },
  { subject: 'Database', class_name: 'Semester 8 - Sec A', room: '401', teacher_name: 'Dr. adnan' },
  { subject: 'Formal Methods', class_name: 'Semester 8 - Sec A', room: '402', teacher_name: 'dr bilal' },
  { subject: 'Entrepreneurship', class_name: 'Semester 8 - Sec A', room: '403', teacher_name: 'tariq' },
  { subject: 'Professional Practices', class_name: 'Semester 8 - Sec A', room: '404', teacher_name: 'Dr. Ume Rubaca' },
];

const MOCK_STAFF = [
  { id: '1', name: 'Mr Hamza', role: 'Teacher', department: 'Information Technology' },
  { id: '2', name: 'Ms Tabassum Kanwal', role: 'Teacher', department: 'Information Technology' },
  { id: '3', name: 'Mr Umer sultan', role: 'Teacher', department: 'Information Technology' },
  { id: '4', name: 'Dr Hshmat', role: 'Teacher', department: 'Mathematics' },
  { id: '5', name: 'Dr Qurat ul Ain', role: 'Teacher', department: 'Islamic Studies' },
  { id: '6', name: 'Ms Tayyba', role: 'Teacher', department: 'Information Technology' },
  { id: '7', name: 'Mr Ahsan', role: 'Teacher', department: 'Information Technology' },
  { id: '8', name: 'col batkhair', role: 'Teacher', department: 'Management' },
  { id: '9', name: 'Ayesha Sarfraz', role: 'Teacher', department: 'English' },
  { id: '10', name: 'Ms Mehwish', role: 'Teacher', department: 'English' },
  { id: '11', name: 'Ms. Sana Ghafoor', role: 'Teacher', department: 'Social Sciences' },
  { id: '12', name: 'Mr. Kashif', role: 'Teacher', department: 'Management' },
  { id: '13', name: 'Mr Zeeshan', role: 'Teacher', department: 'Information Technology' },
  { id: '14', name: 'kamran', role: 'Teacher', department: 'Information Technology' },
  { id: '15', name: 'Ms Attia', role: 'Teacher', department: 'Information Technology' },
  { id: '16', name: 'MR Awais', role: 'Teacher', department: 'Information Technology' },
  { id: '17', name: 'Mr Mujhaid', role: 'Teacher', department: 'Information Technology' },
  { id: '18', name: 'Dr. adnan', role: 'Teacher', department: 'Information Technology' },
  { id: '19', name: 'tariq', role: 'Teacher', department: 'Management' },
  { id: '20', name: 'haroon', role: 'Teacher', department: 'Management' },
  { id: '21', name: 'dr bilal', role: 'Teacher', department: 'Information Technology' },
  { id: '22', name: 'Dr. Ume Rubaca', role: 'Teacher', department: 'Information Technology' },
  { id: '23', name: 'nighat', role: 'Teacher', department: 'Information Technology' }
];

// Mock timetable based on actual RWU Spring 2025 IT Dept data
const MOCK_TIMETABLE = [
  { id: '1', day_of_week: 'Monday', period: 'Period 1', subject: 'Prof. Practices', class_name: 'BSIT', room: '101', staff: { name: 'Mr. Hamza' } },
  { id: '2', day_of_week: 'Monday', period: 'Period 1', subject: 'IT Infrastructure', class_name: 'BSCS', room: '301', staff: { name: 'Mr. Zeeshan' } },
  { id: '3', day_of_week: 'Monday', period: 'Period 2', subject: 'OOP', class_name: 'BSIT', room: '103', staff: { name: 'Ms. Tabassum Kanwal' } },
  { id: '4', day_of_week: 'Monday', period: 'Period 2', subject: 'Database', class_name: 'BSCS', room: '401', staff: { name: 'Dr. Adnan' } },
  { id: '5', day_of_week: 'Monday', period: 'Period 3', subject: 'Intro to Mgt', class_name: 'BSIT', room: '201', staff: { name: 'Col. Batkhair' } },
  { id: '6', day_of_week: 'Monday', period: 'Period 4', subject: 'Calculus', class_name: 'BSIT', room: '105', staff: { name: 'Dr. Hshmat' } },
  { id: '7', day_of_week: 'Tuesday', period: 'Period 1', subject: 'Prof. Practices', class_name: 'BSIT', room: '102', staff: { name: 'Mr. Hamza' } },
  { id: '8', day_of_week: 'Tuesday', period: 'Period 2', subject: 'Cybersecurity', class_name: 'BSCS', room: '302', staff: { name: 'Mr. Kamran' } },
  { id: '9', day_of_week: 'Tuesday', period: 'Period 3', subject: 'Digital Logic', class_name: 'BSIT', room: '104', staff: { name: 'Mr. Umer Sultan' } },
  { id: '10', day_of_week: 'Tuesday', period: 'Period 4', subject: 'Expository Writing', class_name: 'BSIT', room: '202', staff: { name: 'Ms. Ayesha Sarfraz' } },
  { id: '11', day_of_week: 'Wednesday', period: 'Period 1', subject: 'Expository Writing', class_name: 'BSCS', room: '203', staff: { name: 'Ms. Mehwish' } },
  { id: '12', day_of_week: 'Wednesday', period: 'Period 2', subject: 'OOP Lab', class_name: 'BSIT', room: 'Lab 1', staff: { name: 'Ms. Tabassum Kanwal' } },
  { id: '13', day_of_week: 'Wednesday', period: 'Period 3', subject: 'Cloud Computing', class_name: 'BSCS', room: '303', staff: { name: 'Ms. Attia' } },
  { id: '14', day_of_week: 'Wednesday', period: 'Period 4', subject: 'Discrete Structures', class_name: 'BSIT', room: '101', staff: { name: 'Ms. Tayyba' } },
  { id: '15', day_of_week: 'Thursday', period: 'Period 1', subject: 'Network Security', class_name: 'BSCS', room: '304', staff: { name: 'Mr. Awais' } },
  { id: '16', day_of_week: 'Thursday', period: 'Period 2', subject: 'AI', class_name: 'BSIT', room: '204', staff: { name: 'Mr. Umer Sultan' } },
  { id: '17', day_of_week: 'Thursday', period: 'Period 3', subject: 'DLD Lab', class_name: 'BSIT', room: 'Lab 2', staff: { name: 'Mr. Umer Sultan' } },
  { id: '18', day_of_week: 'Thursday', period: 'Period 4', subject: 'Discrete Structures', class_name: 'BSCS', room: '102', staff: { name: 'Mr. Ahsan' } },
  { id: '19', day_of_week: 'Friday', period: 'Period 1', subject: 'Islamic Studies', class_name: 'BSIT', room: '106', staff: { name: 'Dr. Qurat ul Ain' } },
  { id: '20', day_of_week: 'Friday', period: 'Period 2', subject: 'Entrepreneurship', class_name: 'BSCS', room: '205', staff: { name: 'Mr. Kashif' } },
  { id: '21', day_of_week: 'Friday', period: 'Period 3', subject: 'Virtual Systems', class_name: 'BSCS', room: '305', staff: { name: 'Mr. Mujahid' } },
];

const subjectColors: Record<string, string> = {
  'OOP': '#4F9EFF', 'OOP Lab': '#4F9EFF',
  'Database': '#B8A3E8', 'Cybersecurity': '#B8A3E8', 'Network Security': '#B8A3E8',
  'AI': '#34D399', 'Cloud Computing': '#34D399',
  'Calculus': '#FBBF24', 'Discrete Structures': '#FBBF24',
  'Digital Logic': '#F87171', 'DLD Lab': '#F87171',
  'Prof. Practices': '#60A5FA', 'IT Infrastructure': '#60A5FA',
  'Expository Writing': '#A78BFA', 'Islamic Studies': '#A78BFA',
  'Entrepreneurship': '#FB923C', 'Virtual Systems': '#FB923C',
  'Intro to Mgt': '#2DD4BF', 'Formal Methods': '#2DD4BF',
};

const getColor = (subject: string) => subjectColors[subject] || '#6366f1';

const detectConflict = (item: any, classesInSlot: any[]) => {
  let hasTeacherConflict = false;
  let hasRoomConflict = false;

  const itemTeacher = item.staff?.name || item.staff_name || '';
  const itemRoom = item.room?.trim()?.toLowerCase() || '';

  classesInSlot.forEach(other => {
    if (other.id === item.id) return;

    // Check teacher conflict
    const otherTeacher = other.staff?.name || other.staff_name || '';
    if (itemTeacher && otherTeacher && itemTeacher.toLowerCase() === otherTeacher.toLowerCase()) {
      hasTeacherConflict = true;
    }

    // Check room conflict
    const otherRoom = other.room?.trim()?.toLowerCase() || '';
    if (itemRoom && otherRoom && itemRoom === otherRoom) {
      hasRoomConflict = true;
    }
  });

  return {
    hasTeacherConflict,
    hasRoomConflict,
    isConflict: hasTeacherConflict || hasRoomConflict
  };
};

export default function Timetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ occupied: 0, available: 0, rate: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  
  const [newEntry, setNewEntry] = useState({
    day_of_week: 'Monday',
    period: 'Period 1',
    subject: '',
    class_name: '',
    room: '',
    staff_name: ''
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    const totalSlots = timeSlots.length * days.length;
    // Count unique occupied grid cells
    const occupiedCells = new Set(timetable.map(t => `${t.day_of_week}-${t.period}`)).size;
    const available = totalSlots - occupiedCells;
    const rate = totalSlots > 0 ? Math.round((occupiedCells / totalSlots) * 100) : 0;
    setStats({ occupied: occupiedCells, available, rate });
  }, [timetable]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // 1. Fetch staff members
      const { data: staffData } = await supabase.from('staff').select('*');
      const dbStaff = staffData || MOCK_STAFF;
      setStaff(dbStaff);

      // 2. Fetch availability entries from database to sync
      const { data: availData } = await supabase
        .from('timetable')
        .select('*')
        .eq('subject', 'Timetable Availability');

      // Sync local storage with DB availability
      const savedAvailability = localStorage.getItem('rwu_timetable_availability');
      let activeAvail = savedAvailability ? JSON.parse(savedAvailability) : {};
      
      if (availData && availData.length > 0) {
        // Rebuild availability map from DB
        const dbAvailMap: Record<string, any> = {};
        dbStaff.forEach((s: any) => {
          dbAvailMap[s.id] = { is_available: true, schedule: [] };
        });
        
        availData.forEach((row: any) => {
          if (row.staff_id) {
            if (!dbAvailMap[row.staff_id]) {
              dbAvailMap[row.staff_id] = { is_available: true, schedule: [] };
            }
            dbAvailMap[row.staff_id].schedule.push({
              day: row.day_of_week,
              period: row.period
            });
          }
        });
        
        // Merge
        activeAvail = { ...activeAvail, ...dbAvailMap };
        localStorage.setItem('rwu_timetable_availability', JSON.stringify(activeAvail));
      }

      // 3. Fetch timetable classes
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          staff (id, name)
        `);

      if (error || !data || data.length === 0) {
        // Fallback to local storage or mock
        const savedData = localStorage.getItem('rwu_timetable_data');
        if (savedData) {
          setTimetable(JSON.parse(savedData));
        } else {
          setTimetable(MOCK_TIMETABLE);
        }
      } else {
        // Filter out availability items
        const actualClasses = data.filter((item: any) => 
          item.subject !== 'Duty Availability' && item.subject !== 'Timetable Availability'
        );
        setTimetable(actualClasses);
        localStorage.setItem('rwu_timetable_data', JSON.stringify(actualClasses));
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      const savedData = localStorage.getItem('rwu_timetable_data');
      if (savedData) {
        setTimetable(JSON.parse(savedData));
      } else {
        setTimetable(MOCK_TIMETABLE);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAvailabilityForTeacher = (name: string) => {
    const nameLower = name.toLowerCase();
    let schedule: { day: string; period: string }[] = [];

    if (nameLower.includes('hamza')) {
      schedule = [
        { day: 'Monday', period: 'Period 1' },
        { day: 'Tuesday', period: 'Period 1' }
      ];
    } else if (nameLower.includes('tabassum')) {
      schedule = [
        { day: 'Monday', period: 'Period 2' },
        { day: 'Wednesday', period: 'Period 2' }
      ];
    } else if (nameLower.includes('umer sultan')) {
      schedule = [
        { day: 'Tuesday', period: 'Period 3' },
        { day: 'Thursday', period: 'Period 3' },
        { day: 'Thursday', period: 'Period 2' }
      ];
    } else if (nameLower.includes('hshmat')) {
      schedule = [{ day: 'Monday', period: 'Period 4' }];
    } else if (nameLower.includes('qurat')) {
      schedule = [{ day: 'Friday', period: 'Period 1' }];
    } else if (nameLower.includes('tayyba')) {
      schedule = [{ day: 'Wednesday', period: 'Period 4' }];
    } else if (nameLower.includes('ahsan')) {
      schedule = [{ day: 'Thursday', period: 'Period 4' }];
    } else if (nameLower.includes('batkhair')) {
      schedule = [{ day: 'Monday', period: 'Period 3' }];
    } else if (nameLower.includes('ayesha')) {
      schedule = [{ day: 'Tuesday', period: 'Period 4' }];
    } else if (nameLower.includes('mehwish')) {
      schedule = [{ day: 'Wednesday', period: 'Period 1' }];
    } else if (nameLower.includes('kashif')) {
      schedule = [{ day: 'Friday', period: 'Period 2' }];
    } else if (nameLower.includes('zeeshan')) {
      schedule = [{ day: 'Monday', period: 'Period 1' }];
    } else if (nameLower.includes('kamran')) {
      schedule = [{ day: 'Tuesday', period: 'Period 2' }];
    } else if (nameLower.includes('attia')) {
      schedule = [{ day: 'Wednesday', period: 'Period 3' }];
    } else if (nameLower.includes('awais')) {
      schedule = [{ day: 'Thursday', period: 'Period 1' }];
    } else if (nameLower.includes('mujhaid')) {
      schedule = [{ day: 'Friday', period: 'Period 3' }];
    } else if (nameLower.includes('adnan')) {
      schedule = [{ day: 'Monday', period: 'Period 2' }];
    } else if (nameLower.includes('bilal')) {
      schedule = [{ day: 'Tuesday', period: 'Period 1' }];
    } else if (nameLower.includes('tariq')) {
      schedule = [{ day: 'Wednesday', period: 'Period 1' }];
    } else if (nameLower.includes('rubaca')) {
      schedule = [{ day: 'Thursday', period: 'Period 2' }];
    }

    return {
      is_available: true,
      schedule
    };
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const dbStaff = staff.length > 0 ? staff : MOCK_STAFF;
      
      // Load availability from local storage
      const savedAvailability = localStorage.getItem('rwu_timetable_availability');
      const activeAvail = savedAvailability ? JSON.parse(savedAvailability) : {};

      const generatedEntries: any[] = [];
      
      // Shuffle course assignments to make generation varied but deterministic
      const shuffledCourses = [...COURSE_ASSIGNMENTS].sort(() => 0.5 - Math.random());

      shuffledCourses.forEach(course => {
        const staffMember = dbStaff.find((s: any) => 
          s.name.toLowerCase().replace(/[^a-z]/g, '') === course.teacher_name.toLowerCase().replace(/[^a-z]/g, '')
        );
        
        if (staffMember) {
          const avail = activeAvail[staffMember.id] || getDefaultAvailabilityForTeacher(staffMember.name);
          
          if (avail && avail.is_available !== false && avail.schedule && avail.schedule.length > 0) {
            // Find a slot that doesn't conflict
            const validSlot = avail.schedule.find((slot: any) => {
              // Check if teacher is already scheduled in this slot
              const teacherConflict = generatedEntries.some(e => 
                e.day_of_week === slot.day && 
                e.period === slot.period && 
                e.staff_id === staffMember.id
              );
              
              // Check if room is already scheduled in this slot
              const roomConflict = generatedEntries.some(e => 
                e.day_of_week === slot.day && 
                e.period === slot.period && 
                e.room.trim().toLowerCase() === course.room.trim().toLowerCase()
              );
              
              return !teacherConflict && !roomConflict;
            });

            if (validSlot) {
              generatedEntries.push({
                day_of_week: validSlot.day,
                period: validSlot.period,
                subject: course.subject,
                class_name: course.class_name,
                room: course.room,
                staff_id: staffMember.id,
                staff: { name: staffMember.name }
              });
            }
          }
        }
      });

      if (generatedEntries.length === 0) {
        toast.error('No teacher availability matches the course assignments. Please configure teacher availability first.');
        setIsGenerating(false);
        return;
      }

      if (staff.length > 0 && staff !== MOCK_STAFF) {
        // Clear old actual classes from DB
        await supabase
          .from('timetable')
          .delete()
          .not('subject', 'in', '("Duty Availability","Timetable Availability")');

        const { data, error } = await supabase
          .from('timetable')
          .insert(generatedEntries.map(e => ({
            day_of_week: e.day_of_week,
            period: e.period,
            subject: e.subject,
            class_name: e.class_name,
            room: e.room,
            staff_id: e.staff_id
          })))
          .select(`*, staff(name)`);

        if (!error && data) {
          setTimetable(data);
          localStorage.setItem('rwu_timetable_data', JSON.stringify(data));
          toast.success(`Successfully generated ${data.length} timetable entries based on teacher availability!`);
        } else {
          throw error || new Error('Failed to insert generated timetable entries.');
        }
      } else {
        // Mock generation fallback
        const mockEntries = generatedEntries.map((e, idx) => ({
          id: `gen-${idx}`,
          ...e
        }));
        setTimetable(mockEntries);
        localStorage.setItem('rwu_timetable_data', JSON.stringify(mockEntries));
        toast.success(`Generated ${mockEntries.length} timetable entries locally (mock mode).`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'Failed to generate timetable'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.staff_name || !newEntry.subject || !newEntry.room) {
      toast.error('Please fill in all fields.');
      return;
    }

    const staffMember = staff.find(s => s.name === newEntry.staff_name);
    
    const entry = {
      day_of_week: newEntry.day_of_week,
      period: newEntry.period,
      subject: newEntry.subject,
      class_name: newEntry.class_name,
      room: newEntry.room,
      staff_id: staffMember ? staffMember.id : null,
      staff: { name: newEntry.staff_name }
    };

    if (staff.length > 0 && staff !== MOCK_STAFF) {
      const { data, error } = await supabase
        .from('timetable')
        .insert([{
          day_of_week: entry.day_of_week,
          period: entry.period,
          subject: entry.subject,
          class_name: entry.class_name,
          room: entry.room,
          staff_id: entry.staff_id
        }])
        .select(`*, staff(name)`);
        
      if (!error && data && data[0]) {
        const updated = [...timetable, data[0]];
        setTimetable(updated);
        localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
        toast.success('Timetable entry saved successfully.');
      } else {
        toast.error('Failed to save to database. Saved locally.');
        const localEntry = { id: Date.now().toString(), ...entry };
        const updated = [...timetable, localEntry];
        setTimetable(updated);
        localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
      }
    } else {
      const localEntry = { id: Date.now().toString(), ...entry };
      const updated = [...timetable, localEntry];
      setTimetable(updated);
      localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
      toast.success('Timetable entry saved locally.');
    }

    setIsManualOpen(false);
    setNewEntry({ day_of_week: 'Monday', period: 'Period 1', subject: '', class_name: '', room: '', staff_name: '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry.staff_name || !editingEntry.subject || !editingEntry.room) {
      toast.error('Please fill in all fields.');
      return;
    }

    const staffMember = staff.find(s => s.name === editingEntry.staff_name);
    
    const entry = {
      day_of_week: editingEntry.day_of_week,
      period: editingEntry.period,
      subject: editingEntry.subject,
      class_name: editingEntry.class_name,
      room: editingEntry.room,
      staff_id: staffMember ? staffMember.id : null,
      staff: { name: editingEntry.staff_name }
    };

    const isMock = editingEntry.id.toString().startsWith('gen-') || !timetable.some(t => t.id === editingEntry.id && typeof t.id === 'number');

    if (staff.length > 0 && staff !== MOCK_STAFF && !isMock) {
      const { data, error } = await supabase
        .from('timetable')
        .update({
          day_of_week: entry.day_of_week,
          period: entry.period,
          subject: entry.subject,
          class_name: entry.class_name,
          room: entry.room,
          staff_id: entry.staff_id
        })
        .eq('id', editingEntry.id)
        .select(`*, staff(name)`);
        
      if (!error && data && data[0]) {
        const updated = timetable.map(t => t.id === editingEntry.id ? data[0] : t);
        setTimetable(updated);
        localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
        toast.success('Timetable entry updated successfully.');
      } else {
        toast.error('Failed to update in database.');
      }
    } else {
      const updated = timetable.map(t => t.id === editingEntry.id ? { ...t, ...entry } : t);
      setTimetable(updated);
      localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
      toast.success('Timetable entry updated locally.');
    }

    setIsEditClassOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const isMock = id.toString().startsWith('gen-') || !timetable.some(t => t.id === id && typeof t.id === 'number');
      if (staff.length > 0 && staff !== MOCK_STAFF && !isMock) {
        const { error } = await supabase.from('timetable').delete().eq('id', id);
        if (error) throw error;
      }
      const updated = timetable.filter(t => t.id !== id);
      setTimetable(updated);
      localStorage.setItem('rwu_timetable_data', JSON.stringify(updated));
      toast.success('Timetable entry deleted successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete entry.');
    }
  };

  const getClassesForSlot = (day: string, period: string) => {
    return timetable.filter((item) => item.day_of_week === day && item.period === period);
  };

  const handleAvailableClick = (day: string, period: string) => {
    setNewEntry({
      day_of_week: day,
      period: period,
      subject: '',
      class_name: '',
      room: '',
      staff_name: ''
    });
    setIsManualOpen(true);
  };

  const handleClassClick = (classData: any) => {
    setEditingEntry({
      id: classData.id,
      day_of_week: classData.day_of_week,
      period: classData.period,
      subject: classData.subject,
      class_name: classData.class_name,
      room: classData.room,
      staff_name: classData.staff?.name || classData.staff_name || ''
    });
    setIsEditClassOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Timetable Matrix</h2>
          <p className="text-muted-foreground">Weekly class schedule matching teacher availability</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
          <button
            onClick={() => setIsManualOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Manual Entry
          </button>
        </div>
      </div>

      <div className="rounded-2xl border backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left font-semibold text-foreground bg-white/5">Time</th>
                {days.map((day) => (
                  <th key={day} className="p-4 text-center font-semibold text-foreground bg-white/5">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.id} className="border-b border-white/5">
                  <td className="p-4 font-medium text-muted-foreground bg-white/3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {slot.label}
                    </div>
                  </td>
                  {days.map((day) => {
                    const classesData = getClassesForSlot(day, slot.id);

                    if (classesData.length === 0) {
                      return (
                        <td key={`${day}-${slot.id}`} className="p-3 min-w-[140px]">
                          <div
                            onClick={() => handleAvailableClick(day, slot.id)}
                            className="p-3 rounded-xl border border-dashed border-white/10 bg-white/3 hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer"
                          >
                            <p className="text-xs text-muted-foreground text-center">Available</p>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={`${day}-${slot.id}`} className="p-3 min-w-[140px] space-y-2">
                        {classesData.map((classData, idx) => {
                          const conflictInfo = detectConflict(classData, classesData);
                          const color = conflictInfo.isConflict ? '#ef4444' : getColor(classData.subject);
                          
                          let badgeText = '';
                          if (conflictInfo.hasTeacherConflict && conflictInfo.hasRoomConflict) {
                            badgeText = 'Teacher & Room Conflict';
                          } else if (conflictInfo.hasTeacherConflict) {
                            badgeText = 'Teacher Conflict';
                          } else if (conflictInfo.hasRoomConflict) {
                            badgeText = 'Room Conflict';
                          }

                          return (
                            <div
                              key={classData.id || idx}
                              onClick={() => handleClassClick(classData)}
                              className="p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group/item text-left"
                              style={{
                                backgroundColor: conflictInfo.isConflict ? 'rgba(239, 68, 68, 0.12)' : `${color}15`,
                                borderColor: conflictInfo.isConflict ? 'rgba(239, 68, 68, 0.4)' : `${color}40`,
                              }}
                            >
                              {conflictInfo.isConflict && (
                                <div className="absolute top-0 right-0 bg-red-500 text-[7px] font-bold text-white px-1.5 py-0.5 rounded-bl-lg uppercase">
                                  {badgeText}
                                </div>
                              )}
                              <div
                                  className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  style={{
                                    background: conflictInfo.isConflict 
                                      ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.25), transparent)' 
                                      : `radial-gradient(circle at center, ${color}30, transparent)`,
                                  }}
                                />
                              <div className="relative z-10 space-y-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEntry(classData.id);
                                  }}
                                  className="absolute top-0 right-0 p-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  title="Delete Entry"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                                <h4 className="font-semibold text-foreground text-[11px] leading-tight pr-4">{classData.subject}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{classData.staff?.name || classData.staff_name || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span>Room {classData.room}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupied Slots</p>
              <p className="text-xl font-semibold text-foreground">{stats.occupied}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Slots</p>
              <p className="text-xl font-semibold text-foreground">{stats.available}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-xl font-semibold text-foreground">{stats.rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Manual Entry Dialog */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f1521] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Manual Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <select
                  id="day"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  value={newEntry.day_of_week}
                  onChange={(e) => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                >
                  {days.map(d => <option key={d} value={d} className="bg-[#0f1521]">{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <select
                  id="period"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  value={newEntry.period}
                  onChange={(e) => setNewEntry({ ...newEntry, period: e.target.value })}
                >
                  {timeSlots.map(t => <option key={t.id} value={t.id} className="bg-[#0f1521]">{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Data Structures"
                value={newEntry.subject}
                onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                className="bg-white/5 border border-white/10 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_name">Class Name</Label>
                <Input
                  id="class_name"
                  placeholder="e.g. BSCS-3"
                  value={newEntry.class_name}
                  onChange={(e) => setNewEntry({ ...newEntry, class_name: e.target.value })}
                  className="bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="e.g. 101"
                  value={newEntry.room}
                  onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                  className="bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Name</Label>
              <select
                id="staff"
                className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                value={newEntry.staff_name}
                onChange={(e) => setNewEntry({ ...newEntry, staff_name: e.target.value })}
                required
              >
                <option value="" disabled className="bg-[#0f1521]">Select staff...</option>
                {staff.map((s: any) => (
                  <option key={s.id} value={s.name} className="bg-[#0f1521]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsManualOpen(false)} className="border-white/10 text-foreground hover:bg-white/5 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Save Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f1521] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Timetable Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_day">Day</Label>
                  <select
                    id="edit_day"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    value={editingEntry.day_of_week}
                    onChange={(e) => setEditingEntry({ ...editingEntry, day_of_week: e.target.value })}
                  >
                    {days.map(d => <option key={d} value={d} className="bg-[#0f1521]">{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_period">Period</Label>
                  <select
                    id="edit_period"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    value={editingEntry.period}
                    onChange={(e) => setEditingEntry({ ...editingEntry, period: e.target.value })}
                  >
                    {timeSlots.map(t => <option key={t.id} value={t.id} className="bg-[#0f1521]">{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_subject">Subject</Label>
                <Input
                  id="edit_subject"
                  placeholder="e.g. Data Structures"
                  value={editingEntry.subject}
                  onChange={(e) => setEditingEntry({ ...editingEntry, subject: e.target.value })}
                  className="bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_class_name">Class Name</Label>
                  <Input
                    id="edit_class_name"
                    placeholder="e.g. BSCS-3"
                    value={editingEntry.class_name}
                    onChange={(e) => setEditingEntry({ ...editingEntry, class_name: e.target.value })}
                    className="bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_room">Room</Label>
                  <Input
                    id="edit_room"
                    placeholder="e.g. 101"
                    value={editingEntry.room}
                    onChange={(e) => setEditingEntry({ ...editingEntry, room: e.target.value })}
                    className="bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_staff">Staff Name</Label>
                <select
                  id="edit_staff"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                  value={editingEntry.staff_name}
                  onChange={(e) => setEditingEntry({ ...editingEntry, staff_name: e.target.value })}
                  required
                >
                  <option value="" disabled className="bg-[#0f1521]">Select staff...</option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.name} className="bg-[#0f1521]">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter className="pt-4 flex justify-between items-center w-full gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDeleteEntry(editingEntry.id);
                    setIsEditClassOpen(false);
                    setEditingEntry(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white mr-auto"
                >
                  Delete Entry
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditClassOpen(false)} className="border-white/10 text-foreground hover:bg-white/5 hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Save Changes</Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
