import React, { useState } from 'react';
import { UserRole, Language } from '../../types/surveillance';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { ActiveNavSection } from './Sidebar';
import { 
  Menu, 
  Bell, 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  User, 
  ChevronDown,
  X
} from 'lucide-react';

interface HeaderProps {
  currentSection: ActiveNavSection;
  onOpenMobileSidebar: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenMobileSidebar,
  onOpenNotifications
}) => {
  const { 
    state, 
    setActiveRole, 
    setLanguage, 
    setIsOffline, 
    syncOfflineOutbox, 
    logout 
  } = useSurveillanceStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const sectionTitles: Record<ActiveNavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: t('commandCenter') || 'Livestock Health Command Center',
      subtitle: 'Real-time epidemiological dashboard and triage'
    },
    gis: {
      title: 'District GIS Risk Map',
      subtitle: 'Geospatial risk buffers, cluster hotspots, and village surveillance'
    },
    cases: {
      title: t('caseManagement') || 'Epidemiological Case Directory',
      subtitle: 'District-wide clinical case database and field response dispatch'
    },
    alerts: {
      title: 'Epidemic Alert Center',
      subtitle: 'Real-time early warning triggers and high-morbidity alerts'
    },
    vaccination: {
      title: 'District Vaccination Surveillance',
      subtitle: 'Prophylaxis coverage, herd immunity gap tracking, and schedules'
    },
    lifecycle: {
      title: '32-Step Master Response Lifecycle',
      subtitle: 'Closed-loop national surveillance and outbreak containment protocol'
    },
    monitoring: {
      title: 'Outcome Monitoring & Audit',
      subtitle: 'Post-intervention decline curves and epidemiological validation'
    }
  };

  const currentInfo = sectionTitles[currentSection] || sectionTitles.dashboard;
  const highRiskAlerts = state.cases.filter(c => c.riskLevel === 'HIGH').length + state.clusters.filter(c => c.status !== 'CONTAINED').length;

  const rolesList: Array<{ role: UserRole; label: string; icon: string }> = [
    { role: 'farmer', label: t('farmer') || 'Farmer', icon: '👨‍🌾' },
    { role: 'vet', label: t('vet') || 'Veterinary Officer', icon: '👨‍⚕️' },
    { role: 'field_worker', label: t('fieldWorker') || 'Field Para-Vet', icon: '👷' },
    { role: 'lab_staff', label: t('labStaff') || 'Lab Microbiologist', icon: '🧪' },
    { role: 'admin', label: t('admin') || 'Central Auditor', icon: '🛡️' }
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-800 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                {currentInfo.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Outbreak Status + Network + Language + Notifications + Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Outbreak Status Badge */}
          <div className="hidden md:flex items-center">
            {state.containmentStatus === 'ACTIVE_OUTBREAK' && (
              <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>Outbreak Active (CL-001)</span>
              </span>
            )}
            {state.containmentStatus === 'CONTROLLED' && (
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Under Containment</span>
              </span>
            )}
            {state.containmentStatus === 'CONTAINED' && (
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Epidemic Contained</span>
              </span>
            )}
          </div>

          {/* Network State Simulator */}
          <button
            onClick={() => setIsOffline(!state.isOffline)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
              state.isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}
            title={state.isOffline ? 'Offline Mode (Click to simulate online)' : 'Online Mode (Click to simulate offline)'}
          >
            {state.isOffline ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online</span>
              </>
            )}
          </button>

          {/* Offline Outbox Sync Pill */}
          {state.offlineOutbox.length > 0 && (
            <button
              onClick={() => syncOfflineOutbox()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1"
              title="Sync pending reports stored locally"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync ({state.offlineOutbox.length})</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                lang === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                lang === 'te' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                lang === 'hi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            title="Surveillance Notifications"
          >
            <Bell className="w-4 h-4" />
            {highRiskAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-slate-950">
                {highRiskAlerts}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown (Evaluation / Demo Mode) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
            >
              <span className="text-xs">
                {state.activeRole === 'farmer' && '👨‍🌾 Farmer'}
                {state.activeRole === 'vet' && '👨‍⚕️ Vet'}
                {state.activeRole === 'field_worker' && '👷 Field'}
                {state.activeRole === 'lab_staff' && '🧪 Lab'}
                {(state.activeRole === 'admin' || state.activeRole === 'flow_inspector') && '🛡️ Admin'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  Switch Surveillance Role
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setActiveRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      state.activeRole === r.role
                        ? 'bg-emerald-600/20 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Sign Out</h3>
                <p className="text-xs text-slate-400">Return to the role-based login gateway?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
