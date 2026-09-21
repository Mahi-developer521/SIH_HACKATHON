import React, { useState } from 'react';
import { UserRole, Language } from '../../types/surveillance';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { ActiveNavSection } from './Sidebar';
import { 
  Menu, 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
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
    home: {
      title: 'Home & Role Selection',
      subtitle: 'Choose your role and login to your dashboard'
    },
    dashboard: {
      title: t('commandCenter') || 'Main Dashboard',
      subtitle: 'Real-time overview of animal health reports and active tasks'
    },
    gis: {
      title: 'Disease Map & High-Risk Areas',
      subtitle: 'View active outbreak locations and 5km/10km safety rings'
    },
    cases: {
      title: t('caseManagement') || 'Reported Cases',
      subtitle: 'List of all sick animal reports submitted by farmers'
    },
    alerts: {
      title: 'Emergency Alerts',
      subtitle: 'Nearby disease warnings and village notifications'
    },
    vaccination: {
      title: 'Vaccine Tracking',
      subtitle: 'Monitor herd vaccinations and preventive doses given'
    },
    lifecycle: {
      title: '32-Step Response Workflow',
      subtitle: 'Step-by-step outbreak response and recovery guide'
    },
    monitoring: {
      title: 'Recovery Progress',
      subtitle: 'Track recovery progress and disease decline in affected areas'
    }
  };

  const currentInfo = sectionTitles[currentSection] || sectionTitles.dashboard;
  const highRiskAlerts = state.cases.filter(c => c.riskLevel === 'HIGH').length + state.clusters.filter(c => c.status !== 'CONTAINED').length;

  const rolesList: Array<{ role: UserRole; label: string; icon: string }> = [
    { role: 'farmer', label: 'Farmer', icon: '👨‍🌾' },
    { role: 'vet', label: 'Veterinary Doctor', icon: '👨‍⚕️' },
    { role: 'field_worker', label: 'Field Worker', icon: '👷' },
    { role: 'lab_staff', label: 'Lab Staff', icon: '🧪' },
    { role: 'admin', label: 'System Admin', icon: '🛡️' }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                {currentInfo.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Outbreak Status + Network + Language + Notifications + Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Outbreak Status Badge */}
          <div className="hidden md:flex items-center">
            {state.containmentStatus === 'ACTIVE_OUTBREAK' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Outbreak Active (CL-001)</span>
              </span>
            )}
            {state.containmentStatus === 'CONTROLLED' && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <Radio className="w-3 h-3 text-amber-600" />
                <span>Under Containment</span>
              </span>
            )}
            {state.containmentStatus === 'CONTAINED' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Epidemic Contained</span>
              </span>
            )}
          </div>

          {/* Network State Toggle */}
          <button
            onClick={() => setIsOffline(!state.isOffline)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-colors ${
              state.isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
            title={state.isOffline ? 'Offline Mode (Click to simulate online)' : 'Online Mode (Click to simulate offline)'}
          >
            {state.isOffline ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Online</span>
              </>
            )}
          </button>

          {/* Offline Outbox Sync Pill */}
          {state.offlineOutbox.length > 0 && (
            <button
              onClick={() => syncOfflineOutbox()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded-xl text-[11px] transition-colors flex items-center gap-1 shadow-sm"
              title="Sync pending reports stored locally"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync ({state.offlineOutbox.length})</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                lang === 'te' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                lang === 'hi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Surveillance Notifications"
          >
            <Bell className="w-4 h-4" />
            {highRiskAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                {highRiskAlerts}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg p-1 z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
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
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
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
            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Sign Out</h3>
                <p className="text-xs text-slate-500">Return to the role-based login gateway?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
