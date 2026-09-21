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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl border shadow-sm shrink-0 ${
              caseItem.riskLevel === 'HIGH' 
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : caseItem.riskLevel === 'MEDIUM'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {caseItem.riskLevel === 'HIGH' ? '🚨' : caseItem.riskLevel === 'MEDIUM' ? '⚠️' : '📋'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{caseItem.id}</h3>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  caseItem.riskLevel === 'HIGH'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : caseItem.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {caseItem.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : caseItem.riskLevel === 'MEDIUM' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'} • Score {caseItem.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-500">
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
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 6-Stage Lifecycle Pipeline */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 overflow-x-auto gap-2">
            <span className="text-blue-700 font-bold flex items-center gap-1">✓ 1. Farmer Report</span>
            <span className="text-slate-300">→</span>
            <span className="text-blue-700 font-bold flex items-center gap-1">✓ 2. AI Validated</span>
            <span className="text-slate-300">→</span>
            <span className="text-blue-700 font-bold flex items-center gap-1">✓ 3. Risk Scored</span>
            <span className="text-slate-300">→</span>
            <span className={`${mission ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
              4. Field Inspection
            </span>
            <span className="text-slate-300">→</span>
            <span className={`${caseItem.labResult ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
              5. Lab Certified
            </span>
            <span className="text-slate-300">→</span>
            <span className={`${caseItem.status === 'INTERVENED' || caseItem.status === 'CONTAINED' ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
              6. Intervention
            </span>
          </div>

          {/* Grid: Herd Observation + AI Decision Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Herd Clinical Incident */}
            <div className="gov-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Primary Clinical Incident
              </h4>
              <div className="text-xs space-y-1.5 text-slate-700">
                <p><b>Species:</b> {caseItem.animalType}</p>
                <p><b>Total Herd Size:</b> {caseItem.totalAnimals} animals</p>
                <p><b>Morbidity / Mortality:</b> <span className="text-amber-700 font-bold">{caseItem.sickCount} Sick</span>, <span className="text-rose-700 font-bold">{caseItem.deadCount} Dead</span></p>
                <p><b>Geo-Coordinates:</b> {caseItem.coordinates.lat.toFixed(4)}° N, {caseItem.coordinates.lng.toFixed(4)}° E</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium mb-1">Reported Symptoms:</span>
                <div className="flex flex-wrap gap-1">
                  {caseItem.symptoms.map(s => (
                    <span key={s} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Decision Support Engine */}
            <div className="gov-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" /> AI Decision-Support Assessment
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Risk Score:</span>
                  <span className="font-bold text-rose-700">{caseItem.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Stratification:</span>
                  <span className="font-bold text-slate-900">{caseItem.riskLevel}</span>
                </div>
                {caseItem.clusterId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cluster Association:</span>
                    <span className="font-mono text-blue-700 font-bold">{caseItem.clusterId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Protocol Action:</span>
                  <span className="text-blue-700 font-semibold">{caseItem.recommendedAction}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-700">
                <span className="font-medium text-slate-500 block">Algorithmic Factors:</span>
                {caseItem.aiReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Support Disclaimer Notice */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <b>Decision-Support Notice:</b> This AI assessment is for early triage and spatial containment. Official confirmation and pathogen characterization are conducted exclusively by the attending Veterinary Officer and certified diagnostic laboratory testing.
            </span>
          </div>

          {/* Evidence Preview (Photograph & Voice Memo) */}
          {(displayPhoto || caseItem.voiceTranscript) && (
            <div className="gov-card space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Farmer Multi-Modal Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayPhoto && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Camera className="w-3.5 h-3.5 text-blue-600" /> Lesion Photo:
                    </span>
                    <img src={displayPhoto} alt="Clinical Lesion" className="h-32 w-full object-cover rounded-xl border border-slate-200" />
                  </div>
                )}

                {caseItem.voiceTranscript && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Mic className="w-3.5 h-3.5 text-blue-600" /> Voice Recording Transcript:
                    </span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic h-32 overflow-y-auto">
                      "{caseItem.voiceTranscript}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Field Investigation Details (if present) */}
          {mission?.investigationDetails && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" /> Ground Field Inspection Report ({mission.id})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                <div>Examined: <b>{mission.investigationDetails.examinedCount}</b></div>
                <div>Confirmed Sick: <b className="text-amber-800">{mission.investigationDetails.sickCount}</b></div>
                <div>Confirmed Dead: <b className="text-rose-800">{mission.investigationDetails.deadCount}</b></div>
                <div>Sample Dispatched: <b>{mission.investigationDetails.sampleTaken ? `Yes (${mission.investigationDetails.sampleId})` : 'No'}</b></div>
              </div>
              <p className="text-xs text-slate-700 pt-1">
                <b>Inspector Observations:</b> {mission.investigationDetails.fieldNotes}
              </p>
            </div>
          )}

          {/* Diagnostic Lab Test Certificate (if present) */}
          {caseItem.labResult && (
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-700" /> Certified Diagnostic Lab Certificate
                </h4>
                <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  {caseItem.labResult.result}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <p><b>Pathogen Isolated:</b> <span className="text-rose-700 font-bold">{caseItem.labResult.pathogenIdentified}</span></p>
                <p><b>Assay Type:</b> {caseItem.labResult.testType} {caseItem.labResult.cycleThreshold ? `(Cycle Threshold CT: ${caseItem.labResult.cycleThreshold})` : ''}</p>
                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-purple-100 text-[11px]">
                  <b>Technician Remarks:</b> {caseItem.labResult.remarks}
                </p>
                <p className="text-[10px] text-slate-500 pt-1">
                  Digitally Certified by: {caseItem.labResult.testedBy} on {caseItem.labResult.testedAt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-600 font-medium">
            Lifecycle Status: <b className="text-blue-700">{caseItem.status.replace('_', ' ')}</b>
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
