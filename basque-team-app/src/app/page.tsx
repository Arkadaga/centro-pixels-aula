'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, User, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Email edo pasahitz okerra. Saiatu berriro.');
    }
  };

  const handleQuickAccess = (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    const success = login(quickEmail, quickPassword);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1D3A] via-[#122B52] to-[#0B1D3A] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/5 rounded-full translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BT</span>
            </div>
            <div>
              <div className="font-bold text-lg tracking-wide">BASQUE TEAM</div>
              <div className="text-sm text-white/60">Kirolari Gunea</div>
            </div>
          </div>

          {/* Hero text */}
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Euskadiko kirolarien
            <br />
            plataforma digitala
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Zure kirol ibilbidea kudeatzeko tresna bakarra. Entrenamendua,
            osasuna eta garapen profesionala leku bakarrean.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8">
          <div>
            <div className="text-3xl font-bold">80+</div>
            <div className="text-sm text-white/60">Kirolari bekadunak</div>
          </div>
          <div>
            <div className="text-3xl font-bold">20+</div>
            <div className="text-sm text-white/60">Kirol diziplina</div>
          </div>
          <div>
            <div className="text-3xl font-bold">2007</div>
            <div className="text-sm text-white/60">Sortze urtea</div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">BT</span>
          </div>
          <div>
            <div className="font-bold text-lg tracking-wide text-gray-900">
              BASQUE TEAM
            </div>
            <div className="text-xs text-gray-500">Kirolari Gunea</div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ongi etorri
          </h2>
          <p className="text-gray-500 mb-8">
            Sartu zure kredentzialak plataformara sartzeko
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Helbide elektronikoa
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zure@emaila.eus"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Pasahitza
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Zure pasahitza"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              Sartu
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-10">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-4">
              Sarbide azkarra (demo)
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() =>
                  handleQuickAccess('admin@basqueteam.eus', 'admin123')
                }
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-colors group"
              >
                <Shield className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-red-600 transition-colors">
                  Zuzendaritza
                </span>
              </button>
              <button
                onClick={() =>
                  handleQuickAccess('ane@basqueteam.eus', 'demo')
                }
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-colors group"
              >
                <User className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-red-600 transition-colors">
                  Kirolaria
                </span>
              </button>
              <button
                onClick={() =>
                  handleQuickAccess('mediku@basqueteam.eus', 'demo')
                }
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-colors group"
              >
                <Activity className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-red-600 transition-colors">
                  Mediku taldea
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
