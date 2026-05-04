'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, AlertCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek, format, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    staffCount: 0,
    dutyCount: 0,
    attendanceRate: '89%',
    pendingLeaves: 0
  });
  const [weeklyDuties, setWeeklyDuties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Total Staff
      const { count: staffCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      // 2. This Week Duties
      const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      const { count: dutyCount } = await supabase
        .from('duties')
        .select('*', { count: 'exact', head: true })
        .gte('duty_date', start)
        .lte('duty_date', end);

      // 3. Pending Approvals
      const { count: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        staffCount: staffCount || 0,
        dutyCount: dutyCount || 0,
        attendanceRate: '89%', // Placeholder for now
        pendingLeaves: pendingLeaves || 0
      });

      // 4. Weekly Distribution (Last 7 days)
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const { data: dutiesData } = await supabase
        .from('duties')
        .select('duty_date')
        .gte('duty_date', format(last7Days[0], 'yyyy-MM-dd'));

      const chartData = last7Days.map(day => {
        const count = dutiesData?.filter(d => isSameDay(new Date(d.duty_date), day)).length || 0;
        return {
          day: format(day, 'EEE'),
          duties: count,
          attendance: 80 + Math.floor(Math.random() * 20) // Mock attendance trend
        };
      });

      setWeeklyDuties(chartData);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-3xl font-semibold text-foreground mb-2">Academic Dashboard</h2>
        <p className="text-muted-foreground">Real-time overview of duties and attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Staff"
          value={stats.staffCount.toString()}
          change="+3"
          trend="up"
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="This Week Duties"
          value={stats.dutyCount.toString()}
          change="+12"
          trend="up"
          color="secondary"
        />
        <StatCard
          icon={CheckCircle}
          label="Attendance Rate"
          value={stats.attendanceRate}
          change="+5%"
          trend="up"
          color="chart-3"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value={stats.pendingLeaves.toString()}
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
            <AreaChart data={weeklyDuties}>
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
            <BarChart data={weeklyDuties}>
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

