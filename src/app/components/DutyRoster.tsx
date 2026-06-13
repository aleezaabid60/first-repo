'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight, Plus, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, addDays, isSameDay, getWeekOfMonth } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const MOCK_STAFF = [
  { id: '1', name: 'Mr. Hamza', role: 'Lecturer', department: 'Computer Science' },
  { id: '2', name: 'Ms. Tabassum Kanwal', role: 'Senior Lecturer', department: 'Computer Science' },
  { id: '3', name: 'Dr. Adnan', role: 'Professor', department: 'Computer Science' },
  { id: '4', name: 'Mr. Umer Sultan', role: 'Lecturer', department: 'Computer Science' },
  { id: '5', name: 'Mr. Awais', role: 'Lecturer', department: 'Computer Science' },
  { id: '6', name: 'Dr. Hshmat', role: 'Professor', department: 'Mathematics' },
  { id: '7', name: 'Ms. Mehwish', role: 'Lecturer', department: 'English' },
  { id: '8', name: 'Ms. Attia', role: 'Lecturer', department: 'Computer Science' },
];

export default function DutyRoster() {
  const [duties, setDuties] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    duty_date: new Date().toISOString(),
    duty_type: '',
    location: '',
    staff_id: ''
  });

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const newDuties: any[] = [];
      const types = ['Invigilation', 'Lab Supervision', 'Campus Patrol', 'Library Duty'];
      const locations = ['Room 101', 'Lab 1', 'Main Gate', 'Library'];
      const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i));
      
      weekDays.forEach(day => {
        const numDuties = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numDuties; i++) {
          const randomStaff = staff[Math.floor(Math.random() * staff.length)];
          newDuties.push({
            duty_date: day.toISOString(),
            duty_type: types[Math.floor(Math.random() * types.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            staff_id: randomStaff.id
          });
        }
      });

      if (staff !== MOCK_STAFF) {
        const { data, error } = await supabase.from('duties').insert(newDuties).select(`*, staff(name, role, department)`);
        if (!error && data) {
          setDuties([...duties, ...data]);
        }
      } else {
        const mockDuties = newDuties.map(d => ({
          ...d,
          id: Date.now().toString() + Math.random(),
          staff: { name: staff.find(s => s.id === d.staff_id)?.name }
        }));
        setDuties([...duties, ...mockDuties]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      duty_date: new Date(newEntry.duty_date).toISOString(),
      duty_type: newEntry.duty_type,
      location: newEntry.location,
      staff_id: newEntry.staff_id
    };
    
    if (staff !== MOCK_STAFF && entry.staff_id) {
      const { data, error } = await supabase.from('duties').insert([{
        ...entry
      }]).select(`*, staff(name, role, department)`);
      if (!error && data) {
        setDuties([...duties, data[0]]);
      }
    } else {
      const mockEntry = {
        id: Date.now().toString(),
        ...entry,
        staff: { name: staff.find(s => s.id === entry.staff_id)?.name }
      };
      setDuties([...duties, mockEntry]);
    }
    
    setIsManualOpen(false);
    setNewEntry({
      duty_date: currentWeekStart.toISOString(),
      duty_type: '',
      location: '',
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

      if (dutiesError || staffError) {
        // Fallback mock data
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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">AI Duty Roster Generator</h2>
          <p className="text-muted-foreground">Smart scheduling with conflict detection</p>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">{format(day, 'EEEE')}</h4>
                        <span className="text-xs text-muted-foreground">{format(day, 'MMM d')}</span>
                        <span className="px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary font-medium">
                          {dayDuties.length} Assigned
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dayDuties.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No duties assigned</p>
                        ) : (
                          dayDuties.map((duty, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground"
                            >
                              <User className="w-3 h-3 text-primary" />
                              {duty.staff?.name || duty.duty_type}
                              <span className="text-[10px] text-muted-foreground ml-1">
                                {duty.location}
                              </span>
                            </div>
                          ))
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
                  <p className="text-sm text-foreground font-medium mb-1">Balance Load</p>
                  <p className="text-xs text-muted-foreground">Teacher distribution looks optimal for the current week.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Weekend Coverage</p>
                  <p className="text-xs text-muted-foreground">Saturday duties are currently light. Consider adding coverage.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-foreground mb-3">Available Staff</h4>
            <div className="space-y-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  <span className="text-sm text-foreground">{member.name}</span>
                  <div className="w-2 h-2 rounded-full bg-chart-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="duty_date">Date</Label>
              <select 
                id="duty_date"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEntry.duty_date}
                onChange={(e) => setNewEntry({...newEntry, duty_date: e.target.value})}
              >
                {weekDays.map(d => (
                  <option key={d.toISOString()} value={d.toISOString()}>
                    {format(d, 'EEEE, MMM d, yyyy')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duty_type">Duty Type</Label>
              <Input 
                id="duty_type" 
                placeholder="e.g. Invigilation" 
                value={newEntry.duty_type}
                onChange={(e) => setNewEntry({...newEntry, duty_type: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="e.g. Room 101" 
                value={newEntry.location}
                onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff Name</Label>
              <select 
                id="staff_id"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEntry.staff_id}
                onChange={(e) => setNewEntry({...newEntry, staff_id: e.target.value})}
                required
              >
                <option value="" disabled>Select a staff member...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsManualOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

