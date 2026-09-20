import React from 'react';
import { CaseReport } from '../../types/surveillance';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  ClipboardCheck, 
  FlaskConical, 
  Syringe, 
  User, 
  FileText,
  Activity,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseReport;
  onAssignMission?: () => void;
}

export const CaseDetailModal: React.FC<Props> = ({ isOpen, onClose, caseItem, onAssignMission }) => {
  const { state } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  if (!isOpen) return null;

  const mission = state.missions.find(m => m.id === caseItem.missionId || m.caseId === caseItem.id);
  const sample = state.samples.find(s => s.id === caseItem.sampleId || s.caseId === caseItem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              caseItem.riskLevel === 'HIGH' 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {caseItem.riskLevel === 'HIGH' ? '🚨' : '📋'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{caseItem.id}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                  caseItem.riskLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  Score {caseItem.riskScore}/100 • {caseItem.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted by {caseItem.farmerName} • {caseItem.village} ({caseItem.submittedAt})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Top Lifecycle Pipeline */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 1. Farmer Report</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 2. Validation Clean</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 3. AI Risk Score</span>
            <span>→</span>
            <span className={`${mission ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              4. Field Inspection
            </span>
            <span>→</span>
            <span className={`${caseItem.labResult ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              5. Lab Confirmation
            </span>
            <span>→</span>
            <span className={`${caseItem.status === 'INTERVENED' || caseItem.status === 'CONTAINED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              6. Intervention
            </span>
          </div>

          {/* Grid: Herd & Symptoms + AI Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Herd Observation */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Primary Herd Incident
              </h4>
              <div className="text-xs space-y-1 text-slate-200">
                <p><b>Species:</b> {caseItem.animalType}</p>
                <p><b>Herd Size:</b> {caseItem.totalAnimals} total animals</p>
                <p><b>Morbidity / Mortality:</b> <span className="text-amber-400 font-bold">{caseItem.sickCount} Sick</span>, <span className="text-rose-400 font-bold">{caseItem.deadCount} Dead</span></p>
                <p><b>Coordinates:</b> {caseItem.coordinates.lat.toFixed(4)}° N, {caseItem.coordinates.lng.toFixed(4)}° E</p>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Reported Symptoms:</span>
                <div className="flex flex-wrap gap-1">
                  {caseItem.symptoms.map(s => (
                    <span key={s} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Risk Engine Factors */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" /> Explainable AI Decision Engine
              </h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-bold text-rose-400">{caseItem.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Stratification:</span>
                  <span className="font-bold text-white">{caseItem.riskLevel}</span>
                </div>
                {caseItem.clusterId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Associated Cluster:</span>
                    <span className="font-mono text-emerald-400 font-bold">{caseItem.clusterId}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900 space-y-1 text-[11px] text-slate-300">
                <span className="font-semibold text-slate-400 block">Algorithmic Factors:</span>
                {caseItem.aiReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-purple-400">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Field Investigation Details (if present) */}
          {mission?.investigationDetails && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-800/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" /> Ground Field Inspection Report ({mission.id})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-200">
                <div>Examined: <b>{mission.investigationDetails.examinedCount}</b></div>
                <div>Confirmed Sick: <b className="text-amber-400">{mission.investigationDetails.sickCount}</b></div>
                <div>Confirmed Dead: <b className="text-rose-400">{mission.investigationDetails.deadCount}</b></div>
                <div>Sample Dispatched: <b>{mission.investigationDetails.sampleTaken ? `Yes (${mission.investigationDetails.sampleId})` : 'No'}</b></div>
              </div>
              <p className="text-xs text-slate-300 pt-1">
                <b>Inspector Observations:</b> {mission.investigationDetails.fieldNotes}
              </p>
            </div>
          )}

          {/* Diagnostic Lab Test Certificate (if present) */}
          {caseItem.labResult && (
            <div className="bg-purple-950/30 p-4 rounded-2xl border border-purple-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" /> Certified Diagnostic Lab Certificate
                </h4>
                <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded">
                  {caseItem.labResult.result}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-200">
                <p><b>Pathogen Isolated:</b> <span className="text-rose-400 font-bold">{caseItem.labResult.pathogenIdentified}</span></p>
                <p><b>Assay Type:</b> {caseItem.labResult.testType} {caseItem.labResult.cycleThreshold ? `(Cycle Threshold CT: ${caseItem.labResult.cycleThreshold})` : ''}</p>
                <p className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 text-[11px]">
                  <b>Technician Remarks:</b> {caseItem.labResult.remarks}
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Digitally Certified by: {caseItem.labResult.testedBy} on {caseItem.labResult.testedAt}
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Lifecycle Status: <b className="text-emerald-400">{caseItem.status.replace('_', ' ')}</b>
            </span>

            <div className="flex items-center gap-2">
              {!mission && onAssignMission && (
                <button
                  onClick={() => {
                    onClose();
                    onAssignMission();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Send className="w-3.5 h-3.5" /> Assign Field Worker Mission
                </button>
              )}

              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
