'use client';

import { Search, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

const staffData = [
  { name: 'Dr. Sarah Khan', department: 'Computer Science', status: 'active', leaves: 2, pending: 0 },
  { name: 'Prof. Ahmed Ali', department: 'Mathematics', status: 'active', leaves: 5, pending: 1 },
  { name: 'Dr. Fatima Noor', department: 'Physics', status: 'on-leave', leaves: 3, pending: 0 },
  { name: 'Ms. Ayesha Malik', department: 'English', status: 'active', leaves: 1, pending: 0 },
  { name: 'Dr. Hina Shah', department: 'Chemistry', status: 'active', leaves: 4, pending: 2 },
  { name: 'Prof. Zainab Raza', department: 'Biology', status: 'active', leaves: 2, pending: 0 },
];

const leaveRequests = [
  { name: 'Prof. Ahmed Ali', type: 'Sick Leave', from: 'Apr 25', to: 'Apr 27', days: 3, status: 'pending' },
  { name: 'Dr. Hina Shah', type: 'Personal Leave', from: 'Apr 22', to: 'Apr 22', days: 1, status: 'pending' },
  { name: 'Dr. Hina Shah', type: 'Annual Leave', from: 'May 1', to: 'May 5', days: 5, status: 'pending' },
];

export default function StaffHub() {
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
            {staffData.map((staff, idx) => (
              <div
                key={idx}
                className="p-5 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Leaves</p>
                      <p className="text-lg font-semibold text-foreground">{staff.leaves}</p>
                    </div>
                    {staff.pending > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Pending</p>
                        <p className="text-lg font-semibold text-chart-4">{staff.pending}</p>
                      </div>
                    )}
                    <div>
                      {staff.status === 'active' ? (
                        <span className="px-3 py-1.5 text-xs rounded-lg bg-chart-3/20 text-chart-3 font-medium flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs rounded-lg bg-chart-4/20 text-chart-4 font-medium flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          On Leave
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border backdrop-blur-xl" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="p-6 border-b border-white/10">
            <h3 className="font-semibold text-foreground">Leave Approvals</h3>
            <p className="text-sm text-muted-foreground mt-1">Pending requests</p>
          </div>
          <div className="p-4 space-y-3">
            {leaveRequests.map((request, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-white/10 bg-white/3 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">{request.name}</h4>
                    <p className="text-xs text-muted-foreground">{request.type}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-lg bg-chart-4/20 text-chart-4 font-medium">
                    {request.days} days
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{request.from} - {request.to}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-chart-3/20 text-chart-3 hover:bg-chart-3/30 transition-all">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Approve</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
