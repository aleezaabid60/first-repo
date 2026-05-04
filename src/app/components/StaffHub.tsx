'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { differenceInDays, format } from 'date-fns';

export default function StaffHub() {
  const [staff, setStaff] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch staff members
      const { data: staffData, error: staffError } = await supabase
        .from('teachers')
        .select('*')
        .order('first_name');

      if (staffError) throw staffError;

      // Fetch pending leave requests with teacher details
      const { data: leavesData, error: leavesError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          teachers (
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (leavesError) throw leavesError;

      setStaff(staffData || []);
      setLeaveRequests(leavesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const filteredStaff = staff.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-3xl font-semibold text-foreground mb-2">Staff & Leave Management</h2>
          <p className="text-muted-foreground">Directory and leave approval workflow</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="p-6 border-b border-white/10">
            <h3 className="font-semibold text-foreground">Staff Directory</h3>
          </div>
          <div className="divide-y divide-white/5">
            {filteredStaff.map((teacher) => {
              const fullName = `${teacher.first_name} ${teacher.last_name}`;
              return (
                <div
                  key={teacher.id}
                  className="p-5 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                        {teacher.first_name[0]}{teacher.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{teacher.first_name} {teacher.last_name}</h4>
                        <p className="text-sm text-muted-foreground">{teacher.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Max Hours</p>
                        <p className="text-lg font-semibold text-foreground">{teacher.max_weekly_hours}</p>
                      </div>
                      <div>
                        <span className="px-3 py-1.5 text-xs rounded-lg bg-chart-3/20 text-chart-3 font-medium flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="p-6 border-b border-white/10">
            <h3 className="font-semibold text-foreground">Leave Approvals</h3>
            <p className="text-sm text-muted-foreground mt-1">Pending requests</p>
          </div>
          <div className="p-4 space-y-3">
            {leaveRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending requests</p>
            ) : (
              leaveRequests.map((request) => {
                const days = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1;
                const teacherName = `${request.teachers.first_name} ${request.teachers.last_name}`;
                return (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border border-white/10 bg-white/3 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground text-sm mb-1">{teacherName}</h4>
                        <p className="text-xs text-muted-foreground">{request.type}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-lg bg-chart-4/20 text-chart-4 font-medium">
                        {days} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLeaveAction(request.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-chart-3/20 text-chart-3 hover:bg-chart-3/30 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Approve</span>
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(request.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Decline</span>
                      </button>
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
}

