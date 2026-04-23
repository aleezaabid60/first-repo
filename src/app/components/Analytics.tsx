'use client';

import { Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', attendance: 85, duties: 120, leaves: 15 },
  { month: 'Feb', attendance: 88, duties: 135, leaves: 12 },
  { month: 'Mar', attendance: 92, duties: 145, leaves: 10 },
  { month: 'Apr', attendance: 89, duties: 140, leaves: 18 },
];

const departmentData = [
  { name: 'Computer Science', value: 28, color: '#4F9EFF' },
  { name: 'Mathematics', value: 22, color: '#B8A3E8' },
  { name: 'Physics', value: 18, color: '#34D399' },
  { name: 'Chemistry', value: 16, color: '#FBBF24' },
  { name: 'Biology', value: 16, color: '#F87171' },
];

const performanceData = [
  { week: 'Week 1', efficiency: 85 },
  { week: 'Week 2', efficiency: 88 },
  { week: 'Week 3', efficiency: 92 },
  { week: 'Week 4', efficiency: 90 },
];

export default function Analytics() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and reports</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={Users}
          label="Total Staff"
          value="47"
          subtext="Active members"
          color="#4F9EFF"
        />
        <MetricCard
          icon={Calendar}
          label="Duties This Month"
          value="140"
          subtext="Across all departments"
          color="#B8A3E8"
        />
        <MetricCard
          icon={TrendingUp}
          label="Efficiency Rate"
          value="90%"
          subtext="+5% from last month"
          color="#34D399"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Monthly Performance Trends</h3>
            <p className="text-sm text-muted-foreground mt-1">Attendance, duties, and leaves over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(28, 34, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E8EAED',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#4F9EFF" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="duties" stroke="#B8A3E8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="leaves" stroke="#F87171" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Staff Distribution by Department</h3>
            <p className="text-sm text-muted-foreground mt-1">Percentage breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(28, 34, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E8EAED',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Weekly Efficiency Score</h3>
          <p className="text-sm text-muted-foreground mt-1">Performance optimization metrics</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="week" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(28, 34, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#E8EAED',
              }}
            />
            <Bar dataKey="efficiency" fill="#34D399" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <h3 className="font-semibold text-foreground mb-4">Key Insights</h3>
          <div className="space-y-3">
            <InsightItem
              color="#4F9EFF"
              title="Peak Performance Day"
              description="Thursday shows highest attendance rate at 95%"
            />
            <InsightItem
              color="#B8A3E8"
              title="Department Efficiency"
              description="Computer Science leads with 92% duty completion"
            />
            <InsightItem
              color="#34D399"
              title="Leave Trend"
              description="18% decrease in leave requests this quarter"
            />
          </div>
        </div>

        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <h3 className="font-semibold text-foreground mb-4">Recommendations</h3>
          <div className="space-y-3">
            <RecommendationItem
              title="Optimize Weekend Coverage"
              description="Consider rotating Saturday duties to improve work-life balance"
            />
            <RecommendationItem
              title="Balance Department Load"
              description="Redistribute duties more evenly across all departments"
            />
            <RecommendationItem
              title="Automate Scheduling"
              description="Use AI suggestions to reduce manual planning time by 40%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, subtext, color }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl border p-6 backdrop-blur-xl"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-semibold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

interface InsightItemProps {
  color: string;
  title: string;
  description: string;
}

function InsightItem({ color, title, description }: InsightItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all">
      <div className="w-1 h-full rounded-full mt-1" style={{ backgroundColor: color }} />
      <div>
        <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface RecommendationItemProps {
  title: string;
  description: string;
}

function RecommendationItem({ title, description }: RecommendationItemProps) {
  return (
    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all">
      <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
