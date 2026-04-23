'use client';

import { useState } from 'react';
import { Calendar, Sparkles, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const staffMembers = [
  'Dr. Sarah Khan',
  'Prof. Ahmed Ali',
  'Dr. Fatima Noor',
  'Ms. Ayesha Malik',
  'Dr. Hina Shah',
  'Prof. Zainab Raza',
];

const mockRoster = [
  { day: 'Monday', staff: ['Dr. Sarah Khan', 'Prof. Ahmed Ali'], shift: 'Morning', conflict: false },
  { day: 'Tuesday', staff: ['Dr. Fatima Noor', 'Ms. Ayesha Malik'], shift: 'Afternoon', conflict: true },
  { day: 'Wednesday', staff: ['Dr. Hina Shah', 'Prof. Zainab Raza'], shift: 'Morning', conflict: false },
  { day: 'Thursday', staff: ['Dr. Sarah Khan', 'Dr. Fatima Noor'], shift: 'Full Day', conflict: false },
  { day: 'Friday', staff: ['Prof. Ahmed Ali', 'Ms. Ayesha Malik'], shift: 'Morning', conflict: false },
  { day: 'Saturday', staff: ['Dr. Hina Shah'], shift: 'Morning', conflict: false },
];

export default function DutyRoster() {
  const [selectedWeek, setSelectedWeek] = useState('Week 3 - April 2026');

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">AI Duty Roster Generator</h2>
          <p className="text-muted-foreground">Smart scheduling with conflict detection</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
          <Sparkles className="w-5 h-5" />
          Generate with AI
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{selectedWeek}</span>
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
          <Plus className="w-4 h-4" />
          Add Manual Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-6 backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="space-y-4">
            {mockRoster.map((entry, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border transition-all hover:border-primary/50 cursor-pointer"
                style={{
                  background: entry.conflict ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: entry.conflict ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: entry.conflict ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{entry.day}</h4>
                      <span className="px-2 py-1 text-xs rounded-lg bg-primary/20 text-primary font-medium">
                        {entry.shift}
                      </span>
                      {entry.conflict && (
                        <span className="px-2 py-1 text-xs rounded-lg bg-destructive/20 text-destructive font-medium animate-pulse">
                          Conflict Detected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.staff.map((person, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground"
                        >
                          {person}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  <p className="text-sm text-foreground font-medium mb-1">Balance Tuesday Load</p>
                  <p className="text-xs text-muted-foreground">Reduce conflicts by swapping Dr. Fatima with Dr. Hina</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Weekend Coverage</p>
                  <p className="text-xs text-muted-foreground">Add one more staff member for Saturday duties</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-chart-3/10 border border-chart-3/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-chart-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Optimize Workload</p>
                  <p className="text-xs text-muted-foreground">Current distribution is 92% optimal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-foreground mb-3">Available Staff</h4>
            <div className="space-y-2">
              {staffMembers.map((staff, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  <span className="text-sm text-foreground">{staff}</span>
                  <div className="w-2 h-2 rounded-full bg-chart-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
