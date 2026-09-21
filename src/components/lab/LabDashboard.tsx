import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { EnterResultModal } from './EnterResultModal';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { LabSample, CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  Send, 
  FileText, 
  ShieldCheck, 
  Search,
  Activity,
  ExternalLink
} from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const { state } = useSurveillanceStore();
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const samples = state.samples;
  const certifiedCases = state.cases.filter(c => c.labResult);

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{t('labPortal')}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
                  Regional Disease Diagnostic Laboratory (RDDL)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Accredited Level-3 Animal Pathogen Molecular Testing Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sample Queue</span>
              <span className="text-base font-bold text-blue-600">
                {samples.filter(s => s.status !== 'COMPLETED').length} Active Samples
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sample Intake Queue + Certified Tests Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inbound Sample Testing Queue (Section 21 & 22) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> {t('sampleQueue')} (Step 21 & 22)
              </h3>
              <span className="text-xs text-slate-500 font-medium">Chain-of-Custody Verified</span>
            </div>

            {samples.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No samples currently dispatched to laboratory.
              </p>
            ) : (
              <div className="space-y-3">
                {samples.map((s) => {
                  const isDone = s.status === 'COMPLETED';
                  const sampleCase = state.cases.find(c => c.id === s.caseId);
                  return (
                    <div 
                      key={s.id} 
                      className={`bg-white p-4 rounded-xl border space-y-3 transition-all ${
                        !isDone ? 'border-blue-200 shadow-sm bg-blue-50/10' : 'border-slate-200 opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{s.id}</span>
                          {sampleCase && (
                            <button
                              onClick={() => setViewingCase(sampleCase)}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              Case {s.caseId} <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                            {s.sampleType}
                          </span>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isDone 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Collector:</span>
                          {s.collectedBy} ({s.collectedAt})
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Assigned Lab:</span>
                          {s.targetLabName}
                        </div>
                      </div>

                      {/* Visual Sample Lifecycle Steps (Section 22) */}
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                        <span className="text-emerald-700 font-semibold">1. Requested</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-semibold">2. Collected</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-semibold">3. Dispatched</span>
                        <span>→</span>
                        <span className={`${isDone ? 'text-emerald-700 font-semibold' : 'text-blue-700 font-semibold'}`}>
                          4. {isDone ? 'Tested & Certified' : 'Testing in Progress'}
                        </span>
                      </div>

                      {!isDone && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => setSelectedSample(s)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <FlaskConical className="w-3.5 h-3.5" /> {t('runAssay')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Certified Test Results & Transmission (Section 23) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Transmitted Results to Vet Officer
            </h3>

            <div className="space-y-3">
              {certifiedCases.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No verified lab certificates on file yet.
                </p>
              ) : (
                certifiedCases.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setViewingCase(c)}
                    className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer text-xs space-y-2 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        {c.id} <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.labResult?.result === 'POSITIVE'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {c.labResult?.result}
                      </span>
                    </div>

                    <p className="text-slate-800 font-semibold">{c.labResult?.pathogenIdentified}</p>
                    <p className="text-slate-500 text-[11px]">
                      Assay: {c.labResult?.testType} {c.labResult?.cycleThreshold ? `(CT: ${c.labResult.cycleThreshold})` : ''}
                    </p>
                    <p className="text-slate-700 text-[11px] bg-white p-2 rounded border border-slate-200">
                      {c.labResult?.remarks}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Certified by: {c.labResult?.testedBy} on {c.labResult?.testedAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enter Result Modal */}
      {selectedSample && (
        <EnterResultModal
          isOpen={true}
          onClose={() => setSelectedSample(null)}
          sample={selectedSample}
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
