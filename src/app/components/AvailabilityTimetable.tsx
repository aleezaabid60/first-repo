'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Clock, Plus, Trash2, Edit2, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

// Mock staff fallback
const MOCK_STAFF = [
  { id: '1', name: 'Mr Hamza', role: 'Teacher', department: 'Information Technology', email: 'hamza@rwu.edu.pk' },
  { id: '2', name: 'Ms Tabassum Kanwal', role: 'Teacher', department: 'Information Technology', email: 'tabassum@rwu.edu.pk' },
  { id: '3', name: 'Mr Umer sultan', role: 'Teacher', department: 'Information Technology', email: 'umer@rwu.edu.pk' },
  { id: '4', name: 'Dr Hshmat', role: 'Teacher', department: 'Mathematics', email: 'hshmat@rwu.edu.pk' },
  { id: '5', name: 'Dr Qurat ul Ain', role: 'Teacher', department: 'Islamic Studies', email: 'quratulain@rwu.edu.pk' },
  { id: '6', name: 'Ms Tayyba', role: 'Teacher', department: 'Information Technology', email: 'tayyba@rwu.edu.pk' },
  { id: '7', name: 'Mr Ahsan', role: 'Teacher', department: 'Information Technology', email: 'ahsan@rwu.edu.pk' },
  { id: '8', name: 'col batkhair', role: 'Teacher', department: 'Management', email: 'batkhair@rwu.edu.pk' },
  { id: '9', name: 'Ayesha Sarfraz', role: 'Teacher', department: 'English', email: 'ayesha@rwu.edu.pk' },
  { id: '10', name: 'Ms Mehwish', role: 'Teacher', department: 'English', email: 'mehwish@rwu.edu.pk' },
  { id: '11', name: 'Ms. Sana Ghafoor', role: 'Teacher', department: 'Social Sciences', email: 'sana@rwu.edu.pk' },
  { id: '12', name: 'Mr. Kashif', role: 'Teacher', department: 'Management', email: 'kashif@rwu.edu.pk' },
  { id: '13', name: 'Mr Zeeshan', role: 'Teacher', department: 'Information Technology', email: 'zeeshan@rwu.edu.pk' },
  { id: '14', name: 'kamran', role: 'Teacher', department: 'Information Technology', email: 'kamran@rwu.edu.pk' },
  { id: '15', name: 'Ms Attia', role: 'Teacher', department: 'Information Technology', email: 'attia@rwu.edu.pk' },
  { id: '16', name: 'MR Awais', role: 'Teacher', department: 'Information Technology', email: 'awais@rwu.edu.pk' },
  { id: '17', name: 'Mr Mujhaid', role: 'Teacher', department: 'Information Technology', email: 'mujhaid@rwu.edu.pk' },
  { id: '18', name: 'Dr. adnan', role: 'Teacher', department: 'Information Technology', email: 'adnan@rwu.edu.pk' },
  { id: '19', name: 'tariq', role: 'Teacher', department: 'Management', email: 'tariq@rwu.edu.pk' },
  { id: '20', name: 'haroon', role: 'Teacher', department: 'Management', email: 'haroon@rwu.edu.pk' },
  { id: '21', name: 'dr bilal', role: 'Teacher', department: 'Information Technology', email: 'bilal@rwu.edu.pk' },
  { id: '22', name: 'Dr. Ume Rubaca', role: 'Teacher', department: 'Information Technology', email: 'rubaca@rwu.edu.pk' },
  { id: '23', name: 'nighat', role: 'Teacher', department: 'Information Technology', email: 'nighat@rwu.edu.pk' }
];

// Initial course assignment templates to know who teaches what
const COURSE_ASSIGNMENTS = [
  { subject: 'Professional Practices', class_name: 'Semester 2 - Sec A', room: 'Room 101', teacher_name: 'Mr Hamza' },
  { subject: 'Professional Practices', class_name: 'Semester 2 - Sec B', room: 'Room 102', teacher_name: 'Mr Hamza' },
  { subject: 'Object Oriented Programming', class_name: 'Semester 2 - Sec A', room: 'Room 103', teacher_name: 'Ms Tabassum Kanwal' },
  { subject: 'OOP (Lab)', class_name: 'Semester 2 - Sec A', room: 'Lab 1', teacher_name: 'Ms Tabassum Kanwal' },
  { subject: 'Digital Logic Design', class_name: 'Semester 2 - Sec A', room: 'Room 104', teacher_name: 'Mr Umer sultan' },
  { subject: 'DLD (Lab)', class_name: 'Semester 2 - Sec A', room: 'Lab 2', teacher_name: 'Mr Umer sultan' },
  { subject: 'Multivariable Calculus', class_name: 'Semester 2 - Sec A', room: 'Room 105', teacher_name: 'Dr Hshmat' },
  { subject: 'Islamic Studies', class_name: 'Semester 2 - Sec A', room: 'Room 106', teacher_name: 'Dr Qurat ul Ain' },
  { subject: 'Discrete Structures', class_name: 'Semester 2 - Sec A', room: 'Room 101', teacher_name: 'Ms Tayyba' },
  { subject: 'Discrete Structures', class_name: 'Semester 2 - Sec B', room: 'Room 102', teacher_name: 'Mr Ahsan' },
  { subject: 'Intro to Management', class_name: 'Semester 4 - Sec A', room: 'Room 201', teacher_name: 'col batkhair' },
  { subject: 'Expository Writing', class_name: 'Semester 4 - Sec A', room: 'Room 202', teacher_name: 'Ayesha Sarfraz' },
  { subject: 'Expository Writing', class_name: 'Semester 4 - Sec B', room: 'Room 203', teacher_name: 'Ms Mehwish' },
  { subject: 'Artificial Intelligence', class_name: 'Semester 4 - Sec A', room: 'Room 204', teacher_name: 'Mr Umer sultan' },
  { subject: 'Entrepreneurship', class_name: 'Semester 4 - Sec A', room: 'Room 205', teacher_name: 'Mr. Kashif' },
  { subject: 'IT Infrastructure', class_name: 'Semester 6 - Sec A', room: 'Room 301', teacher_name: 'Mr Zeeshan' },
  { subject: 'Cybersecurity', class_name: 'Semester 6 - Sec A', room: 'Room 302', teacher_name: 'kamran' },
  { subject: 'Cloud Computing', class_name: 'Semester 6 - Sec A', room: 'Room 303', teacher_name: 'Ms Attia' },
  { subject: 'Network Security', class_name: 'Semester 6 - Sec A', room: 'Room 304', teacher_name: 'MR Awais' },
  { subject: 'Virtual Systems', class_name: 'Semester 6 - Sec A', room: 'Room 305', teacher_name: 'Mr Mujhaid' },
  { subject: 'Database Administration', class_name: 'Semester 8 - Sec A', room: 'Room 401', teacher_name: 'Dr. adnan' },
  { subject: 'Formal Methods', class_name: 'Semester 8 - Sec A', room: 'Room 402', teacher_name: 'dr bilal' },
  { subject: 'Entrepreneurship', class_name: 'Semester 8 - Sec A', room: 'Room 403', teacher_name: 'tariq' },
  { subject: 'Professional Practices', class_name: 'Semester 8 - Sec A', room: 'Room 404', teacher_name: 'Dr. Ume Rubaca' },
];

const timeSlots = [
  { id: 'Period 1', label: '08:00 - 09:30 AM' },
  { id: 'Period 2', label: '09:30 - 11:00 AM' },
  { id: 'Period 3', label: '11:00 - 12:30 PM' },
  { id: 'Period 4', label: '01:00 - 02:30 PM' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface TimetableAvailabilitySlot {
  day: string;
  period: string; // 'Period 1', 'Period 2', etc.
}

interface TeacherTimetableAvailability {
  is_available: boolean;
  schedule: TimetableAvailabilitySlot[];
}

export default function AvailabilityTimetable() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'teacher' | 'day'>('teacher');
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, TeacherTimetableAvailability>>({});
  
  // Edit modal state
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editSchedule, setEditSchedule] = useState<TimetableAvailabilitySlot[]>([]);
  
  // New slot form state
  const [newDay, setNewDay] = useState('Monday');
  const [newPeriod, setNewPeriod] = useState('Period 1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch staff members
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      let currentStaff = staffData || MOCK_STAFF;
      if (staffError || !staffData || staffData.length === 0) {
        currentStaff = MOCK_STAFF;
      }
      setStaff(currentStaff);

      // 2. Load timetable availability from localStorage
      const savedAvailability = localStorage.getItem('rwu_timetable_availability');
      let localMap: Record<string, TeacherTimetableAvailability> = {};
      if (savedAvailability) {
        try {
          localMap = JSON.parse(savedAvailability);
        } catch (e) {
          console.error('Error parsing timetable availability from localStorage', e);
        }
      }

      // Initialize missing teachers in localMap with default slots based on seed data
      currentStaff.forEach((s) => {
        if (!localMap[s.id]) {
          const nameLower = s.name.toLowerCase();
          if (nameLower.includes('hamza')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Monday', period: 'Period 1' },
                { day: 'Tuesday', period: 'Period 1' }
              ]
            };
          } else if (nameLower.includes('tabassum')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Monday', period: 'Period 2' },
                { day: 'Wednesday', period: 'Period 2' }
              ]
            };
          } else if (nameLower.includes('umer sultan')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Tuesday', period: 'Period 3' },
                { day: 'Thursday', period: 'Period 3' },
                { day: 'Thursday', period: 'Period 2' }
              ]
            };
          } else if (nameLower.includes('hshmat')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Monday', period: 'Period 4' }]
            };
          } else if (nameLower.includes('qurat')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Friday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('tayyba')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Wednesday', period: 'Period 4' }]
            };
          } else if (nameLower.includes('ahsan')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Thursday', period: 'Period 4' }]
            };
          } else if (nameLower.includes('batkhair')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Monday', period: 'Period 3' }]
            };
          } else if (nameLower.includes('ayesha')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Tuesday', period: 'Period 4' }]
            };
          } else if (nameLower.includes('mehwish')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Wednesday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('kashif')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Friday', period: 'Period 2' }]
            };
          } else if (nameLower.includes('zeeshan')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Monday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('kamran')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Tuesday', period: 'Period 2' }]
            };
          } else if (nameLower.includes('attia')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Wednesday', period: 'Period 3' }]
            };
          } else if (nameLower.includes('awais')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Thursday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('mujhaid')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Friday', period: 'Period 3' }]
            };
          } else if (nameLower.includes('adnan')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Monday', period: 'Period 2' }]
            };
          } else if (nameLower.includes('bilal')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Tuesday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('tariq')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Wednesday', period: 'Period 1' }]
            };
          } else if (nameLower.includes('rubaca')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [{ day: 'Thursday', period: 'Period 2' }]
            };
          } else {
            localMap[s.id] = {
              is_available: true,
              schedule: []
            };
          }
        }
      });

      // Try to load additional data from DB timetable where subject = 'Timetable Availability'
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('timetable')
          .select('staff_id, day_of_week, period')
          .eq('subject', 'Timetable Availability');

        if (dbData && dbData.length > 0 && !dbError) {
          dbData.forEach((row) => {
            if (!localMap[row.staff_id]) {
              localMap[row.staff_id] = { is_available: true, schedule: [] };
            }
            const exists = localMap[row.staff_id].schedule.some(
              (slot) => slot.day === row.day_of_week && slot.period === row.period
            );
            if (!exists) {
              localMap[row.staff_id].schedule.push({
                day: row.day_of_week,
                period: row.period
              });
            }
          });
        }
      } catch (dbErr) {
        console.warn('Could not load availability from remote database, using local storage.');
      }

      setAvailabilityMap(localMap);
      localStorage.setItem('rwu_timetable_availability', JSON.stringify(localMap));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load timetable availability data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    const currentAvail = availabilityMap[teacher.id] || { is_available: true, schedule: [] };
    setEditIsAvailable(currentAvail.is_available);
    setEditSchedule([...currentAvail.schedule]);
    setIsEditOpen(true);
  };

  const handleAddSlot = () => {
    const exists = editSchedule.some(s => s.day === newDay && s.period === newPeriod);
    if (exists) {
      toast.warning('This schedule slot already exists.');
      return;
    }
    setEditSchedule([...editSchedule, { day: newDay, period: newPeriod }]);
    toast.success('Availability slot added.');
  };

  const handleDeleteSlot = (index: number) => {
    const updated = editSchedule.filter((_, i) => i !== index);
    setEditSchedule(updated);
  };

  const handleSaveAvailability = async () => {
    if (!selectedTeacher) return;

    const updatedAvailability: TeacherTimetableAvailability = {
      is_available: editIsAvailable,
      schedule: editSchedule
    };

    // Update local state
    const newMap = {
      ...availabilityMap,
      [selectedTeacher.id]: updatedAvailability
    };
    setAvailabilityMap(newMap);
    localStorage.setItem('rwu_timetable_availability', JSON.stringify(newMap));

    // Try to sync with Supabase timetable table
    try {
      await supabase
        .from('timetable')
        .delete()
        .eq('staff_id', selectedTeacher.id)
        .eq('subject', 'Timetable Availability');

      if (editIsAvailable && editSchedule.length > 0) {
        const rowsToInsert = editSchedule.map(slot => ({
          staff_id: selectedTeacher.id,
          day_of_week: slot.day,
          period: slot.period,
          subject: 'Timetable Availability',
          class_name: 'Timetable Availability',
          room: 'N/A'
        }));

        const { error } = await supabase.from('timetable').insert(rowsToInsert);
        if (error) throw error;
      }
    } catch (err) {
      console.warn('DB sync failed for availability slots.');
    }

    // Now update/synchronize the actual timetable matrix classes!
    // "ensure ho k time table mein bhi wo update honi chiey"
    try {
      // 1. Fetch current timetable entries from Supabase / localStorage
      let timetableList: any[] = [];
      const savedTimetable = localStorage.getItem('rwu_timetable_data');
      if (savedTimetable) {
        timetableList = JSON.parse(savedTimetable);
      } else {
        const { data } = await supabase.from('timetable').select(`*, staff (name)`);
        timetableList = data || [];
      }

      // Filter out general availability rows when managing actual classes
      let actualClasses = timetableList.filter(item => 
        item.subject !== 'Duty Availability' && item.subject !== 'Timetable Availability'
      );

      if (!editIsAvailable) {
        // Teacher is now marked unavailable -> Remove all their classes from the timetable
        actualClasses = actualClasses.filter(item => item.staff_id !== selectedTeacher.id);
        toast.info(`Removed classes for ${selectedTeacher.name} from the timetable.`);
      } else {
        // Teacher is available -> Check if their current classes align with the new available slots
        actualClasses = actualClasses.map(item => {
          if (item.staff_id === selectedTeacher.id) {
            // Check if the current class slot is still available
            const isSlotAvailable = editSchedule.some(slot => 
              slot.day === item.day_of_week && slot.period === item.period
            );

            if (!isSlotAvailable) {
              // Not available in this slot -> move to first available slot that doesn't conflict
              const freeSlot = editSchedule.find(slot => {
                // Find a slot that doesn't conflict with another class of the teacher or the same class or same room
                const hasConflict = actualClasses.some(c => 
                  c.day_of_week === slot.day && 
                  c.period === slot.period && 
                  (c.staff_id === selectedTeacher.id || c.room === item.room || c.class_name === item.class_name)
                );
                return !hasConflict;
              });

              if (freeSlot) {
                toast.success(`Moved class '${item.subject}' to ${freeSlot.day} ${freeSlot.period}`);
                return {
                  ...item,
                  day_of_week: freeSlot.day,
                  period: freeSlot.period
                };
              } else if (editSchedule.length > 0) {
                // Fallback to first slot if conflicts exist
                return {
                  ...item,
                  day_of_week: editSchedule[0].day,
                  period: editSchedule[0].period
                };
              }
            }
          }
          return item;
        });
      }

      // 2. Save classes back to localStorage
      localStorage.setItem('rwu_timetable_data', JSON.stringify(actualClasses));

      // 3. Try to sync timetable classes to Supabase
      try {
        // Delete existing non-availability entries for this teacher to prevent duplicates
        await supabase
          .from('timetable')
          .delete()
          .eq('staff_id', selectedTeacher.id)
          .not('subject', 'in', '("Duty Availability","Timetable Availability")');

        if (editIsAvailable) {
          const teacherClasses = actualClasses.filter(c => c.staff_id === selectedTeacher.id);
          if (teacherClasses.length > 0) {
            const rowsToInsert = teacherClasses.map(c => ({
              staff_id: c.staff_id,
              day_of_week: c.day_of_week,
              period: c.period,
              subject: c.subject,
              class_name: c.class_name,
              room: c.room
            }));
            await supabase.from('timetable').insert(rowsToInsert);
          }
        }
      } catch (dbErr) {
        console.warn('Offline: Could not sync modified classes to DB, saved in localStorage.');
      }

    } catch (syncErr) {
      console.error('Error synchronizing timetable classes:', syncErr);
    }

    toast.success(`Availability updated for ${selectedTeacher.name}`);
    setIsEditOpen(false);
    setSelectedTeacher(null);
  };

  // Filtered staff list based on search
  const filteredStaff = staff.filter(s => {
    return s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.department?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate Stats
  const totalFacultyCount = staff.length;
  const availableCount = staff.filter(s => availabilityMap[s.id]?.is_available !== false).length;
  const unavailableCount = totalFacultyCount - availableCount;

  // Group staff by day for "Summary By Day" tab
  const getStaffForDay = (day: string) => {
    const list: any[] = [];
    staff.forEach(s => {
      const avail = availabilityMap[s.id];
      if (avail && avail.is_available) {
        const daySlots = avail.schedule.filter(slot => slot.day === day);
        if (daySlots.length > 0) {
          list.push({
            teacher: s,
            slots: daySlots
          });
        }
      }
    });
    return list;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Loading timetable availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Availability for Timetable</h2>
          <p className="text-muted-foreground">Manage and view teacher availability specifically for generating class timetables</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Card */}
        <div 
          className="rounded-2xl border p-6 backdrop-blur-xl flex items-center justify-between transition-all duration-300 border-emerald-500/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
          style={{ background: 'var(--glass-bg)' }}
        >
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Available Staff</p>
            <p className="text-4xl font-bold text-emerald-400">{availableCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Unavailable Card */}
        <div 
          className="rounded-2xl border p-6 backdrop-blur-xl flex items-center justify-between transition-all duration-300 border-rose-500/10 shadow-[0_4px_20px_rgba(244,63,94,0.05)]"
          style={{ background: 'var(--glass-bg)' }}
        >
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Unavailable Staff</p>
            <p className="text-4xl font-bold text-rose-400">{unavailableCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <X className="w-6 h-6 text-rose-400" />
          </div>
        </div>

        {/* Total Faculty Card */}
        <div 
          className="rounded-2xl border p-6 backdrop-blur-xl flex items-center justify-between transition-all duration-300 border-blue-500/10 shadow-[0_4px_20px_rgba(59,130,246,0.05)]"
          style={{ background: 'var(--glass-bg)' }}
        >
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Total Faculty</p>
            <p className="text-4xl font-bold text-blue-400">{totalFacultyCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('teacher')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'teacher' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          By Teacher
          {activeTab === 'teacher' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('day')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'day' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Summary By Day
          {activeTab === 'day' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'teacher' ? (
        <div className="space-y-4">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No teachers found matching your search.</p>
            </div>
          ) : (
            filteredStaff.map((teacher) => {
              const avail = availabilityMap[teacher.id] || { is_available: true, schedule: [] };
              const initials = teacher.name ? teacher.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : '??';
              
              // Get subjects taught by teacher to display
              const assignedSubjects = Array.from(new Set(
                COURSE_ASSIGNMENTS.filter(a => a.teacher_name.toLowerCase().includes(teacher.name.toLowerCase()))
                  .map(a => a.subject)
              )).join(', ');

              return (
                <div
                  key={teacher.id}
                  className="rounded-2xl border p-6 backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-primary/30 flex flex-col md:flex-row justify-between gap-6"
                  style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-primary/20">
                      {initials}
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h4 className="font-semibold text-foreground text-base truncate">{teacher.name}</h4>
                        <p className="text-xs text-muted-foreground">{teacher.department || 'Academic'} · {teacher.role}</p>
                        {assignedSubjects && (
                          <p className="text-xs text-primary mt-1 font-medium">Teaches: {assignedSubjects}</p>
                        )}
                      </div>
                      
                      {/* Schedule display */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule Availability</p>
                        <div className="flex flex-wrap gap-2">
                          {avail.schedule.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">No availability slots scheduled</span>
                          ) : (
                            avail.schedule.map((slot, index) => {
                              const periodObj = timeSlots.find(t => t.id === slot.period);
                              return (
                                <div 
                                  key={index} 
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground font-medium"
                                >
                                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span>{slot.day} | {periodObj ? periodObj.label : slot.period}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 md:self-stretch shrink-0">
                    {avail.is_available ? (
                      <span className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                        Unavailable
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-foreground hover:text-white rounded-xl text-sm font-medium transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      Edit Availability
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        // Summary By Day Tab
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {days.map((day) => {
            const dayStaff = getStaffForDay(day);
            return (
              <div 
                key={day} 
                className="rounded-2xl border p-5 backdrop-blur-xl flex flex-col gap-4 min-h-[250px]"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
              >
                <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                  <h4 className="font-semibold text-foreground">{day}</h4>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">
                    {dayStaff.length} Available
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[350px]">
                  {dayStaff.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-10">No faculty scheduled</p>
                  ) : (
                    dayStaff.map(({ teacher, slots }) => (
                      <div key={teacher.id} className="p-3 bg-white/3 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
                            {teacher.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[60px]">
                            {teacher.department?.split(' ')[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {slots.map((slot: any, idx: number) => {
                            const pObj = timeSlots.find(t => t.id === slot.period);
                            return (
                              <div key={idx} className="flex items-center gap-1.5 text-[9px] text-muted-foreground bg-black/20 p-1 rounded">
                                <Clock className="w-2.5 h-2.5 text-primary shrink-0" />
                                <span>{pObj ? pObj.label.replace(' AM','').replace(' PM','') : slot.period}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Availability Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="sm:max-w-[480px] bg-[#0f1521] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Timetable Availability</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Configure teaching schedule availability for <span className="font-semibold text-primary">{selectedTeacher?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Global Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="global_avail" className="text-sm font-semibold text-white">Teaching Availability Status</Label>
                <p className="text-xs text-muted-foreground">Toggle to set if the teacher can teach classes this semester.</p>
              </div>
              <input
                id="global_avail"
                type="checkbox"
                checked={editIsAvailable}
                onChange={(e) => setEditIsAvailable(e.target.checked)}
                className="w-10 h-5 bg-white/10 rounded-full checked:bg-primary appearance-none cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:left-5 before:transition-all"
              />
            </div>

            {editIsAvailable && (
              <>
                {/* Add Availability Slot Form */}
                <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/5">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Add Teaching Slot</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slot_day" className="text-[10px] text-muted-foreground font-bold uppercase">Day</Label>
                      <select
                        id="slot_day"
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                      >
                        {days.map(d => <option key={d} value={d} className="bg-[#0f1521]">{d}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slot_period" className="text-[10px] text-muted-foreground font-bold uppercase">Period / Slot</Label>
                      <select
                        id="slot_period"
                        value={newPeriod}
                        onChange={(e) => setNewPeriod(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                      >
                        {timeSlots.map(t => <option key={t.id} value={t.id} className="bg-[#0f1521]">{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddSlot}
                    className="w-full bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 text-xs py-1.5 mt-2 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Schedule Slot
                  </Button>
                </div>

                {/* Active Slots list */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white uppercase tracking-wider">Active Teaching Availability Schedule</Label>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {editSchedule.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-6">No scheduled teaching slots</p>
                    ) : (
                      editSchedule.map((slot, index) => {
                        const pObj = timeSlots.find(t => t.id === slot.period);
                        return (
                          <div key={index} className="flex justify-between items-center p-2.5 bg-white/3 border border-white/5 rounded-lg text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{slot.day} | {pObj ? pObj.label : slot.period}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(index)}
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-6 border-t border-white/5 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditOpen(false);
                setSelectedTeacher(null);
              }}
              className="border-white/10 hover:bg-white/5 text-foreground hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveAvailability}
              className="bg-primary hover:bg-primary/95 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
