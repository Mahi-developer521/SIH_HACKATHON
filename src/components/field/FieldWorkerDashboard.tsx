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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{t('fieldDashboard')}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
                  Officer: Pooja Patil (FW-04)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned Beat: Block B (Kalyanpur & Rampur Rural Sub-Division)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pending Action</span>
              <span className="text-base font-bold text-blue-600">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" /> {t('assignedMissions')}
              </h3>
              <span className="text-xs text-slate-500 font-medium">GPS Locked via Mobile Device</span>
            </div>

            <div className="space-y-3">
              {myMissions.map((m) => {
                const isPending = m.status !== 'COMPLETED';
                const relatedCase = state.cases.find(c => c.id === m.caseId);
                return (
                  <div 
                    key={m.id} 
                    className={`bg-white p-4 rounded-xl border space-y-3 transition-all ${
                      isPending ? 'border-blue-200 shadow-sm bg-blue-50/10' : 'border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{m.id}</span>
                        {relatedCase && (
                          <button
                            onClick={() => setViewingCase(relatedCase)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Case {m.caseId} <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          m.priority === 'HIGH' || m.priority === 'EMERGENCY'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {m.priority}
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isPending ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-700">
                        <b>Destination:</b> {m.targetVillage} ({m.coordinates.lat.toFixed(4)}°N, {m.coordinates.lng.toFixed(4)}°E)
                      </p>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                        <b>Vet Directives:</b> {m.instructions}
                      </p>
                    </div>

                    {/* Investigation Summary if Completed */}
                    {m.investigationDetails && (
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 font-semibold text-[11px]">
                          <span>✓ Physical Examination Completed</span>
                          <span>Timestamp: {m.investigationDetails.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-800 pt-1">
                          <div>Examined: <b>{m.investigationDetails.examinedCount}</b></div>
                          <div>Sick: <b className="text-rose-600">{m.investigationDetails.sickCount}</b></div>
                          <div>Dead: <b className="text-rose-600">{m.investigationDetails.deadCount}</b></div>
                        </div>
                        <p className="text-slate-600 text-[11px] pt-1">
                          Findings: {m.investigationDetails.fieldNotes}
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedMission(m)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600" /> Dispatched Lab Samples
            </h3>

            <div className="space-y-3">
              {mySamples.map(s => {
                const sampleCase = state.cases.find(c => c.id === s.caseId);
                return (
                  <div 
                    key={s.id} 
                    onClick={() => sampleCase && setViewingCase(sampleCase)}
                    className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer text-xs space-y-2 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-blue-600 text-sm flex items-center gap-1">
                        {s.id} <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {s.status}
                      </span>
                    </div>

                    <p className="text-slate-700"><b>Type:</b> {s.sampleType}</p>
                    <p className="text-slate-600"><b>Destination:</b> {s.targetLabName}</p>
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
