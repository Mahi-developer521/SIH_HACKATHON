import React from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Radio, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const OutcomeMonitoringView: React.FC = () => {
  const { state, simulateOutcomeProgression } = useSurveillanceStore();

  const cluster = state.clusters[0];
  const isContained = state.containmentStatus === 'CONTAINED';
  const isControlled = state.containmentStatus === 'CONTROLLED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-200">
                Continuous AI + GIS Feedback Loop (Steps 28, 29, 30)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Post-Intervention Outcome Monitoring & Containment</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Tracks the ongoing impact of ring vaccination, movement restriction, and farmer advisories. The AI engine continuously recalculates risk velocity, updating GIS zones in real time.
            </p>
          </div>

          <button
            onClick={() => simulateOutcomeProgression()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Advance AI Recalculation Loop
          </button>
        </div>
      </div>

      {/* Before vs After Progression Comparison (Section 28) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Peak Outbreak */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Stage 1: Pre-Intervention Peak
            </span>
            <span className="text-xs font-mono font-bold text-rose-600">Day 1 - 4</span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-rose-600">21 Cases • 2 Deaths</div>
            <p className="text-xs text-slate-600">Multi-village cluster across Rampur, Kalyanpur, Shivpuri.</p>
          </div>

          <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-700">
              <span>Risk Score:</span>
              <b className="text-rose-700">86/100 (HIGH)</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>GIS Zone:</span>
              <b className="text-rose-700">🔴 Active Red Zone (6.5 km)</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Proximity Alerts:</span>
              <b className="text-rose-700">Targeted SMS/Voice to 5 Herds</b>
            </div>
          </div>
        </div>

        {/* Stage 2: Post-Intervention Response */}
        <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${
          isControlled || isContained ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Stage 2: Ring Vaccination Active
            </span>
            <span className="text-xs font-mono font-bold text-amber-700">Day 5 - 8</span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-amber-700">12 Cases • 1 Death</div>
            <p className="text-xs text-slate-600">Ring vaccination deployed; 65% drop in transmission velocity.</p>
          </div>

          <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-700">
              <span>Risk Score:</span>
              <b className="text-amber-800">42/100 (MEDIUM)</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>GIS Zone:</span>
              <b className="text-amber-800">🟠 Surveillance Amber Zone</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Containment Status:</span>
              <b className="text-amber-800">CONTROLLED</b>
            </div>
          </div>
        </div>

        {/* Stage 3: Outbreak Fully Contained */}
        <div className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${
          isContained ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Stage 3: Outbreak Contained
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700">Day 9+</span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-700">3 Cases • 0 Deaths</div>
            <p className="text-xs text-slate-600">Herd immunity reaches 92%; zero viral replication detected.</p>
          </div>

          <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-700">
              <span>Risk Score:</span>
              <b className="text-emerald-800">18/100 (LOW)</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>GIS Zone:</span>
              <b className="text-emerald-800">🟢 All Green (Baseline Passive)</b>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Containment Status:</span>
              <b className="text-emerald-800">CONTAINED</b>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Epidemiological System Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Continuous Surveillance Telemetry & Audit Stream
          </span>
          <span className="text-xs text-slate-500 font-mono">Real-time DB Sync</span>
        </h4>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-56 overflow-y-auto space-y-2 font-mono text-xs text-slate-700">
          {state.systemLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 border-b border-slate-200 pb-1.5 last:border-0">
              <span className="text-blue-600 font-bold shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-slate-700">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
