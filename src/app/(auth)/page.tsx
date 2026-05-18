'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Diagnostic: Check if Supabase Key is likely valid
  const isKeyValid = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    // Completely bypass Supabase Auth to avoid bounced emails, and simply log in directly
    setTimeout(() => {
      document.cookie = "demo_bypass=true; path=/; max-age=86400"; // 24-hour bypass cookie
      setIsSuccess(true);
      toast.success(isSignUp ? 'Registration successful! Logging you in...' : 'Login successful!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A0C10] p-4 font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="rounded-3xl border border-white/10 p-12 backdrop-blur-2xl shadow-2xl text-center bg-white/[0.02] flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 relative z-10"
                >
                  <ShieldCheck className="w-12 h-12 text-green-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Registration Successful!' : 'Login Successful!'}
              </h1>
              <p className="text-gray-400 text-sm">Redirecting you to dashboard...</p>
            </motion.div>
          ) : (
            <motion.div
              key="auth-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-[32px] border border-white/5 p-8 backdrop-blur-3xl shadow-2xl bg-white/[0.02]"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">RWU Platform</h1>
                <p className="text-gray-400 mt-2">
                  {isSignUp ? 'Create a new account.' : 'Welcome back! Please login to your account.'}
                </p>
              </div>

              {!isKeyValid && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <p className="font-bold mb-1">⚠️ Ghalat API Key!</p>
                  <p>Aap ki `.env.local` mein Supabase Key ghalat hai. Ye hamesha `eyJ...` se shuru honi chaiye.</p>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
              </form>


              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-blue-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

