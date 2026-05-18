'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Cpu, 
  Layout, 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Database, 
  GraduationCap, 
  Target,
  Calendar,
  ListChecks,
  Info,
  FileCode
} from 'lucide-react';

export default function ProjectInfo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones'>('overview');

  const technologies = [
    { name: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Lucide React'], icon: Layout },
    { name: 'Backend', items: ['Next.js API Routes', 'TypeScript'], icon: Settings },
    { name: 'Database', items: ['Supabase', 'PostgreSQL'], icon: Database },
    { name: 'AI Service', items: ['Google Gemini Pro', 'AI Scheduling Algorithms'], icon: Cpu },
  ];

  const features = [
    'Automatic timetable generation',
    'AI-based duty allocation',
    'Conflict detection',
    'Teacher workload management',
    'Classroom allocation',
    'Admin dashboard',
    'Student timetable view',
    'Export schedules to PDF',
  ];

  const milestones = [
    {
      id: 'M1',
      title: 'Requirement Gathering & Architecture Design',
      description: 'Defined project scope, conducted department head interviews, gathered timetable constraints, and designed system architecture.',
      date: 'Oct 15, 2025',
      progress: 100,
      status: 'Completed',
      deliverables: ['SRS Document', 'System Architecture', 'UI Mockups'],
    },
    {
      id: 'M2',
      title: 'Database Schema & Supabase Configuration',
      description: 'Set up Supabase backend, created tables for staff, timetable slots, duties, and designed row-level security (RLS) policies.',
      date: 'Nov 30, 2025',
      progress: 100,
      status: 'Completed',
      deliverables: ['PostgreSQL Schema', 'Seed Script', 'RLS Policies'],
    },
    {
      id: 'M3',
      title: 'Core UI Development & Dashboard Layout',
      description: 'Built beautiful Next.js interfaces including the Academic Dashboard, Timetable matrix, Duty Roster calendar, and Staff hub.',
      date: 'Jan 15, 2026',
      progress: 100,
      status: 'Completed',
      deliverables: ['Responsive Dashboard', 'Timetable Matrix', 'Roster Calendar'],
    },
    {
      id: 'M4',
      title: 'AI Scheduling Algorithm Integration',
      description: 'Integrated Google Gemini Pro API and engineered heuristic scheduling algorithms to automatically generate conflict-free schedules.',
      date: 'Feb 28, 2026',
      progress: 75,
      status: 'In Progress',
      deliverables: ['Gemini API Integration', 'Heuristic Scheduler'],
    },
    {
      id: 'M5',
      title: 'Validation & Document Generation',
      description: 'Implemented dynamic collision detection to prevent teacher double-booking, and added automated PDF export capability.',
      date: 'Mar 31, 2026',
      progress: 50,
      status: 'In Progress',
      deliverables: ['Conflict Validator', 'PDF Export Engine'],
    },
    {
      id: 'M6',
      title: 'System Integration, Testing & Final Deployment',
      description: 'Perform end-to-end integration testing, execute system validations, prepare deployment pipelines, and compile the final thesis.',
      date: 'May 15, 2026',
      progress: 0,
      status: 'Pending',
      deliverables: ['Testing Report', 'Live Deployment', 'FYP Thesis'],
    },
  ];

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto font-sans text-foreground">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4 animate-pulse" />
          FYP 2025-2026
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          AI Based Duty Scheduling and <br/>
          <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Timetable Management System</span>
        </h1>
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-lg text-muted-foreground leading-relaxed">
            An intelligent system that automatically generates duty schedules and academic timetables 
            using Artificial Intelligence algorithms while reducing conflicts and improving efficiency.
          </p>
          <p className="text-md text-primary font-medium italic dir-rtl leading-relaxed">
            Ye system Artificial Intelligence ki help se automatic duty schedules aur timetable generate karta hai jo conflicts ko kam karta hai aur management ko easy banata hai.
          </p>
        </div>
      </motion.div>

      {/* Tabs Switcher */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            Overview & Stack
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shrink-0 ${
              activeTab === 'milestones'
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Project Milestones
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Objectives */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Project Objectives</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To develop an AI-powered scheduling and timetable management system that automates timetable creation, 
                  minimizes scheduling conflicts, optimizes staff duties, and improves institutional efficiency.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Institution: Rawalpindi Women University</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Department: Computer Science</span>
                  </div>
                </div>
              </motion.div>

              {/* Features List */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-semibold">Key Features</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Technologies & Skills</h2>
                <p className="text-muted-foreground mt-2">Modern tools driving the intelligent automation</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {technologies.map((tech, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                  >
                    <tech.icon className="w-6 h-6 text-primary mb-4" />
                    <h3 className="font-semibold mb-3">{tech.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {tech.items.map((item, j) => (
                        <span key={j} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-muted-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Github Summary */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="p-8 rounded-3xl border border-primary/20 bg-primary/5 text-center space-y-4 shadow-xl"
            >
              <h3 className="text-xl font-semibold">System Overview</h3>
              <p className="max-w-4xl mx-auto text-sm text-muted-foreground leading-relaxed italic">
                "AI Based Duty Scheduling and Timetable Management System is a smart web-based application that uses AI techniques to automate scheduling processes for educational institutions. The system helps administrators efficiently manage teacher duties, class timetables, and resource allocation."
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Project Milestones</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Detailed roadmap of our Final Year Project phases, progress tracking, and key deliverables.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider">Phase & Title</th>
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider w-[35%]">Description</th>
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider">Target Date</th>
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider w-[15%]">Progress</th>
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider">Status</th>
                    <th className="p-5 text-sm font-semibold text-foreground tracking-wider">Key Deliverables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {milestones.map((milestone, idx) => (
                    <motion.tr
                      key={milestone.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.015)' }}
                      className="transition-all duration-200"
                    >
                      {/* Phase & Title */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0 border border-primary/20 shadow-lg shadow-primary/5">
                            {milestone.id}
                          </div>
                          <span className="font-semibold text-foreground text-sm leading-snug">
                            {milestone.title}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="p-5">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {milestone.description}
                        </p>
                      </td>

                      {/* Target Date */}
                      <td className="p-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span>{milestone.date}</span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="p-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                            <span>{milestone.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${milestone.progress}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className={`h-full rounded-full bg-gradient-to-r ${
                                milestone.status === 'Completed'
                                  ? 'from-emerald-500 to-teal-400'
                                  : milestone.status === 'In Progress'
                                  ? 'from-primary to-secondary'
                                  : 'from-zinc-600 to-zinc-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
                            milestone.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                              : milestone.status === 'In Progress'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.05)]'
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              milestone.status === 'Completed'
                                ? 'bg-emerald-400'
                                : milestone.status === 'In Progress'
                                ? 'bg-indigo-400'
                                : 'bg-zinc-400'
                            }`}
                          />
                          {milestone.status}
                        </span>
                      </td>

                      {/* Deliverables */}
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.deliverables.map((item, dIdx) => (
                            <span
                              key={dIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 text-muted-foreground hover:text-foreground text-xs font-medium transition-all duration-200 shrink-0 cursor-default"
                            >
                              <FileCode className="w-3 h-3 text-secondary" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
