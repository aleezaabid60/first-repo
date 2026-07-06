'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight, Plus, Loader2, User, Clock, BookOpen, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, addDays, isSameDay, getWeekOfMonth } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import StaffDetailModal from './StaffDetailModal';

const MOCK_STAFF = [
  { id: '1', name: 'Mr Hamza', role: 'Teacher', department: 'Information Technology' },
  { id: '2', name: 'Ms Tabassum Kanwal', role: 'Teacher', department: 'Information Technology' },
  { id: '3', name: 'Mr Umer sultan', role: 'Teacher', department: 'Information Technology' },
  { id: '4', name: 'Dr Hshmat', role: 'Teacher', department: 'Mathematics' },
  { id: '5', name: 'Dr Qurat ul Ain', role: 'Teacher', department: 'Islamic Studies' },
];

// Helper to parse subject and time from duty_type
const parseDutyType = (type: string) => {
  const match = type?.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      subject: match[1].trim(),
      time: match[2].trim()
    };
  }
  return {
    subject: type || 'Invigilation',
    time: '09:00 - 11:00'
  };
};

export default function DutyRoster() {
  const [duties, setDuties] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>(MOCK_STAFF);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    duty_date: new Date().toISOString(),
    subject: '',
    time: '09:00 - 11:00',
    room: '',
    staff_id: ''
  });
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const newDuties: any[] = [];
      const subjects = ['Artificial Intelligence', 'Object Oriented Programming', 'Database Administration', 'Cybersecurity', 'Discrete Structures', 'Professional Practices'];
      const locations = ['Room 101', 'Room 102', 'Room 204', 'Lab 1', 'Lab 2'];
      const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i));
      
      // Load latest availability
      const savedAvailability = localStorage.getItem('rwu_duty_availability');
      const activeAvail = savedAvailability ? JSON.parse(savedAvailability) : availabilityMap;

      let dutyCount = 0;

      weekDays.forEach(day => {
        const dayName = format(day, 'EEEE');
        
        // Find staff members available on this day
        const availableStaff = staff.filter(s => {
          const avail = activeAvail[s.id];
          return avail && avail.is_available !== false && avail.schedule.some((slot: any) => slot.day === dayName);
        });

        if (availableStaff.length > 0) {
          // Assign duties to available staff for their specific slots
          availableStaff.forEach(s => {
            const avail = activeAvail[s.id];
            const slotsForDay = avail.schedule.filter((slot: any) => slot.day === dayName);
            
            slotsForDay.forEach((slot: any) => {
              const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
              const randomRoom = locations[Math.floor(Math.random() * locations.length)];
              
              newDuties.push({
                duty_date: day.toISOString(),
                duty_type: `${randomSubject} (${slot.time})`,
                location: randomRoom,
                staff_id: s.id,
                status: 'pending'
              });
              dutyCount++;
            });
          });
        }
      });

      if (dutyCount === 0) {
        toast.error('No staff members have scheduled availability this week. Please set availability first.');
        setIsGenerating(false);
        return;
      }

      if (staff !== MOCK_STAFF) {
        // Clear old duties for this week first to update/overwrite as requested: "duty rooster mein jab ham generate with AI kary tuh update hona chiey"
        const startStr = format(weekDays[0], 'yyyy-MM-dd');
        const endStr = format(weekDays[weekDays.length - 1], 'yyyy-MM-dd');
        await supabase.from('duties').delete().gte('duty_date', startStr).lte('duty_date', endStr);

        const { data, error } = await supabase.from('duties').insert(newDuties).select(`*, staff(name, role, department)`);
        if (!error && data) {
          // Refresh duties list
          fetchData();
          toast.success(`Successfully generated ${dutyCount} duties based on teacher availability!`);
        } else {
          throw error || new Error('Failed to insert generated duties');
        }
      } else {
        // Fallback mock generation
        const mockDuties = newDuties.map(d => ({
          ...d,
          id: Date.now().toString() + Math.random(),
          staff: { name: staff.find(s => s.id === d.staff_id)?.name }
        }));
        setDuties(mockDuties);
        toast.success(`Generated ${dutyCount} duties locally (mock mode).`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate duty roster.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.staff_id || !newEntry.subject || !newEntry.room) {
      toast.error('Please fill in all fields.');
      return;
    }

    const dayName = format(new Date(newEntry.duty_date), 'EEEE');
    
    // Load latest availability
    const savedAvailability = localStorage.getItem('rwu_duty_availability');
    const activeAvail = savedAvailability ? JSON.parse(savedAvailability) : availabilityMap;
    const teacherAvail = activeAvail[newEntry.staff_id];
    
    // Validate availability
    const isAvailable = teacherAvail && teacherAvail.is_available !== false && 
                        teacherAvail.schedule.some((slot: any) => slot.day === dayName);

    if (!isAvailable) {
      toast.error(`Error: This teacher is not scheduled as available on ${dayName}.`);
      return;
    }

    const entry = {
      duty_date: new Date(newEntry.duty_date).toISOString(),
      duty_type: `${newEntry.subject} (${newEntry.time})`,
      location: newEntry.room,
      staff_id: newEntry.staff_id,
      status: 'pending'
    };
    
    if (staff !== MOCK_STAFF) {
      const { data, error } = await supabase.from('duties').insert([entry]).select(`*, staff(name, role, department)`);
      if (!error && data) {
        setDuties([...duties, data[0]]);
        toast.success('Duty assigned successfully!');
      } else {
        toast.error('Failed to save duty to database.');
      }
    } else {
      const mockEntry = {
        id: Date.now().toString(),
        ...entry,
        staff: { name: staff.find(s => s.id === entry.staff_id)?.name }
      };
      setDuties([...duties, mockEntry]);
      toast.success('Duty assigned locally.');
    }
    
    setIsManualOpen(false);
    setNewEntry({
      duty_date: currentWeekStart.toISOString(),
      subject: '',
      time: '09:00 - 11:00',
      room: '',
      staff_id: ''
    });
  };

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: dutiesData, error: dutiesError } = await supabase
        .from('duties')
        .select(`
          *,
          staff (name, role, department)
        `);

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*');

      // Load availability from local storage
      const savedAvailability = localStorage.getItem('rwu_duty_availability');
      if (savedAvailability) {
        setAvailabilityMap(JSON.parse(savedAvailability));
      }

      if (dutiesError || staffError) {
        setStaff(MOCK_STAFF);
        setDuties([]);
      } else {
        setDuties(dutiesData || []);
        setStaff(staffData || MOCK_STAFF);
      }
    } catch (error) {
      console.error('Error fetching duty roster:', error);
      setStaff(MOCK_STAFF);
      setDuties([]);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i));
  const getDutiesForDay = (day: Date) => {
    return duties.filter(d => isSameDay(new Date(d.duty_date), day));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">AI Duty Roster Generator</h2>
          <p className="text-muted-foreground">Smart scheduling with availability-based conflict detection</p>
        </div>
        <button 
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  Week {getWeekOfMonth(currentWeekStart)} - {format(currentWeekStart, 'MMMM yyyy')}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={currentWeekStart}
                onSelect={(date) => date && setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }))}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={2020}
                toYear={2030}
              />
            </PopoverContent>
          </Popover>
          <button 
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <button 
          onClick={() => setIsManualOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Manual Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-6 backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="space-y-4">
            {weekDays.map((day, idx) => {
              const dayDuties = getDutiesForDay(day);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border transition-all hover:border-primary/50 cursor-pointer bg-white/3 border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-foreground">{format(day, 'EEEE')}</h4>
                        <span className="text-xs text-muted-foreground">{format(day, 'MMM d')}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-lg bg-primary/20 text-primary font-bold">
                          {dayDuties.length} Assigned
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dayDuties.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic col-span-2">No duties assigned</p>
                        ) : (
                          dayDuties.map((duty, i) => {
                            const { subject, time } = parseDutyType(duty.duty_type);
                            return (
                              <div
                                key={i}
                                className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all text-sm text-foreground"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 font-semibold text-foreground truncate min-w-0">
                                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="truncate">{duty.staff?.name || 'Unknown Teacher'}</span>
                                  </div>
                                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {time}
                                  </span>
                                </div>
                                <div className="space-y-1 pt-1 border-t border-white/5">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                    <BookOpen className="w-3 h-3 text-secondary shrink-0" />
                                    <span className="truncate">{subject}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                    <MapPin className="w-3 h-3 text-secondary shrink-0" />
                                    <span className="truncate">{duty.location}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border p-6 backdrop-blur-xl space-y-4" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div>
            <h3 className="font-semibold text-foreground mb-1">AI Suggestions</h3>
            <p className="text-sm text-muted-foreground">Optimized shift recommendations</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Availability Check</p>
                  <p className="text-xs text-muted-foreground">Duties are strictly assigned to scheduled available slots.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Auto-Load Balancer</p>
                  <p className="text-xs text-muted-foreground">Generated duties ensure a fair distribution across available staff.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-foreground mb-3">Available Faculty Today</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {staff.map((member) => {
                const todayName = format(new Date(), 'EEEE');
                const isAvailToday = availabilityMap[member.id]?.is_available !== false && 
                                     availabilityMap[member.id]?.schedule?.some((s: any) => s.day === todayName);
                
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedStaff(member);
                      setIsDetailOpen(true);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-sm text-foreground">{member.name}</span>
                    <div className={`w-2.5 h-2.5 rounded-full ${isAvailToday ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f1521] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Manual Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="duty_date">Date</Label>
              <select 
                id="duty_date"
                className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={newEntry.duty_date}
                onChange={(e) => setNewEntry({...newEntry, duty_date: e.target.value})}
              >
                {weekDays.map(d => (
                  <option key={d.toISOString()} value={d.toISOString()} className="bg-[#0f1521]">
                    {format(d, 'EEEE, MMM d, yyyy')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff Name</Label>
              <select 
                id="staff_id"
                className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={newEntry.staff_id}
                onChange={(e) => setNewEntry({...newEntry, staff_id: e.target.value})}
                required
              >
                <option value="" disabled className="bg-[#0f1521]">Select a staff member...</option>
                {staff.map(s => {
                  const dayName = format(new Date(newEntry.duty_date), 'EEEE');
                  const isAvail = availabilityMap[s.id]?.is_available !== false && 
                                  availabilityMap[s.id]?.schedule?.some((slot: any) => slot.day === dayName);
                  return (
                    <option key={s.id} value={s.id} className="bg-[#0f1521]">
                      {s.name} {!isAvail ? '(Not Scheduled Available)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="e.g. Artificial Intelligence" 
                value={newEntry.subject}
                onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                className="bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="time">Time Slot</Label>
                <select
                  id="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="08:00 - 09:30" className="bg-[#0f1521]">08:00 - 09:30</option>
                  <option value="09:30 - 11:00" className="bg-[#0f1521]">09:30 - 11:00</option>
                  <option value="11:00 - 12:30" className="bg-[#0f1521]">11:00 - 12:30</option>
                  <option value="13:00 - 15:00" className="bg-[#0f1521]">13:00 - 15:00</option>
                  <option value="14:00 - 16:00" className="bg-[#0f1521]">14:00 - 16:00</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input 
                  id="room" 
                  placeholder="e.g. Room 204" 
                  value={newEntry.room}
                  onChange={(e) => setNewEntry({...newEntry, room: e.target.value})}
                  className="bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsManualOpen(false)} className="border-white/10 hover:bg-white/5 text-foreground hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Save Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <StaffDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedStaff(null);
        }}
        staffMember={selectedStaff}
      />
    </div>
  );
}


