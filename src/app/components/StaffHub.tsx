'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, UserCheck, Clock, CheckCircle, XCircle, Loader2, Users, UserMinus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { differenceInDays, format } from 'date-fns';


import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import StaffDetailModal from './StaffDetailModal';


const MOCK_LEAVE_REQUESTS = [
  {
    id: '1',
    teacher_id: '3',
    staff_name: 'Prof. Ahmed Ali',
    type: 'Sick Leave',
    start_date: '2026-04-25',
    end_date: '2026-04-27',
    status: 'pending'
  },
  {
    id: '2',
    teacher_id: '8',
    staff_name: 'Dr. Hina Shah',
    type: 'Personal Leave',
    start_date: '2026-04-22',
    end_date: '2026-04-22',
    status: 'pending'
  }
];

const MOCK_STAFF_DATA = [
  { id: '1', name: 'Mr. Hamza', role: 'Lecturer', department: 'Computer Science', email: 'hamza@rwu.edu.pk' },
  { id: '2', name: 'Ms. Tabassum Kanwal', role: 'Senior Lecturer', department: 'Computer Science', email: 'tabassum@rwu.edu.pk' },
  { id: '3', name: 'Dr. Adnan', role: 'Professor', department: 'Computer Science', email: 'adnan@rwu.edu.pk' },
  { id: '4', name: 'Mr. Umer Sultan', role: 'Lecturer', department: 'Computer Science', email: 'umer@rwu.edu.pk' },
  { id: '5', name: 'Mr. Awais', role: 'Lecturer', department: 'Computer Science', email: 'awais@rwu.edu.pk' },
  { id: '6', name: 'Dr. Hshmat', role: 'Professor', department: 'Mathematics', email: 'hshmat@rwu.edu.pk' },
  { id: '7', name: 'Ms. Mehwish', role: 'Lecturer', department: 'English', email: 'mehwish@rwu.edu.pk' },
  { id: '8', name: 'Ms. Attia', role: 'Lecturer', department: 'Computer Science', email: 'attia@rwu.edu.pk' },
  { id: '9', name: 'Ms. Ayesha Sarfraz', role: 'Lecturer', department: 'English', email: 'ayesha@rwu.edu.pk' },
  { id: '10', name: 'Dr. Qurat ul Ain', role: 'Professor', department: 'Islamic Studies', email: 'qurat@rwu.edu.pk' },
  { id: '11', name: 'Mr. Kashif', role: 'Lecturer', department: 'Business', email: 'kashif@rwu.edu.pk' },
  { id: '12', name: 'Mr. Mujahid', role: 'Lecturer', department: 'Computer Science', email: 'mujahid@rwu.edu.pk' },
];

export default function StaffHub() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [staff, setStaff] = useState<any[]>(MOCK_STAFF_DATA);
  const [leaveRequests, setLeaveRequests] = useState<any[]>(MOCK_LEAVE_REQUESTS);
  const [approvedLeavesToday, setApprovedLeavesToday] = useState<any[]>([{ teacher_id: '3' }]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  // Add Staff State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    department: '',
    email: ''
  });


  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch staff members from correct 'staff' table
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (staffError || !staffData || staffData.length === 0) {
        setStaff(MOCK_STAFF_DATA);
      } else {
        setStaff(staffData);
      }



      // Use mock leave requests
      setLeaveRequests(MOCK_LEAVE_REQUESTS);

      // Optionally set mock approved leaves if we wanted
      setApprovedLeavesToday([{ teacher_id: staffData ? staffData[2]?.id : '3' }]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStaff(MOCK_STAFF_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // Mock action since leave_requests table is not defined in schema
      setLeaveRequests((prev) => prev.filter((req) => req.id !== id));

      // Optionally handle supabase if table exists later
      const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id);

      if (error && error.code !== '42P01') { // Ignore relation does not exist error
        console.warn('Leave request table not found, ignoring DB update.');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('staff')
        .insert([
          {
            name: newStaff.name,
            role: newStaff.role,
            department: newStaff.department,
            email: newStaff.email || null, // Ensure email is null if empty to avoid empty string uniqueness issues
          }
        ]);

      if (error) throw error;

      // Reset form and close dialog
      setNewStaff({ name: '', role: '', department: '', email: '' });
      setIsAddStaffOpen(false);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff member. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const onLeaveTeacherIds = new Set(approvedLeavesToday.map(l => l.teacher_id));

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const isOnLeave = onLeaveTeacherIds.has(s.id);
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && !isOnLeave) ||
      (filter === 'leave' && isOnLeave);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: staff.length,
    onLeave: onLeaveTeacherIds.size,
    active: staff.length - onLeaveTeacherIds.size
  };



  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Staff & Leave Management</h2>
          <p className="text-muted-foreground">Directory and leave approval workflow</p>
        </div>
        <div className="flex items-center gap-4">
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

          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-[42px] px-4">
                <Plus className="w-4 h-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddStaff}>
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>
                    Add a new staff member to the directory. Fill in their details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. John Doe"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Lecturer, Professor"
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="e.g. Computer Science"
                      value={newStaff.department}
                      onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@rwu.edu.pk"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Staff Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Staff Directory */}
        <div className="lg:col-span-2 rounded-2xl border backdrop-blur-xl overflow-hidden flex flex-col" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', maxHeight: '800px' }}>
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Staff Directory</h3>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="text-xs text-primary hover:underline">Clear Filters</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredStaff.map((member) => {
              const initials = member.name ? member.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : '??';
              const isOnLeave = onLeaveTeacherIds.has(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => {
                    setSelectedStaff(member);
                    setIsDetailOpen(true);
                  }}
                  className="p-5 hover:bg-white/5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.department} · {member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        {isOnLeave ? (
                          <span className="px-3 py-1.5 text-xs rounded-lg bg-chart-4/20 text-chart-4 font-medium flex items-center gap-1.5">
                            On Leave
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 text-xs rounded-lg bg-chart-3/20 text-chart-3 font-medium flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Summary + Leave Approvals */}
        <div className="flex flex-col gap-6">

          {/* Live Availability Summary */}
          <div className="rounded-2xl border backdrop-blur-xl overflow-hidden flex flex-col" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
            <div className="p-5 pb-2">
              <h3 className="text-lg font-bold text-foreground mb-1">Live Availability Summary</h3>
              <p className="text-xs text-muted-foreground mb-4">Academic staff currently present for classes and duties</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  onClick={() => setFilter('active')}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${filter === 'active' ? 'border-chart-3 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'border-white/10 hover:border-chart-3/50'}`}
                  style={{ background: 'rgba(52,211,153,0.08)' }}
                >
                  <p className="text-xs text-center font-medium text-chart-3/90 mb-1">Available</p>
                  <p className="text-3xl text-center font-bold text-chart-3">{stats.active}</p>
                </div>
                <div
                  onClick={() => setFilter('leave')}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${filter === 'leave' ? 'border-chart-4 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'border-white/10 hover:border-chart-4/50'}`}
                  style={{ background: 'rgba(250,204,21,0.08)' }}
                >
                  <p className="text-xs text-center font-medium text-chart-4/90 mb-1">On Leave</p>
                  <p className="text-3xl text-center font-bold text-chart-4">{stats.onLeave}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 max-h-[220px] overflow-y-auto px-5 pb-5 space-y-2 custom-scrollbar">
              {filteredStaff.map((member) => {
                const isOnLeave = onLeaveTeacherIds.has(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedStaff(member);
                      setIsDetailOpen(true);
                    }}
                    className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isOnLeave ? 'bg-chart-4' : 'bg-chart-3'}`} />
                      <h4 className="font-medium text-foreground text-xs tracking-wide truncate max-w-[100px]">{member.name}</h4>
                    </div>
                    <div>
                      {isOnLeave ? (
                        <span className="px-2 py-1 text-[10px] rounded bg-chart-4/10 text-chart-4 font-bold tracking-widest uppercase">
                          ON LEAVE
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] text-chart-3 font-bold tracking-widest uppercase">
                          AVAILABLE
                        </span>
                      )}
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
                  const teacherName = request.staff_name || 'Unknown Staff';
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

