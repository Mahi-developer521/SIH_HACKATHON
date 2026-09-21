import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { AuthGateway } from './components/auth/AuthGateway';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { VetDashboard } from './components/vet/VetDashboard';
import { FieldWorkerDashboard } from './components/field/FieldWorkerDashboard';
import { LabDashboard } from './components/lab/LabDashboard';
import { MasterFlowView } from './components/common/MasterFlowView';
import { GisMap } from './components/gis/GisMap';
import { OutcomeMonitoringView } from './components/monitoring/OutcomeMonitoringView';
import { useSurveillanceStore } from './store/surveillanceStore';
import { I18nService } from './services/i18nService';
import { 
  Map, 
  Activity, 
  ShieldCheck, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

export function App() {
  const { state, syncOfflineOutbox, removeToast } = useSurveillanceStore();
  const [showGlobalGis, setShowGlobalGis] = useState(false);
  const [showOutcomeLoop, setShowOutcomeLoop] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  // If user is not authenticated, display the dedicated Role-Based Login Gateway
  if (!state.isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <Navbar />

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

      {/* Main Role Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Role Dashboard */}
        {state.activeRole === 'farmer' && <FarmerDashboard />}
        {state.activeRole === 'vet' && <VetDashboard />}
        {state.activeRole === 'field_worker' && <FieldWorkerDashboard />}
        {state.activeRole === 'lab_staff' && <LabDashboard />}
        {(state.activeRole === 'flow_inspector' || state.activeRole === 'admin') && <MasterFlowView />}

        {/* Global Quick-Action Drawer Toggles for Judges / Presenters */}
        {state.activeRole !== 'flow_inspector' && state.activeRole !== 'admin' && (
          <div className="pt-4 border-t border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cross-Platform Real-Time Systems:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGlobalGis(!showGlobalGis)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    showGlobalGis 
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  {showGlobalGis ? 'Hide GIS Live Map' : 'Expand GIS Live Map'}
                </button>

                <button
                  onClick={() => setShowOutcomeLoop(!showOutcomeLoop)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    showOutcomeLoop 
                      ? 'bg-teal-600/20 text-teal-300 border-teal-500' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  {showOutcomeLoop ? 'Hide Outcome Loop' : 'Expand Outcome Monitoring Loop'}
                </button>
              </div>
            </div>

            {/* Collapsible Global GIS Map */}
            {showGlobalGis && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Map className="w-4 h-4 text-cyan-400" /> Integrated District GIS Risk Map
                </h3>
                <GisMap />
              </div>
            )}

            {/* Collapsible Global Outcome Monitoring Loop */}
            {showOutcomeLoop && (
              <OutcomeMonitoringView />
            )}
          </div>
        )}
      </main>

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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('brandTitle')} • {t('nationalSystem')}</span>
          </div>
          <span className="text-[11px] text-slate-600">
            Smart India Hackathon • Multilingual & Offline PWA Ready
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
