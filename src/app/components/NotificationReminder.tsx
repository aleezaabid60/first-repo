'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, Settings, History, Sparkles, Clock, User, Mail, 
  CheckCircle2, AlertCircle, Loader2, Play, RefreshCw, 
  Calendar, Info, Send, FileText, CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, addDays, isSameDay, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function NotificationReminder() {
  const [activeTab, setActiveTab] = useState<'queue' | 'templates' | 'history'>('queue');
  const [duties, setDuties] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Time machine simulation date-time state
  const [simulatedTime, setSimulatedTime] = useState<string>(
    new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
  );

  // Reminders configurations
  const [templates, setTemplates] = useState({
    subject24h: 'Upcoming Duty Reminder: 24-Hour Notice',
    body24h: 'Dear {{teacherName}},\n\nThis is an automated reminder that you have an upcoming duty scheduled for tomorrow:\n\n- Date: {{dutyDate}}\n- Time Slot: {{dutyTime}}\n- Room/Location: {{location}}\n- Subject/Type: {{subject}}\n\nPlease ensure you arrive on time. If you need a substitute, request one via the Staff Hub.\n\nRegards,\nRWU Administration',
    subject15m: 'URGENT: Duty Roster Alert (15-Minute Warning)',
    body15m: 'Hello {{teacherName}},\n\nYour scheduled duty starts in 15 minutes!\n\n- Time Slot: {{dutyTime}}\n- Room/Location: {{location}}\n- Subject/Type: {{subject}}\n\nPlease report to your duty station immediately.\n\nRegards,\nRWU Administration',
  });

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: 'admin60@gmail.com',
    pass: '••••••••••••••••'
  });

  // Track sent status locally (with localStorage fallback)
  const [sentLogs, setSentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    // Load sent logs from localStorage
    const savedLogs = localStorage.getItem('rwu_sent_reminders');
    if (savedLogs) {
      setSentLogs(JSON.parse(savedLogs));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: staffData } = await supabase.from('staff').select('*');
      const { data: dutiesData } = await supabase.from('duties').select('*');

      setStaff(staffData || []);
      
      if (dutiesData) {
        // Hydrate duties with staff info
        const hydrated = dutiesData.map((d: any) => {
          const teacher = staffData?.find((s: any) => s.id === d.staff_id);
          return {
            ...d,
            staff: teacher || { name: 'Unknown Staff', email: 'unknown@rwu.edu' }
          };
        });
        setDuties(hydrated);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to sync with database. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const getLogKey = (dutyId: string, type: '24h' | '15m') => `duty_${dutyId}_${type}`;

  const isReminderSent = (dutyId: string, type: '24h' | '15m') => {
    return sentLogs.some(log => log.dutyId === dutyId && log.type === type);
  };

  // Helper to parse subject and time from duty_type
  const parseDutyType = (type: string) => {
    const match = type?.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return {
        subject: match[1].trim(),
        time: match[2].trim()
      };
    }
    return {
      subject: type || 'Invigilation',
      time: '09:00 - 11:00'
    };
  };

  // Extract start time hour/minute from string like "08:00 - 09:30"
  const getDutyDateTime = (dutyDateStr: string, timeSlot: string) => {
    const { time } = parseDutyType(timeSlot);
    const startTimeStr = time.split('-')[0].trim(); // e.g. "08:00"
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    
    const dutyDate = new Date(dutyDateStr);
    dutyDate.setHours(hours || 9, minutes || 0, 0, 0);
    return dutyDate;
  };

  const handleSendReminder = async (duty: any, type: '24h' | '15m') => {
    const { subject: parsedSubject, time: parsedTime } = parseDutyType(duty.duty_type);
    const teacherName = duty.staff?.name || 'Teacher';
    const email = duty.staff?.email || `${teacherName.toLowerCase().replace(/\s+/g, '')}@rwu.edu`;
    const dutyDateFormatted = format(new Date(duty.duty_date), 'EEEE, MMMM d, yyyy');

    // Replace template tags
    const subjectTemplate = type === '24h' ? templates.subject24h : templates.subject15m;
    const bodyTemplate = type === '24h' ? templates.body24h : templates.body15m;

    const replaceTags = (text: string) => {
      return text
        .replace(/{{teacherName}}/g, teacherName)
        .replace(/{{dutyDate}}/g, dutyDateFormatted)
        .replace(/{{dutyTime}}/g, parsedTime)
        .replace(/{{location}}/g, duty.location)
        .replace(/{{subject}}/g, parsedSubject);
    };

    const finalSubject = replaceTags(subjectTemplate);
    const finalBody = replaceTags(bodyTemplate).replace(/\n/g, '<br/>');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: finalSubject,
          html: finalBody,
          teacherName,
          dutyDate: dutyDateFormatted,
          dutyTime: parsedTime,
          location: duty.location,
          reminderType: type
        })
      });

      const resData = await response.json();

      if (resData.success) {
        // Record log
        const newLog = {
          id: Math.random().toString(36).substr(2, 9),
          dutyId: duty.id,
          teacherName,
          email,
          type,
          subject: finalSubject,
          sentAt: new Date().toISOString(),
          status: 'Success',
          mode: resData.mode || 'mock'
        };

        const updatedLogs = [newLog, ...sentLogs];
        setSentLogs(updatedLogs);
        localStorage.setItem('rwu_sent_reminders', JSON.stringify(updatedLogs));

        toast.success(`Successfully sent ${type === '24h' ? '24h' : '15m'} notification to ${teacherName}!`);
      } else {
        throw new Error(resData.error || 'Failed to send');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  // Automatically scan and trigger reminders based on simulated time
  const handleAutoScan = () => {
    setScanning(true);
    const simDate = new Date(simulatedTime);
    let triggerCount = 0;

    setTimeout(() => {
      duties.forEach((duty) => {
        const dutyDateTime = getDutyDateTime(duty.duty_date, duty.duty_type);
        
        // Calculate differences in minutes
        const diffMs = dutyDateTime.getTime() - simDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        // 24 Hour notice condition (between 23 and 25 hours remaining)
        if (diffHours >= 23 && diffHours <= 25 && !isReminderSent(duty.id, '24h')) {
          handleSendReminder(duty, '24h');
          triggerCount++;
        }

        // 15 Minute alert condition (between 0 and 15 minutes remaining)
        if (diffMinutes >= 0 && diffMinutes <= 15 && !isReminderSent(duty.id, '15m')) {
          handleSendReminder(duty, '15m');
          triggerCount++;
        }
      });

      setScanning(false);
      if (triggerCount > 0) {
        toast.success(`Scan completed. Triggered ${triggerCount} automated alerts!`);
      } else {
        toast.info('Scan completed. No pending duties fell within reminder triggers.');
      }
    }, 1500);
  };

  const handleClearHistory = () => {
    setSentLogs([]);
    localStorage.removeItem('rwu_sent_reminders');
    toast.success('Sent history logs cleared.');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Notification & Reminder System</h2>
          <p className="text-muted-foreground">Automated email alerts and status tracking for scheduled duties</p>
        </div>
      </div>

      {/* Time Machine Simulation Control Panel */}
      <div className="rounded-2xl border p-6 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Reminders Time Machine Simulator</h3>
              <p className="text-xs text-muted-foreground">Set a simulated current date/time to verify notifications trigger correctly</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="datetime-local"
              value={simulatedTime}
              onChange={(e) => setSimulatedTime(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAutoScan}
              disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Scan & Trigger
            </button>
            <button
              onClick={() => setSimulatedTime(new Date().toISOString().slice(0, 16))}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
              title="Reset to Actual Time"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'queue' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Reminder Queue</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Templates & SMTP</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
            activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Sent History Logs</span>
          </div>
        </button>
      </div>

      {/* Content Panels */}
      {activeTab === 'queue' && (
        <div className="rounded-2xl border backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Active Roster Duties</h3>
              <p className="text-xs text-muted-foreground mt-1">Live status of teachers scheduled for invigilations and duties</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
              title="Refresh Roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 font-semibold text-muted-foreground">
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Duty Date</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">24h Notice</th>
                  <th className="p-4 text-center">15m Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading roster database...
                    </td>
                  </tr>
                ) : duties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No duties available in the current week roster. Please generate a Duty Roster first.
                    </td>
                  </tr>
                ) : (
                  duties.map((duty) => {
                    const { time } = parseDutyType(duty.duty_type);
                    const is24Sent = isReminderSent(duty.id, '24h');
                    const is15Sent = isReminderSent(duty.id, '15m');
                    return (
                      <tr key={duty.id} className="hover:bg-white/3 transition-all">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            <span>{duty.staff?.name}</span>
                          </div>
                        </td>
                        <td className="p-4">{format(new Date(duty.duty_date), 'MMM d, yyyy')}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                            <Clock className="w-3.5 h-3.5" />
                            {time}
                          </span>
                        </td>
                        <td className="p-4">{duty.location}</td>
                        <td className="p-4 text-center">
                          {is24Sent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-400/20 text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendReminder(duty, '24h')}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                            >
                              <Send className="w-3 h-3" /> Send 24h
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {is15Sent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-400/20 text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendReminder(duty, '15m')}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all"
                            >
                              <Send className="w-3 h-3" /> Send 15m
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 24h template */}
            <div className="rounded-2xl border p-6 backdrop-blur-xl space-y-4" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">24-Hour Notice Email Template</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">Subject Line</label>
                  <input
                    type="text"
                    value={templates.subject24h}
                    onChange={(e) => setTemplates({ ...templates, subject24h: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">HTML Template Content</label>
                  <textarea
                    rows={8}
                    value={templates.body24h}
                    onChange={(e) => setTemplates({ ...templates, body24h: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 15m template */}
            <div className="rounded-2xl border p-6 backdrop-blur-xl space-y-4" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-foreground">15-Minute Alert Email Template</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">Subject Line</label>
                  <input
                    type="text"
                    value={templates.subject15m}
                    onChange={(e) => setTemplates({ ...templates, subject15m: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">HTML Template Content</label>
                  <textarea
                    rows={8}
                    value={templates.body15m}
                    onChange={(e) => setTemplates({ ...templates, body15m: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border p-6 backdrop-blur-xl space-y-4" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">SMTP Server Settings</h3>
              </div>
              <p className="text-xs text-muted-foreground">Modify credentials to support real email notifications via a custom SMTP server</p>
              
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Port</label>
                  <input
                    type="text"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Username / Email</label>
                  <input
                    type="text"
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Password / App Key</label>
                  <input
                    type="password"
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => toast.success('SMTP configurations updated locally.')}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all mt-2"
                >
                  Save SMTP Settings
                </button>
              </div>
            </div>

            <div className="rounded-2xl border p-4 backdrop-blur-xl bg-primary/5 border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Template Tag Reference</span>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1 pl-4 list-disc">
                <li><code>{"{{teacherName}}"}</code>: Full name of the faculty member</li>
                <li><code>{"{{dutyDate}}"}</code>: Formatted date of the duty</li>
                <li><code>{"{{dutyTime}}"}</code>: Start & End time of the duty</li>
                <li><code>{"{{location}}"}</code>: Classroom / Room number</li>
                <li><code>{"{{subject}}"}</code>: Subject title / Duty Type</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-2xl border backdrop-blur-xl overflow-hidden" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Sent Timeline & Activity Logs</h3>
              <p className="text-xs text-muted-foreground mt-1">Audit trail of all reminder emails dispatched by the system</p>
            </div>
            {sentLogs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all"
              >
                Clear History Logs
              </button>
            )}
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {sentLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">
                No notification emails have been dispatched yet.
              </div>
            ) : (
              sentLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/2 transition-all flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === '24h' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                      }`}>
                        {log.type === '24h' ? '24h Notice' : '15m Warning'}
                      </span>
                      <h4 className="font-semibold text-foreground text-sm">{log.teacherName}</h4>
                      <span className="text-xs text-muted-foreground">({log.email})</span>
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-semibold text-white/50">Subject:</span> {log.subject}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                      <span>Dispatched: {format(new Date(log.sentAt), 'PPP p')}</span>
                      <span>•</span>
                      <span className="text-emerald-400 capitalize">{log.mode} mode</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}