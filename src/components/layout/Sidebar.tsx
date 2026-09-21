import React from 'react';
import { UserRole } from '../../types/surveillance';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Map, 
  FileText, 
  Bell, 
  Syringe, 
  GitMerge, 
  Activity, 
  X
} from 'lucide-react';

export type ActiveNavSection = 
  | 'dashboard' 
  | 'gis' 
  | 'cases' 
  | 'alerts' 
  | 'vaccination' 
  | 'lifecycle' 
  | 'monitoring';

interface SidebarProps {
  currentSection: ActiveNavSection;
  onSelectSection: (section: ActiveNavSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}) => {
  const { state } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const roleLabels: Record<UserRole, { title: string; badge: string; icon: string }> = {
    farmer: { title: 'Livestock Owner', badge: 'Rural Producer', icon: '👨‍🌾' },
    vet: { title: 'Veterinary Officer', badge: 'Command Triage', icon: '👨‍⚕️' },
    field_worker: { title: 'Field Para-Vet', badge: 'Rapid Response', icon: '👷' },
    lab_staff: { title: 'Lab Microbiologist', badge: 'RDDL Division', icon: '🧪' },
    flow_inspector: { title: 'Central Auditor', badge: 'Surveillance QA', icon: '🧭' },
    admin: { title: 'System Admin', badge: 'National Oversight', icon: '🛡️' }
  };

  const currentRoleInfo = roleLabels[state.activeRole] || roleLabels.farmer;
  const highRiskCount = state.cases.filter(c => c.riskLevel === 'HIGH').length;
  const urgentAlertsCount = state.clusters.filter(c => c.status !== 'CONTAINED').length + highRiskCount;

  const navItems: Array<{
    id: ActiveNavSection;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: t('dashboard') || 'Command Center',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'gis',
      label: 'GIS Risk Map',
      icon: <Map className="w-4 h-4" />,
      badge: 'Live',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'cases',
      label: t('caseManagement') || 'Case Directory',
      icon: <FileText className="w-4 h-4" />,
      badge: state.cases.length,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: <Bell className="w-4 h-4" />,
      badge: urgentAlertsCount > 0 ? `${urgentAlertsCount} urgent` : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'vaccination',
      label: 'Vaccination Prophylaxis',
      icon: <Syringe className="w-4 h-4" />
    },
    {
      id: 'lifecycle',
      label: 'Response Lifecycle',
      icon: <GitMerge className="w-4 h-4" />,
      badge: '32-Step',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'monitoring',
      label: 'Outcome Monitoring',
      icon: <Activity className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Ministry / Platform Branding */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">
                Pashu-Suraksha AI
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase block">
                DAHD • Gov of India
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-xs">
            {currentRoleInfo.icon}
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-xs text-slate-900 truncate block">
              {state.currentUser?.name || currentRoleInfo.title}
            </span>
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block truncate">
              {currentRoleInfo.badge}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Surveillance Operations
          </div>

          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span>Platform Build</span>
            <span className="font-mono font-bold text-slate-700">v2.4.0 (SIH)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span>Database</span>
            <span className="text-blue-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> PostgreSQL
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
