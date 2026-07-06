'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Clock, Plus, Trash2, Edit2, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Mock staff fallback
const MOCK_STAFF = [
  { id: '1', name: 'Mr Hamza', role: 'Teacher', department: 'Information Technology', email: 'hamza@rwu.edu.pk' },
  { id: '2', name: 'Ms Tabassum Kanwal', role: 'Teacher', department: 'Information Technology', email: 'tabassum@rwu.edu.pk' },
  { id: '3', name: 'Mr Umer sultan', role: 'Teacher', department: 'Information Technology', email: 'umer@rwu.edu.pk' },
  { id: '4', name: 'Dr Hshmat', role: 'Teacher', department: 'Mathematics', email: 'hshmat@rwu.edu.pk' },
  { id: '5', name: 'Dr Qurat ul Ain', role: 'Teacher', department: 'Islamic Studies', email: 'quratulain@rwu.edu.pk' },
];

interface AvailabilitySlot {
  day: string;
  time: string;
}

interface TeacherAvailability {
  is_available: boolean;
  schedule: AvailabilitySlot[];
}

export default function DutyRosterAvailability() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'teacher' | 'day'>('teacher');
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, TeacherAvailability>>({});
  
  // Edit modal state
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editSchedule, setEditSchedule] = useState<AvailabilitySlot[]>([]);
  
  // New slot form state
  const [newDay, setNewDay] = useState('Monday');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');

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

      // 2. Load availability from localStorage as primary source / fallback
      const savedAvailability = localStorage.getItem('rwu_duty_availability');
      let localMap: Record<string, TeacherAvailability> = {};
      if (savedAvailability) {
        try {
          localMap = JSON.parse(savedAvailability);
        } catch (e) {
          console.error('Error parsing availability from localStorage', e);
        }
      }

      // Initialize missing teachers in localMap
      currentStaff.forEach((s) => {
        if (!localMap[s.id]) {
          // Provide some default availability slots for demo purposes
          if (s.name.includes('Hamza')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Monday', time: '09:00 - 11:00' },
                { day: 'Wednesday', time: '13:00 - 15:00' }
              ]
            };
          } else if (s.name.includes('Tabassum')) {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Tuesday', time: '11:00 - 13:00' },
                { day: 'Thursday', time: '09:30 - 11:30' }
              ]
            };
          } else if (s.name.includes('Hshmat')) {
            localMap[s.id] = {
              is_available: false,
              schedule: []
            };
          } else {
            localMap[s.id] = {
              is_available: true,
              schedule: [
                { day: 'Monday', time: '10:00 - 12:00' },
                { day: 'Wednesday', time: '14:00 - 16:00' }
              ]
            };
          }
        }
      });

      // Try to fetch from database timetable rows where subject = 'Duty Availability'
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('timetable')
          .select('staff_id, day_of_week, period')
          .eq('subject', 'Duty Availability');

        if (dbData && dbData.length > 0 && !dbError) {
          // Merge database availability into localMap
          dbData.forEach((row) => {
            if (!localMap[row.staff_id]) {
              localMap[row.staff_id] = { is_available: true, schedule: [] };
            }
            // Avoid duplicates
            const exists = localMap[row.staff_id].schedule.some(
              (slot) => slot.day === row.day_of_week && slot.time === row.period
            );
            if (!exists) {
              localMap[row.staff_id].schedule.push({
                day: row.day_of_week,
                time: row.period
              });
            }
          });
        }
      } catch (dbErr) {
        console.warn('Could not load availability from remote database, using local storage.');
      }

      setAvailabilityMap(localMap);
      localStorage.setItem('rwu_duty_availability', JSON.stringify(localMap));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load roster availability data.');
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
    const timeString = `${newStartTime} - ${newEndTime}`;
    // Check if slot already exists
    const exists = editSchedule.some(s => s.day === newDay && s.time === timeString);
    if (exists) {
      toast.warning('This schedule slot already exists.');
      return;
    }
    setEditSchedule([...editSchedule, { day: newDay, time: timeString }]);
    toast.success('Availability slot added.');
  };

  const handleDeleteSlot = (index: number) => {
    const updated = editSchedule.filter((_, i) => i !== index);
    setEditSchedule(updated);
  };

  const handleSaveAvailability = async () => {
    if (!selectedTeacher) return;

    const updatedAvailability: TeacherAvailability = {
      is_available: editIsAvailable,
      schedule: editSchedule
    };

    // Update local state
    const newMap = {
      ...availabilityMap,
      [selectedTeacher.id]: updatedAvailability
    };
    setAvailabilityMap(newMap);
    localStorage.setItem('rwu_duty_availability', JSON.stringify(newMap));

    // Try to sync with Supabase
    try {
      // 1. Delete existing duty availability rows for this teacher from timetable
      await supabase
        .from('timetable')
        .delete()
        .eq('staff_id', selectedTeacher.id)
        .eq('subject', 'Duty Availability');

      // 2. Re-insert updated slots if the teacher is available
      if (editIsAvailable && editSchedule.length > 0) {
        const rowsToInsert = editSchedule.map(slot => ({
          staff_id: selectedTeacher.id,
          day_of_week: slot.day,
          period: slot.time,
          subject: 'Duty Availability',
          class_name: 'Duty Availability',
          room: 'N/A'
        }));

        const { error } = await supabase.from('timetable').insert(rowsToInsert);
        if (error) throw error;
      }
      toast.success(`Availability updated for ${selectedTeacher.name}`);
    } catch (err) {
      console.warn('Updated locally but database sync failed (Offline/Network error).');
      toast.info(`Availability saved locally for ${selectedTeacher.name} (DB offline)`);
    }

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

  // Days of week list
  const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
          <p className="text-muted-foreground text-sm font-medium">Loading roster availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Duty Roster Availability</h2>
          <p className="text-muted-foreground">Manage and view teacher availability specifically for roster generation</p>
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
                      </div>
                      
                      {/* Schedule display */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule</p>
                        <div className="flex flex-wrap gap-2">
                          {avail.schedule.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">No availability slots scheduled</span>
                          ) : (
                            avail.schedule.map((slot, index) => (
                              <div 
                                key={index} 
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground font-medium"
                              >
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{slot.day} | {slot.time}</span>
                              </div>
                            ))
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAYS_LIST.map((day) => {
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
                          <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                            {teacher.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase truncate max-w-[70px]">
                            {teacher.department?.split(' ')[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {slots.map((slot: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-black/20 p-1 rounded">
                              <Clock className="w-3 h-3 text-primary shrink-0" />
                              <span>{slot.time}</span>
                            </div>
                          ))}
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
            <DialogTitle className="text-xl font-bold text-white">Edit Availability</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Configure duty availability for <span className="font-semibold text-primary">{selectedTeacher?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Global Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="global_avail" className="text-sm font-semibold text-white">Roster Availability</Label>
                <p className="text-xs text-muted-foreground">Toggle to set if the teacher can be assigned duties globally.</p>
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
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Add Availability Slot</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slot_day" className="text-[10px] text-muted-foreground font-bold uppercase">Day</Label>
                      <select
                        id="slot_day"
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                      >
                        {DAYS_LIST.map(d => <option key={d} value={d} className="bg-[#0f1521]">{d}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slot_start" className="text-[10px] text-muted-foreground font-bold uppercase">Start Time</Label>
                      <input
                        id="slot_start"
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slot_end" className="text-[10px] text-muted-foreground font-bold uppercase">End Time</Label>
                      <input
                        id="slot_end"
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                      />
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
                  <Label className="text-xs font-bold text-white uppercase tracking-wider">Active Availability Schedule</Label>
                  <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {editSchedule.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-6">No scheduled availability slots</p>
                    ) : (
                      editSchedule.map((slot, index) => (
                        <div key={index} className="flex justify-between items-center p-2.5 bg-white/3 border border-white/5 rounded-lg text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{slot.day} | {slot.time}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(index)}
                            className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
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
