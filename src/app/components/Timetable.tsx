'use client';

import { Clock, MapPin } from 'lucide-react';

const timeSlots = ['8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timetableData = [
  { day: 'Monday', time: '8:00 AM', subject: 'Computer Science', room: 'Lab 101', status: 'occupied', color: '#4F9EFF' },
  { day: 'Monday', time: '11:00 AM', subject: 'Mathematics', room: 'Room 203', status: 'occupied', color: '#B8A3E8' },
  { day: 'Tuesday', time: '9:30 AM', subject: 'Physics', room: 'Lab 202', status: 'occupied', color: '#34D399' },
  { day: 'Tuesday', time: '2:00 PM', subject: 'English', room: 'Room 105', status: 'occupied', color: '#FBBF24' },
  { day: 'Wednesday', time: '8:00 AM', subject: 'Chemistry', room: 'Lab 303', status: 'occupied', color: '#F87171' },
  { day: 'Wednesday', time: '12:30 PM', subject: 'Biology', room: 'Lab 201', status: 'occupied', color: '#4F9EFF' },
  { day: 'Thursday', time: '9:30 AM', subject: 'Statistics', room: 'Room 401', status: 'occupied', color: '#B8A3E8' },
  { day: 'Thursday', time: '3:30 PM', subject: 'Psychology', room: 'Room 302', status: 'occupied', color: '#34D399' },
  { day: 'Friday', time: '8:00 AM', subject: 'Sociology', room: 'Room 201', status: 'occupied', color: '#FBBF24' },
];

export default function Timetable() {
  const getClassForSlot = (day: string, time: string) => {
    return timetableData.find((item) => item.day === day && item.time === time);
  };

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
              {timeSlots.map((time, timeIdx) => (
                <tr key={time} className="border-b border-white/5">
                  <td className="p-4 font-medium text-muted-foreground bg-white/3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  </td>
                  {days.map((day) => {
                    const classData = getClassForSlot(day, time);
                    return (
                      <td key={`${day}-${time}`} className="p-3">
                        {classData ? (
                          <div
                            className="p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer relative overflow-hidden group"
                            style={{
                              backgroundColor: `${classData.color}15`,
                              borderColor: `${classData.color}40`,
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background: `radial-gradient(circle at center, ${classData.color}30, transparent)`,
                                animation: 'pulse 2s ease-in-out infinite',
                              }}
                            />
                            <div className="relative z-10">
                              <h4 className="font-semibold text-foreground text-sm mb-2">{classData.subject}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{classData.room}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full animate-pulse"
                                  style={{ backgroundColor: classData.color }}
                                />
                                <span className="text-xs font-medium" style={{ color: classData.color }}>
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
              <p className="text-sm text-muted-foreground">Occupied Rooms</p>
              <p className="text-xl font-semibold text-foreground">24</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Rooms</p>
              <p className="text-xl font-semibold text-foreground">18</p>
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
              <p className="text-xl font-semibold text-foreground">87%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
