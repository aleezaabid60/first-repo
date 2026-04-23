'use client';

import { Users, Calendar, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const weeklyData = [
  { day: 'Mon', attendance: 85, duties: 12 },
  { day: 'Tue', attendance: 92, duties: 15 },
  { day: 'Wed', attendance: 88, duties: 11 },
  { day: 'Thu', attendance: 95, duties: 14 },
  { day: 'Fri', attendance: 90, duties: 13 },
  { day: 'Sat', attendance: 78, duties: 8 },
];

const heatmapData = [
  { name: 'Dr. Sarah Khan', mon: 2, tue: 1, wed: 2, thu: 1, fri: 2, sat: 0 },
  { name: 'Prof. Ahmed Ali', mon: 1, tue: 2, wed: 1, thu: 2, fri: 1, sat: 1 },
  { name: 'Dr. Fatima Noor', mon: 2, tue: 1, wed: 2, thu: 1, fri: 2, sat: 0 },
  { name: 'Ms. Ayesha Malik', mon: 1, tue: 2, wed: 1, thu: 1, fri: 1, sat: 1 },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">Academic Dashboard</h2>
        <p className="text-muted-foreground">Real-time overview of duties and attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Staff"
          value="47"
          change="+3"
          trend="up"
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="This Week Duties"
          value="73"
          change="+12"
          trend="up"
          color="secondary"
        />
        <StatCard
          icon={CheckCircle}
          label="Attendance Rate"
          value="89%"
          change="+5%"
          trend="up"
          color="chart-3"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value="8"
          change="-2"
          trend="down"
          color="chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Weekly Attendance Trend</h3>
              <p className="text-sm text-muted-foreground mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+7.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F9EFF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4F9EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(28, 34, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E8EAED',
                }}
              />
              <Area
                type="monotone"
                dataKey="attendance"
                stroke="#4F9EFF"
                strokeWidth={2}
                fill="url(#attendanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Daily Duty Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Duties assigned per day</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(28, 34, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E8EAED',
                }}
              />
              <Bar dataKey="duties" fill="#B8A3E8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Staff Status Heatmap</h3>
          <p className="text-sm text-muted-foreground mt-1">Duty load per staff member this week</p>
        </div>
        <div className="space-y-3">
          {heatmapData.map((staff, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-40 text-sm text-foreground font-medium">{staff.name}</div>
              <div className="flex-1 flex gap-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => {
                  const value = staff[day as keyof typeof staff] as number;
                  const intensity = value === 0 ? 0 : value === 1 ? 0.4 : 0.8;
                  return (
                    <div
                      key={day}
                      className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: `rgba(79, 158, 255, ${intensity})`,
                        color: value === 0 ? '#9CA3AF' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

function StatCard({ icon: Icon, label, value, change, trend, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: '#4F9EFF',
    secondary: '#B8A3E8',
    'chart-3': '#34D399',
    'chart-4': '#FBBF24',
  };

  const bgColor = colorMap[color] || '#4F9EFF';

  return (
    <div
      className="rounded-2xl border p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        boxShadow: `0 4px 20px ${bgColor}15`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${bgColor}20` }}>
          <Icon className="w-6 h-6" style={{ color: bgColor }} />
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-lg ${trend === 'up' ? 'text-chart-3 bg-chart-3/20' : 'text-chart-5 bg-chart-5/20'}`}
        >
          {change}
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
