import React, { useState } from 'react';
import { useSurveillanceStore, DEMO_USERS } from '../../store/surveillanceStore';
import { UserRole, Language } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Globe,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Building2,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthGateway: React.FC = () => {
  const { state, login, quickLogin, setLanguage, setIsOffline } = useSurveillanceStore();

  const [identifier, setIdentifier] = useState('farmer@example.com');
  const [password, setPassword] = useState('farmer123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    try {
      const success = await login(identifier, password);
      if (!success) {
        setError(t('loginFailed') || 'Invalid credentials. Please verify your email/ID and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials or connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickFill = (roleKey: string) => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setIdentifier(demo.email);
      setPassword(demo.pass);
      setError('');
    }
  };

  const handle1ClickLogin = async (roleKey: string) => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setIdentifier(demo.email);
      setPassword(demo.pass);
      setIsAuthenticating(true);
      setError('');
      try {
        await login(demo.email, demo.pass);
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const demoAccounts = [
    { key: 'farmer', label: t('farmer'), email: 'farmer@example.com', pass: 'farmer123', icon: '👨‍🌾', badge: 'Rural Owner' },
    { key: 'vet', label: t('vet'), email: 'vet@example.com', pass: 'vet123', icon: '👨‍⚕️', badge: 'Chief Vet' },
    { key: 'field_worker', label: t('fieldWorker'), email: 'fieldworker@example.com', pass: 'field123', icon: '👷', badge: 'Para-Vet' },
    { key: 'lab_staff', label: t('labStaff'), email: 'lab@example.com', pass: 'lab123', icon: '🧪', badge: 'RDDL Lab' },
    { key: 'admin', label: t('admin'), email: 'admin@example.com', pass: 'admin123', icon: '🧭', badge: 'Auditor' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">
                  {t('brandTitle')}
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                  National Portal v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t('ministryTitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Simulation Switch */}
            <button
              onClick={() => setIsOffline(!state.isOffline)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                state.isOffline
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="Toggle Offline Simulation"
            >
              {state.isOffline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{state.isOffline ? t('offline') : t('online')}</span>
            </button>

            {/* Language Selector: English | తెలుగు | हिंदी */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  state.language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  state.language === 'te' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  state.language === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center space-y-6">
        {/* Banner Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart India Hackathon 2026 • Government RBAC Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {t('loginInstructions')}
          </p>
        </div>

        {/* Central Sign-in Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secure Authentication Gateway
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                {t('loginSubtitle')}
              </h2>
            </div>

            {error && (
              <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('emailOrUsername')}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. farmer@example.com or vet@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="gov-label">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="gov-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('authenticating')}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t('signIn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SIH Jury Demo Accounts Quick-Access Ribbon */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> SIH Evaluation Demo Credentials:
              </span>
              <span className="text-[10px] text-slate-500">1-Click fills & authenticates via PostgreSQL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.key}
                  type="button"
                  onClick={() => handle1ClickLogin(acc.key)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{acc.icon}</span>
                    <span className="text-[9px] bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      {acc.badge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-emerald-300">{acc.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('ministryTitle')}</span>
          <span className="text-[11px] text-slate-600">Smart India Hackathon 2026 • Real Role-Based Access Control</span>
        </div>
      </footer>
    </div>
  );
};
