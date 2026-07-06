'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, Clock, Users, FileText, BarChart3, GraduationCap, LogOut, UserCheck, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
        });
      } else {
        const hasBypass = document.cookie.includes('demo_bypass=true');
        if (hasBypass) {
          setUser({
            name: 'Admin',
            email: 'admin60@gmail.com',
          });
        }
      }
    };
    getUser();
  }, []);

  const menuItems = [
    { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'roster', href: '/roster', icon: Calendar, label: 'Duty Roster' },
    { id: 'timetable', href: '/timetable', icon: Clock, label: 'Timetable' },
    { id: 'staff', href: '/staff', icon: Users, label: 'Staff & Leave' },
    { id: 'availability', href: '/availability', icon: UserCheck, label: 'Availability for Duty Roster' },
    { id: 'notifications', href: '/notifications', icon: Bell, label: 'Notification & Reminder' },
    { id: 'availability-timetable', href: '/availability-timetable', icon: UserCheck, label: 'Availability for Timetable' },
    { id: 'analytics', href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'project', href: '/project', icon: FileText, label: 'Project Info' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie = "demo_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-white/10 flex flex-col" style={{ background: 'var(--sidebar)' }}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">RWU Platform</h1>
            <p className="text-xs text-muted-foreground">Academic Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Loading...'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || '...'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
