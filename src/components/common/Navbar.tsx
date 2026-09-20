import React from 'react';
import { UserRole, Language } from '../../types/surveillance';
import { useSurveillanceStore, DEMO_USERS } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  Stethoscope, 
  MapPin, 
  FlaskConical, 
  GitMerge, 
  RotateCcw, 
  AlertTriangle, 
  Radio, 
  Layers,
  Globe,
  Wifi,
  WifiOff,
  LogOut,
  RefreshCw,
  User,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    state, 
    setActiveRole, 
    setLanguage, 
    setIsOffline, 
    syncOfflineOutbox, 
    simulateOutcomeProgression, 
    logout 
  } = useSurveillanceStore();

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);
  const currentUser = state.currentUser || DEMO_USERS[state.activeRole];

  const roleMeta: Record<UserRole, { title: string; icon: string; badge: string; color: string }> = {
    farmer: {
      title: 'Farmer Livestock Portal',
      icon: '👨‍🌾',
      badge: 'Livestock Owner',
      color: 'emerald'
    },
    vet: {
      title: 'Veterinary Command Center',
      icon: '👨‍⚕️',
      badge: 'Veterinary Officer',
      color: 'blue'
    },
    field_worker: {
      title: 'Field Investigation Operations',
      icon: '👷',
      badge: 'Field Para-Vet',
      color: 'amber'
    },
    lab_staff: {
      title: 'Diagnostic Laboratory (RDDL)',
      icon: '🧪',
      badge: 'Lab Microbiologist',
      color: 'purple'
    },
    flow_inspector: {
      title: 'National Surveillance Auditor',
      icon: '🧭',
      badge: 'Central Auditor',
      color: 'teal'
    }
  };

  const currentMeta = roleMeta[state.activeRole] || roleMeta.farmer;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      {/* Top Notification & Utility Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/30 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 hidden sm:inline">{t('nationalSystem')}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          
          {/* Outbreak Status Indicator */}
          <div className="flex items-center gap-1.5">
            {state.containmentStatus === 'ACTIVE_OUTBREAK' && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[10px]">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> {t('activeOutbreak')} (Cluster CL-001)
              </span>
            )}
            {state.containmentStatus === 'CONTROLLED' && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[10px]">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> {t('controlled')}
              </span>
            )}
            {state.containmentStatus === 'CONTAINED' && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[10px]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> {t('contained')}
              </span>
            )}
          </div>
        </div>

        {/* Right Utilities: Network Switch, Outbox, Language, Advance Loop */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network State Simulation Button */}
          <button
            onClick={() => setIsOffline(!state.isOffline)}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
              state.isOffline 
                ? 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Network Connectivity Simulation"
          >
            {state.isOffline ? <WifiOff className="w-3 h-3 text-rose-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span>{state.isOffline ? 'OFFLINE SIM' : 'ONLINE'}</span>
          </button>

          {/* Local Outbox Counter & Sync Action */}
          {state.offlineOutbox.length > 0 && (
            <button
              onClick={() => syncOfflineOutbox()}
              className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm shadow-amber-600/40 animate-bounce"
              title="Click to sync queued offline reports"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{state.offlineOutbox.length} {t('outboxCount')}</span>
            </button>
          )}

          {/* Multilingual Selector */}
          <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <Globe className="w-3 h-3 text-slate-400 ml-1 mr-0.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                state.language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                state.language === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                state.language === 'mr' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>

          <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

          {/* Quick Simulation Stepper for Evaluators */}
          <button
            onClick={() => simulateOutcomeProgression()}
            className="bg-emerald-700/60 hover:bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-emerald-600/40"
            title="Advance containment progression loop"
          >
            <Layers className="w-3 h-3" /> <span>Advance Loop</span>
          </button>
        </div>
      </div>

      {/* Main Bar: Brand + Authenticated Role Access Scope + Logout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {t('brandTitle')}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/30 hidden sm:inline">
                  Gov Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                DAHD • {currentMeta.title}
              </p>
            </div>
          </div>

          {/* Center / Right: Authenticated User Identity Badge (Strict RBAC) */}
          <div className="flex items-center gap-3">
            {/* Authenticated Identity Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-base">
                {currentMeta.icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                    {currentMeta.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[160px] sm:max-w-none">
                  📍 {currentUser.location}
                </p>
              </div>
            </div>

            {/* Central Auditor Role Toggles (Only visible when logged in as Central Auditor) */}
            {state.activeRole === 'flow_inspector' && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveRole('flow_inspector')}
                  className="px-2 py-1 rounded bg-teal-600 text-white font-bold"
                >
                  32-Step Master Flow
                </button>
              </div>
            )}

            {/* Sign Out / Switch Role Button */}
            <button
              onClick={() => logout()}
              className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Sign out of current role and return to Role Selection Gateway"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out / Switch Role</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
