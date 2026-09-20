import React, { useState } from 'react';
import { useSurveillanceStore, DEMO_USERS } from '../../store/surveillanceStore';
import { UserRole, Language } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  Stethoscope, 
  MapPin, 
  FlaskConical, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  Sparkles,
  Globe,
  Wifi,
  WifiOff,
  GitMerge,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthGateway: React.FC = () => {
  const { state, login, quickLogin, setLanguage, setIsOffline } = useSurveillanceStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [identifier, setIdentifier] = useState(DEMO_USERS.farmer.phoneOrEmail);
  const [password, setPassword] = useState(DEMO_USERS.farmer.pass);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(DEMO_USERS[role].phoneOrEmail);
    setPassword(DEMO_USERS[role].pass);
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    setTimeout(() => {
      const success = login(selectedRole, identifier, password);
      setIsAuthenticating(false);
      if (!success) {
        setError('Authentication failed. Please verify credentials or use 1-click Quick Login.');
      }
    }, 400);
  };

  const handleQuickAuth = (role: UserRole) => {
    setSelectedRole(role);
    setIsAuthenticating(true);
    setTimeout(() => {
      quickLogin(role);
      setIsAuthenticating(false);
    }, 300);
  };

  const rolesList: { 
    role: UserRole; 
    title: string; 
    subtitle: string; 
    icon: string; 
    desc: string; 
    badge: string;
    authName: string;
  }[] = [
    {
      role: 'farmer',
      title: t('farmer'),
      subtitle: 'Rural Livestock Owner Portal',
      icon: '👨‍🌾',
      desc: 'Report unusual symptoms, upload lesion photos, stream voice memos, receive proximity alerts and regional advisories.',
      badge: 'Livestock Owner',
      authName: 'Ramesh Patel (Farmer #9423)'
    },
    {
      role: 'vet',
      title: t('vet'),
      subtitle: 'Veterinary Command Center',
      icon: '👨‍⚕️',
      desc: 'Review AI-validated alerts, triage anomalies, dispatch field investigation missions, and authorize ring vaccination.',
      badge: 'Veterinary Officer',
      authName: 'Dr. A. Sharma (Chief Veterinary Officer)'
    },
    {
      role: 'field_worker',
      title: t('fieldWorker'),
      subtitle: 'Ground Operations & Inspection',
      icon: '👷',
      desc: 'Conduct on-site clinical investigations, audit herd vaccination records, collect swab specimens and dispatch to lab.',
      badge: 'Field Operations',
      authName: 'Pooja Patil (Field Inspector FW-04)'
    },
    {
      role: 'lab_staff',
      title: t('labStaff'),
      subtitle: 'Diagnostic Lab Portal (RDDL)',
      icon: '🧪',
      desc: 'Log inbound biological specimens, perform RT-PCR / ELISA molecular assays, and transmit certified test reports.',
      badge: 'Diagnostic Laboratory',
      authName: 'Dr. P. Rao (Senior Microbiologist)'
    },
    {
      role: 'flow_inspector',
      title: 'National Auditor',
      subtitle: '32-Step Master Closed Loop',
      icon: '🧭',
      desc: 'Inspect full 32-step epidemiological lifecycle, audit cross-district GIS risk layers, and monitor disease containment.',
      badge: 'Central Command',
      authName: 'Lead Evaluator (System Auditor)'
    }
  ];

  const currentRoleConfig = rolesList.find(r => r.role === selectedRole)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Gov Header & Universal Status */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">
                  Pashu-Suraksha AI
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                  National Portal v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Department of Animal Husbandry & Dairying (DAHD) • Ministry of Fisheries, Animal Husbandry & Dairying
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Simulation Switch */}
            <button
              onClick={() => setIsOffline(!state.isOffline)}
              className={`text-xs px-3 py-1 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                state.isOffline
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="Toggle Offline Simulation"
            >
              {state.isOffline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{state.isOffline ? t('offline') : t('online')}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  state.language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  state.language === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  state.language === 'mr' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-center space-y-8">
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control (RBAC) Enabled</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            National Livestock Disease Surveillance & Response Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your assigned governmental or field operations role to authenticate and enter your dedicated dashboard.
          </p>
        </div>

        {/* 5-Role Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {rolesList.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => handleRoleSelect(r.role)}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50 scale-[1.02]'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      {r.icon}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isSelected 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{r.title}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium mb-1.5">{r.subtitle}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className={`font-semibold text-[11px] ${isSelected ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500'}`}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAuth(r.role);
                    }}
                    className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border border-emerald-500/30"
                  >
                    ⚡ Quick Login
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Authentication Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Form (7 cols) */}
          <form onSubmit={handleLoginSubmit} className="md:col-span-7 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Portal Gate: {currentRoleConfig.title} ({currentRoleConfig.badge})
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Sign In to {currentRoleConfig.subtitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Role-based access will immediately open this authorized dashboard.
              </p>
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
                  {selectedRole === 'farmer' 
                    ? 'Registered Mobile Number' 
                    : selectedRole === 'vet' || selectedRole === 'lab_staff' 
                      ? 'Government Official Email ID' 
                      : 'Personnel / Worker ID'}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone, email or ID"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedRole === 'farmer' ? '4-Digit Security PIN' : 'Account Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PIN or password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authenticate & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleQuickAuth(selectedRole)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold py-3 px-4 rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>⚡ 1-Click Quick Enter</span>
              </button>
            </div>
          </form>

          {/* Right Summary Box (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Verified Credentials Card
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentRoleConfig.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{currentRoleConfig.authName}</h4>
                  <span className="text-[11px] text-emerald-400 font-semibold block">
                    Role: {currentRoleConfig.badge}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400 text-[11px]">System ID:</span>
                <span className="font-mono text-[11px] text-slate-200">{DEMO_USERS[selectedRole].id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400 text-[11px]">Assigned Duty:</span>
                <span className="text-slate-200 text-[11px]">{DEMO_USERS[selectedRole].location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 text-[11px]">Access Scope:</span>
                <span className="text-emerald-400 font-semibold text-[11px]">{currentRoleConfig.subtitle}</span>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Pre-configured for Smart India Hackathon. Clicking <b>1-Click Quick Enter</b> bypasses typing and directly loads the private portal.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Department of Animal Husbandry & Dairying (DAHD) • Ministry of Fisheries, Animal Husbandry & Dairying</span>
          <span className="text-[11px] text-slate-600">Smart India Hackathon • Role-Based Access Architecture</span>
        </div>
      </footer>
    </div>
  );
};
