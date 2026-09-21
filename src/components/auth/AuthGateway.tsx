import React, { useState } from 'react';
import { useSurveillanceStore, DEMO_USERS } from '../../store/surveillanceStore';
import { UserRole, Language } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Globe, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  KeyRound, 
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  {t('brandTitle')}
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                  National Portal v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t('ministryTitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Simulation Switch */}
            <button
              onClick={() => setIsOffline(!state.isOffline)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors flex items-center gap-1.5 ${
                state.isOffline
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Offline Simulation"
            >
              {state.isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{state.isOffline ? t('offline') : t('online')}</span>
            </button>

            {/* Language Selector: English | తెలుగు | हिंदी */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'te' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'hi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <span>Smart India Hackathon 2026 • Government RBAC Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {t('loginInstructions')}
          </p>
        </div>

        {/* Central Sign-in Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secure Authentication Gateway
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {t('loginSubtitle')}
              </h2>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('emailOrUsername')}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. farmer@example.com or vet@example.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
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
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" /> SIH Evaluation Demo Credentials:
              </span>
              <span className="text-[10px] text-slate-400">1-Click fills & authenticates via PostgreSQL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.key}
                  type="button"
                  onClick={() => handle1ClickLogin(acc.key)}
                  className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-colors group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{acc.icon}</span>
                    <span className="text-[9px] bg-white text-slate-600 group-hover:text-blue-700 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                      {acc.badge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700">{acc.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('ministryTitle')}</span>
          <span className="text-[11px] text-slate-400">Smart India Hackathon 2026 • Real Role-Based Access Control</span>
        </div>
      </footer>
    </div>
  );
};
