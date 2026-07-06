'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Mail, Loader2, Copy, Check, FileText, CalendarIcon, Save, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

// ── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { id: 'Period 1', label: '08:00 – 09:30 AM' },
  { id: 'Period 2', label: '09:30 – 11:00 AM' },
  { id: 'Period 3', label: '11:00 – 12:30 PM' },
  { id: 'Period 4', label: '01:00 – 02:30 PM' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type Day = typeof DAYS[number];

// busy[day][period] = true means teacher is NOT available that slot
type AvailabilityGrid = Record<Day, Record<string, boolean>>;

function buildEmptyGrid(): AvailabilityGrid {
  const grid = {} as AvailabilityGrid;
  for (const day of DAYS) {
    grid[day] = {};
    for (const slot of TIME_SLOTS) grid[day][slot.id] = false;
  }
  return grid;
}

// Mock timetable — used ONLY to pre-populate busy slots when DB has no data
const MOCK_BUSY: Array<{ day: Day; period: string; staffName: string }> = [
  { day: 'Monday',  period: 'Period 1', staffName: 'Mr. Hamza' },
  { day: 'Tuesday', period: 'Period 1', staffName: 'Mr. Hamza' },
  { day: 'Monday',  period: 'Period 2', staffName: 'Ms. Tabassum Kanwal' },
  { day: 'Wednesday', period: 'Period 2', staffName: 'Ms. Tabassum Kanwal' },
  { day: 'Monday',  period: 'Period 2', staffName: 'Dr. Adnan' },
  { day: 'Tuesday', period: 'Period 3', staffName: 'Mr. Umer Sultan' },
  { day: 'Thursday', period: 'Period 2', staffName: 'Mr. Umer Sultan' },
  { day: 'Thursday', period: 'Period 3', staffName: 'Mr. Umer Sultan' },
];

const MOCK_LEAVE_REQUESTS = [
  { id: 'l1', teacher_id: '3', type: 'Sick Leave',    start_date: '2026-06-15', end_date: '2026-06-17', status: 'approved' },
  { id: 'l2', teacher_id: '8', type: 'Personal Leave', start_date: '2026-06-22', end_date: '2026-06-22', status: 'pending' },
  { id: 'l3', teacher_id: '1', type: 'Casual Leave',  start_date: '2026-06-24', end_date: '2026-06-25', status: 'pending' },
];

const MOCK_DUTIES = [
  { id: 'd1', staff_id: '1', duty_date: '2026-06-22', duty_type: 'Campus Patrol',   location: 'Main Gate', status: 'completed' },
  { id: 'd2', staff_id: '2', duty_date: '2026-06-23', duty_type: 'Invigilation',    location: 'Room 101',  status: 'pending' },
  { id: 'd3', staff_id: '3', duty_date: '2026-06-24', duty_type: 'Lab Supervision', location: 'Lab 1',     status: 'pending' },
  { id: 'd4', staff_id: '4', duty_date: '2026-06-25', duty_type: 'Library Duty',    location: 'Library',   status: 'pending' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeName = (n: string) => n?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffMember: any;
}

export default function StaffDetailModal({ isOpen, onClose, staffMember }: Props) {
  const [busyGrid, setBusyGrid]   = useState<AvailabilityGrid>(buildEmptyGrid());
  const [duties,   setDuties]     = useState<any[]>([]);
  const [leaves,   setLeaves]     = useState<any[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [copied,   setCopied]     = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!staffMember) return;
    setLoading(true);
    const grid = buildEmptyGrid();

    try {
      // 1. Try to pull busy slots from the timetable table
      const { data: ttData } = await supabase
        .from('timetable')
        .select('day_of_week, period')
        .eq('staff_id', staffMember.id);

      if (ttData && ttData.length > 0) {
        for (const row of ttData) {
          const d = row.day_of_week as Day;
          if (grid[d] && row.period) grid[d][row.period] = true;
        }
      } else {
        // Fallback: use mock busy list matched by name
        const nm = normalizeName(staffMember.name);
        for (const entry of MOCK_BUSY) {
          if (normalizeName(entry.staffName) === nm) {
            grid[entry.day][entry.period] = true;
          }
        }
      }

      // 2. Duties
      const { data: dutiesData } = await supabase
        .from('duties')
        .select('*')
        .eq('staff_id', staffMember.id);

      if (dutiesData && dutiesData.length > 0) {
        setDuties(dutiesData);
      } else {
        setDuties(MOCK_DUTIES.filter(d => d.staff_id === staffMember.id));
      }

      // 3. Leaves (mock for now)
      const nm2 = normalizeName(staffMember.name);
      const matched = MOCK_LEAVE_REQUESTS.filter(l =>
        l.teacher_id === staffMember.id ||
        (nm2.includes('adnan') && l.teacher_id === '3') ||
        (nm2.includes('attia') && l.teacher_id === '8') ||
        (nm2.includes('hamza') && l.teacher_id === '1')
      );
      setLeaves(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setBusyGrid(grid);
      setLoading(false);
    }
  }, [staffMember]);

  useEffect(() => {
    if (isOpen && staffMember) load();
  }, [isOpen, staffMember, load]);

  // ── Toggle a slot ──────────────────────────────────────────────────────────
  const toggleSlot = (day: Day, period: string) => {
    setBusyGrid(prev => ({
      ...prev,
      [day]: { ...prev[day], [period]: !prev[day][period] },
    }));
    setSaved(false);
  };

  // ── Save to Supabase ───────────────────────────────────────────────────────
  const saveAvailability = async () => {
    if (!staffMember) return;
    setSaving(true);
    try {
      // Delete old timetable entries for this staff (busy slots are stored as timetable rows)
      await supabase.from('timetable').delete().eq('staff_id', staffMember.id);

      // Re-insert only the busy slots
      const rows: any[] = [];
      for (const day of DAYS) {
        for (const slot of TIME_SLOTS) {
          if (busyGrid[day][slot.id]) {
            rows.push({
              staff_id:    staffMember.id,
              day_of_week: day,
              period:      slot.id,
              subject:     'Reserved',   // required by NOT NULL but not shown
              class_name:  'Reserved',
            });
          }
        }
      }
      if (rows.length > 0) await supabase.from('timetable').insert(rows);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  if (!staffMember) return null;

  const initials = staffMember.name
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?';

  const isOnLeave   = leaves.some(l => l.status === 'approved');
  const totalSlots  = DAYS.length * TIME_SLOTS.length;
  const busyCount   = DAYS.reduce((acc, d) => acc + TIME_SLOTS.filter(s => busyGrid[d][s.id]).length, 0);
  const freeCount   = totalSlots - busyCount;

  const copyEmail = () => {
    if (staffMember.email) {
      navigator.clipboard.writeText(staffMember.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl bg-[#0f1521] border-white/10 h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-[#0f1521] border-white/10 text-foreground max-h-[92vh] flex flex-col p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogTitle className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-xl">{staffMember.name}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-widest ${
                  isOnLeave ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {isOnLeave ? 'On Leave' : 'Active'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {staffMember.department || 'Academic Staff'} · {staffMember.role}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/60 mt-1">
            Click any slot to toggle availability. Save to apply changes.
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Info Row ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Email */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm truncate text-foreground">{staffMember.email || '—'}</span>
              </div>
              {staffMember.email && (
                <button onClick={copyEmail} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-emerald-400">{freeCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Free Slots</p>
              </div>
              <div>
                <p className="text-xl font-bold text-rose-400">{busyCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Busy Slots</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">{leaves.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Leaves</p>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="availability" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-white/[0.04] rounded-xl border border-white/5 p-1">
              <TabsTrigger value="availability" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 text-sm font-medium">
                Availability
              </TabsTrigger>
              <TabsTrigger value="duties" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 text-sm font-medium">
                Duties
              </TabsTrigger>
              <TabsTrigger value="leaves" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 text-sm font-medium">
                Leave Summary
              </TabsTrigger>
            </TabsList>

            {/* ────────────────── AVAILABILITY TAB ────────────────── */}
            <TabsContent value="availability" className="pt-4 space-y-4">

              {/* Legend + Save */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/40 inline-block" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/40 inline-block" />
                    Not Available
                  </span>
                  <span className="text-muted-foreground/50 text-[10px]">· Click any slot to toggle</span>
                </div>

                <button
                  onClick={saveAvailability}
                  disabled={saving}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    saved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>

              {/* Grid */}
              <div className="rounded-xl border border-white/5 overflow-hidden">
                {/* Day header row */}
                <div className="grid bg-white/[0.03] border-b border-white/5" style={{ gridTemplateColumns: '110px repeat(5, 1fr)' }}>
                  <div className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">Time</div>
                  {DAYS.map(day => (
                    <div key={day} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground border-l border-white/5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Slot rows */}
                {TIME_SLOTS.map((slot, si) => (
                  <div
                    key={slot.id}
                    className={`grid ${si < TIME_SLOTS.length - 1 ? 'border-b border-white/5' : ''}`}
                    style={{ gridTemplateColumns: '110px repeat(5, 1fr)' }}
                  >
                    {/* Time label */}
                    <div className="px-3 py-3 bg-white/[0.02]">
                      <p className="text-xs font-semibold text-foreground/80">{slot.id}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{slot.label}</p>
                    </div>

                    {/* Day cells */}
                    {DAYS.map(day => {
                      const isBusy = busyGrid[day][slot.id];
                      return (
                        <button
                          key={day}
                          onClick={() => toggleSlot(day, slot.id)}
                          title={isBusy ? 'Click to mark Available' : 'Click to mark Not Available'}
                          className={`border-l border-white/5 py-3 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer group ${
                            isBusy
                              ? 'bg-rose-500/10 hover:bg-rose-500/20'
                              : 'bg-emerald-500/8 hover:bg-emerald-500/15'
                          }`}
                        >
                          {isBusy ? (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide leading-none">Busy</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide leading-none">Free</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ────────────────── DUTIES TAB ────────────────── */}
            <TabsContent value="duties" className="pt-4">
              {duties.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No duties assigned to this teacher.
                </div>
              ) : (
                <div className="space-y-2">
                  {duties.map(duty => (
                    <div key={duty.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-white">{duty.duty_type}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {duty.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-white/80">{format(new Date(duty.duty_date), 'EEE, MMM d, yyyy')}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                          duty.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : duty.status === 'absent'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {duty.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ────────────────── LEAVE TAB ────────────────── */}
            <TabsContent value="leaves" className="pt-4">
              {leaves.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No leave history found.
                </div>
              ) : (
                <div className="space-y-2">
                  {leaves.map(leave => {
                    const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
                    return (
                      <div key={leave.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-white">{leave.type}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(leave.start_date), 'MMM d')} – {format(new Date(leave.end_date), 'MMM d')} &nbsp;·&nbsp; {days} {days === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${
                          leave.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : leave.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
