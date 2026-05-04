'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const timeSlots = ['08:00:00', '09:30:00', '11:00:00', '12:30:00', '14:00:00', '15:30:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper to format time for display
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

export default function Timetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ occupied: 0, available: 0, rate: 0 });

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
          subjects (name),
          rooms (name)
        `);

      if (error) throw error;
      setTimetable(data || []);

      // Calculate stats (simplified)
      const totalSlots = timeSlots.length * days.length;
      const occupied = data?.length || 0;
      const available = totalSlots - occupied;
      const rate = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;
      
      setStats({ occupied, available, rate });
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassForSlot = (day: string, time: string) => {
    return timetable.find((item) => item.day_of_week === day && item.start_time === time);
  };

  const getSlotColor = (subjectName: string) => {
    const colors: Record<string, string> = {
      'Computer Science': '#4F9EFF',
      'Mathematics': '#B8A3E8',
      'Physics': '#34D399',
      'English': '#FBBF24',
      'Chemistry': '#F87171',
      'Biology': '#4F9EFF',
    };
    return colors[subjectName] || '#6366f1';
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
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">Timetable Matrix</h2>
        <p className="text-muted-foreground">Weekly class schedule with room availability</p>
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
              {timeSlots.map((time) => (
                <tr key={time} className="border-b border-white/5">
                  <td className="p-4 font-medium text-muted-foreground bg-white/3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(time)}
                    </div>
                  </td>
                  {days.map((day) => {
                    const classData = getClassForSlot(day, time);
                    const color = classData ? getSlotColor(classData.subjects.name) : '';
                    return (
                      <td key={`${day}-${time}`} className="p-3">
                        {classData ? (
                          <div
                            className="p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer relative overflow-hidden group"
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
                              <h4 className="font-semibold text-foreground text-sm mb-2">{classData.subjects.name}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{classData.rooms.name}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full animate-pulse"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-medium" style={{ color: color }}>
                                  Occupied
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/3 hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer">
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
    </div>
  );
}

