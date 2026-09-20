import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { InvestigationModal } from './InvestigationModal';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { ResponseMission, CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  MapPin, 
  ClipboardCheck, 
  FlaskConical, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Send,
  ExternalLink 
} from 'lucide-react';

export const FieldWorkerDashboard: React.FC = () => {
  const { state } = useSurveillanceStore();
  const [selectedMission, setSelectedMission] = useState<ResponseMission | null>(null);
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const myMissions = state.missions;
  const mySamples = state.samples;

  return (
    <div className="space-y-6">
      {/* Field Worker Profile Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{t('fieldDashboard')}</h2>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-semibold border border-amber-500/40">
                  Officer: Pooja Patil (FW-04)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assigned Beat: Block B (Kalyanpur & Rampur Rural Sub-Division)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Action</span>
              <span className="text-base font-bold text-amber-400">
                {myMissions.filter(m => m.status !== 'COMPLETED').length} Active Missions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Active Missions + Dispatched Samples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Missions Feed (Section 18 & 19) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-400" /> {t('assignedMissions')}
              </h3>
              <span className="text-xs text-slate-400 font-medium">GPS Locked via Mobile Device</span>
            </div>

            <div className="space-y-3">
              {myMissions.map((m) => {
                const isPending = m.status !== 'COMPLETED';
                const relatedCase = state.cases.find(c => c.id === m.caseId);
                return (
                  <div 
                    key={m.id}
                    className={`bg-slate-950 p-4 rounded-xl border space-y-3 transition-all ${
                      isPending ? 'border-amber-500/50 shadow-md shadow-amber-950/20' : 'border-slate-800 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{m.id}</span>
                        {relatedCase && (
                          <button
                            onClick={() => setViewingCase(relatedCase)}
                            className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            Case {m.caseId} <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          m.priority === 'HIGH' || m.priority === 'EMERGENCY'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {m.priority}
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-300">
                        <b>Destination:</b> {m.targetVillage} ({m.coordinates.lat.toFixed(4)}°N, {m.coordinates.lng.toFixed(4)}°E)
                      </p>
                      <p className="text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                        <b>Vet Directives:</b> {m.instructions}
                      </p>
                    </div>

                    {/* Investigation Summary if Completed */}
                    {m.investigationDetails && (
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-400 font-semibold text-[11px]">
                          <span>✓ Physical Examination Completed</span>
                          <span>Timestamp: {m.investigationDetails.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-300 pt-1">
                          <div>Examined: <b>{m.investigationDetails.examinedCount}</b></div>
                          <div>Sick: <b className="text-rose-400">{m.investigationDetails.sickCount}</b></div>
                          <div>Dead: <b className="text-rose-400">{m.investigationDetails.deadCount}</b></div>
                        </div>
                        <p className="text-slate-400 text-[11px] pt-1">
                          Findings: {m.investigationDetails.fieldNotes}
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedMission(m)}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                        >
                          <Navigation className="w-3.5 h-3.5" /> {t('startInvestigation')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Dispatched Samples Log (Section 20 & 22) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-400" /> Dispatched Lab Samples
            </h3>

            <div className="space-y-3">
              {mySamples.map(s => {
                const sampleCase = state.cases.find(c => c.id === s.caseId);
                return (
                  <div 
                    key={s.id} 
                    onClick={() => sampleCase && setViewingCase(sampleCase)}
                    className="bg-slate-950 hover:bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/50 cursor-pointer text-xs space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-purple-400 text-sm flex items-center gap-1">
                        {s.id} <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </span>
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/40">
                        {s.status}
                      </span>
                    </div>

                    <p className="text-slate-300"><b>Type:</b> {s.sampleType}</p>
                    <p className="text-slate-400"><b>Destination:</b> {s.targetLabName}</p>
                    <p className="text-[11px] text-slate-500">Collected by {s.collectedBy} on {s.collectedAt}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedMission && (
        <InvestigationModal
          isOpen={true}
          onClose={() => setSelectedMission(null)}
          mission={selectedMission}
        />
      )}

      {/* Case Detail Modal */}
      {viewingCase && (
        <CaseDetailModal
          isOpen={true}
          onClose={() => setViewingCase(null)}
          caseItem={viewingCase}
        />
      )}
    </div>
  );
};
