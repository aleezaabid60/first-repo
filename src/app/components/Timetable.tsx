'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, User, Sparkles, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const timeSlots = [
  { id: 'Period 1', label: '08:00 - 09:30 AM' },
  { id: 'Period 2', label: '09:30 - 11:00 AM' },
  { id: 'Period 3', label: '11:00 - 12:30 PM' },
  { id: 'Period 4', label: '01:00 - 02:30 PM' },
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

export default function Timetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ occupied: 0, available: 0, rate: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    day_of_week: 'Monday',
    period: 'Period 1',
    subject: '',
    class_name: '',
    room: '',
    staff_name: ''
  });

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Simulate AI generating a new schedule
      const shuffled = [...MOCK_TIMETABLE].sort(() => 0.5 - Math.random()).slice(0, 15);
      setTimetable(shuffled);
      const totalSlots = timeSlots.length * days.length;
      setStats({ occupied: shuffled.length, available: totalSlots - shuffled.length, rate: Math.round((shuffled.length / totalSlots) * 100) });
      setIsGenerating(false);
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      id: Date.now().toString(),
      day_of_week: newEntry.day_of_week,
      period: newEntry.period,
      subject: newEntry.subject,
      class_name: newEntry.class_name,
      room: newEntry.room,
      staff: { name: newEntry.staff_name }
    };
    
    const updatedTimetable = [...timetable, entry];
    setTimetable(updatedTimetable);
    const totalSlots = timeSlots.length * days.length;
    setStats({ occupied: updatedTimetable.length, available: totalSlots - updatedTimetable.length, rate: Math.round((updatedTimetable.length / totalSlots) * 100) });
    setIsManualOpen(false);
    setNewEntry({ day_of_week: 'Monday', period: 'Period 1', subject: '', class_name: '', room: '', staff_name: '' });
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          *,
          staff (name)
        `);

      if (error || !data || data.length === 0) {
        // Use mock timetable if DB has no data or error
        setTimetable(MOCK_TIMETABLE);
        const totalSlots = timeSlots.length * days.length;
        setStats({ occupied: MOCK_TIMETABLE.length, available: totalSlots - MOCK_TIMETABLE.length, rate: Math.round((MOCK_TIMETABLE.length / totalSlots) * 100) });
      } else {
        setTimetable(data);
        const totalSlots = timeSlots.length * days.length;
        const occupied = data.length;
        setStats({ occupied, available: totalSlots - occupied, rate: Math.round((occupied / totalSlots) * 100) });
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetable(MOCK_TIMETABLE);
      const totalSlots = timeSlots.length * days.length;
      setStats({ occupied: MOCK_TIMETABLE.length, available: totalSlots - MOCK_TIMETABLE.length, rate: Math.round((MOCK_TIMETABLE.length / totalSlots) * 100) });
    } finally {
      setLoading(false);
    }
  };

  const getClassForSlot = (day: string, period: string) => {
    return timetable.find((item) => item.day_of_week === day && item.period === period);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Timetable Matrix</h2>
          <p className="text-muted-foreground">Weekly class schedule with room availability</p>
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
                    const classData = getClassForSlot(day, slot.id);
                    const color = classData ? getColor(classData.subject) : '';
                    return (
                      <td key={`${day}-${slot.id}`} className="p-3 min-w-[140px]">
                        {classData ? (
                          <div
                            className="p-3 rounded-xl border transition-all hover:scale-105 cursor-pointer relative overflow-hidden group"
                            style={{
                              backgroundColor: `${color}15`,
                              borderColor: `${color}40`,
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background: `radial-gradient(circle at center, ${color}30, transparent)`,
                              }}
                            />
                            <div className="relative z-10">
                              <h4 className="font-semibold text-foreground text-xs mb-1 leading-tight">{classData.subject}</h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate text-[10px]">{classData.staff?.name || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="text-[10px]">Room {classData.room}</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-1">
                                <div
                                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-[10px] font-medium" style={{ color }}>
                                  Occupied
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/3 hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer">
                            <p className="text-xs text-muted-foreground text-center">Available</p>
                          </div>
                        )}
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

      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <select 
                  id="day"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEntry.day_of_week}
                  onChange={(e) => setNewEntry({...newEntry, day_of_week: e.target.value})}
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <select 
                  id="period"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEntry.period}
                  onChange={(e) => setNewEntry({...newEntry, period: e.target.value})}
                >
                  {timeSlots.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="e.g. Data Structures" 
                value={newEntry.subject}
                onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
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
                  onChange={(e) => setNewEntry({...newEntry, class_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input 
                  id="room" 
                  placeholder="e.g. 101" 
                  value={newEntry.room}
                  onChange={(e) => setNewEntry({...newEntry, room: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Name</Label>
              <Input 
                id="staff" 
                placeholder="e.g. Dr. Ahmed" 
                value={newEntry.staff_name}
                onChange={(e) => setNewEntry({...newEntry, staff_name: e.target.value})}
                required
              />
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

