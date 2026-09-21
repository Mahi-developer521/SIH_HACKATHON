import React from 'react';
import { CaseReport } from '../../types/surveillance';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { VoiceAlertButton } from './VoiceAlertButton';
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
  Send,
  Camera,
  Mic,
  Info
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

  const displayPhoto = caseItem.imageUrl || caseItem.photoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-inner shrink-0 ${
              caseItem.riskLevel === 'HIGH' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : caseItem.riskLevel === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              {caseItem.riskLevel === 'HIGH' ? '🚨' : caseItem.riskLevel === 'MEDIUM' ? '⚠️' : '📋'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{caseItem.id}</h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  caseItem.riskLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : caseItem.riskLevel === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {caseItem.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : caseItem.riskLevel === 'MEDIUM' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'} • Score {caseItem.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted by {caseItem.farmerName} • {caseItem.village} ({caseItem.submittedAt})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Spoken Voice Readout of Dossier Findings */}
            <VoiceAlertButton
              textTe={`కేసు వివరాలు: ${caseItem.id}. జాతి: ${caseItem.animalType}. మొత్తం పశువులు: ${caseItem.totalAnimals}, అనారోగ్యంతో ఉన్నవి: ${caseItem.sickCount}, మరణించినవి: ${caseItem.deadCount}. AI ప్రమాద స్కోరు 100 కి ${caseItem.riskScore}. సిఫార్సు చేయబడిన చర్య: ${caseItem.recommendedAction}.`}
              textEn={`Case dossier ${caseItem.id}. Species: ${caseItem.animalType}. Total herd: ${caseItem.totalAnimals}, sick: ${caseItem.sickCount}, dead: ${caseItem.deadCount}. AI risk score is ${caseItem.riskScore}. Recommended action: ${caseItem.recommendedAction}.`}
              size="xs"
              variant={caseItem.riskLevel === 'HIGH' ? 'danger' : 'emerald'}
            />

            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 6-Stage Lifecycle Pipeline */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 1. Farmer Report</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 2. AI Validated</span>
            <span>→</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ 3. Risk Scored</span>
            <span>→</span>
            <span className={`${mission ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              4. Field Inspection
            </span>
            <span>→</span>
            <span className={`${caseItem.labResult ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              5. Lab Certified
            </span>
            <span>→</span>
            <span className={`${caseItem.status === 'INTERVENED' || caseItem.status === 'CONTAINED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              6. Intervention
            </span>
          </div>

          {/* Grid: Herd Observation + AI Decision Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Herd Clinical Incident */}
            <div className="gov-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Primary Clinical Incident
              </h4>
              <div className="text-xs space-y-1.5 text-slate-200">
                <p><b>Species:</b> {caseItem.animalType}</p>
                <p><b>Total Herd Size:</b> {caseItem.totalAnimals} animals</p>
                <p><b>Morbidity / Mortality:</b> <span className="text-amber-400 font-bold">{caseItem.sickCount} Sick</span>, <span className="text-rose-400 font-bold">{caseItem.deadCount} Dead</span></p>
                <p><b>Geo-Coordinates:</b> {caseItem.coordinates.lat.toFixed(4)}° N, {caseItem.coordinates.lng.toFixed(4)}° E</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Reported Symptoms:</span>
                <div className="flex flex-wrap gap-1">
                  {caseItem.symptoms.map(s => (
                    <span key={s} className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Decision Support Engine */}
            <div className="gov-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" /> AI Decision-Support Assessment
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculated Risk Score:</span>
                  <span className="font-bold text-rose-400">{caseItem.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Stratification:</span>
                  <span className="font-bold text-white">{caseItem.riskLevel}</span>
                </div>
                {caseItem.clusterId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cluster Association:</span>
                    <span className="font-mono text-emerald-400 font-bold">{caseItem.clusterId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol Action:</span>
                  <span className="text-emerald-300 font-semibold">{caseItem.recommendedAction}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
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

          {/* Decision Support Disclaimer Notice */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <b>Decision-Support Notice:</b> This AI assessment is for early triage and spatial containment. Official confirmation and pathogen characterization are conducted exclusively by the attending Veterinary Officer and certified diagnostic laboratory testing.
            </span>
          </div>

          {/* Evidence Preview (Photograph & Voice Memo) */}
          {(displayPhoto || caseItem.voiceTranscript) && (
            <div className="gov-card space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Farmer Multi-Modal Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayPhoto && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" /> Lesion Photo:
                    </span>
                    <img src={displayPhoto} alt="Clinical Lesion" className="h-32 w-full object-cover rounded-xl border border-slate-800" />
                  </div>
                )}

                {caseItem.voiceTranscript && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice Recording Transcript:
                    </span>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 italic h-32 overflow-y-auto">
                      "{caseItem.voiceTranscript}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <p className="text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-800 text-[11px]">
                  <b>Technician Remarks:</b> {caseItem.labResult.remarks}
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Digitally Certified by: {caseItem.labResult.testedBy} on {caseItem.labResult.testedAt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
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
                className="gov-btn-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" /> Assign Field Worker Mission
              </button>
            )}

            <button
              onClick={onClose}
              className="gov-btn-secondary text-xs"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
