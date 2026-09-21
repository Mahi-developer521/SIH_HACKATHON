import React, { useState } from 'react';
import { Sidebar, ActiveNavSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { AuthGateway } from './components/auth/AuthGateway';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { VetDashboard } from './components/vet/VetDashboard';
import { FieldWorkerDashboard } from './components/field/FieldWorkerDashboard';
import { LabDashboard } from './components/lab/LabDashboard';
import { MasterFlowView } from './components/common/MasterFlowView';
import { GisMap } from './components/gis/GisMap';
import { OutcomeMonitoringView } from './components/monitoring/OutcomeMonitoringView';
import { CaseManagementView } from './components/cases/CaseManagementView';
import { AlertCenterView } from './components/alerts/AlertCenterView';
import { VaccinationModuleView } from './components/vaccination/VaccinationModuleView';
import { useSurveillanceStore } from './store/surveillanceStore';
import { I18nService } from './services/i18nService';
import { 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  ShieldCheck
} from 'lucide-react';

export function App() {
  const { state, syncOfflineOutbox, removeToast } = useSurveillanceStore();
  const [currentSection, setCurrentSection] = useState<ActiveNavSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  // If user is not authenticated, display the dedicated Role-Based Login Gateway
  if (!state.isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Left Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area Container (offset for fixed sidebar on lg+) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Universal Header */}
        <Header
          currentSection={currentSection}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        />

        {/* Global Offline Mode Status Banner (if offline) */}
        {state.isOffline && (
          <div className="bg-amber-950/80 border-b border-amber-600/60 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-4xl">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <b>{t('offline')}:</b> {t('offlineAlert')}
              </span>
            </div>
            {state.offlineOutbox.length > 0 && (
              <button
                onClick={() => syncOfflineOutbox()}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                {t('syncNow')} ({state.offlineOutbox.length})
              </button>
            )}
          </div>
        )}

        {/* Main Routed Content View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Section: Dashboard */}
          {currentSection === 'dashboard' && (
            <>
              {state.activeRole === 'farmer' && <FarmerDashboard />}
              {state.activeRole === 'vet' && <VetDashboard />}
              {state.activeRole === 'field_worker' && <FieldWorkerDashboard />}
              {state.activeRole === 'lab_staff' && <LabDashboard />}
              {(state.activeRole === 'flow_inspector' || state.activeRole === 'admin') && <MasterFlowView />}
            </>
          )}

          {/* Section: Dedicated GIS Risk Map */}
          {currentSection === 'gis' && (
            <div className="space-y-4">
              <GisMap />
            </div>
          )}

          {/* Section: Case Management */}
          {currentSection === 'cases' && (
            <CaseManagementView />
          )}

          {/* Section: Alert Center */}
          {currentSection === 'alerts' && (
            <AlertCenterView />
          )}

          {/* Section: Vaccination Surveillance */}
          {currentSection === 'vaccination' && (
            <VaccinationModuleView />
          )}

          {/* Section: 32-Step Master Response Lifecycle */}
          {currentSection === 'lifecycle' && (
            <MasterFlowView />
          )}

          {/* Section: Outcome Monitoring Loop */}
          {currentSection === 'monitoring' && (
            <OutcomeMonitoringView />
          )}
        </main>

        {/* Universal Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('brandTitle')} • Department of Animal Husbandry & Dairying</span>
            </div>
            <span className="text-[11px] text-slate-600">
              Smart India Hackathon • National Biosecurity Command System
            </span>
          </div>
        </footer>
      </div>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {state.toasts?.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl shadow-2xl text-xs backdrop-blur-md border transition-all ${
              toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-200 border-rose-700/80 shadow-rose-950/60'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-amber-200 border-amber-700/80 shadow-amber-950/60'
                : toast.type === 'info'
                ? 'bg-blue-950/95 text-blue-200 border-blue-700/80 shadow-blue-950/60'
                : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/80 shadow-emerald-950/60'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="flex-1">
              {toast.title && <p className="font-bold leading-tight">{toast.title}</p>}
              <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
