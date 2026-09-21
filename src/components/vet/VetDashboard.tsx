import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { GisMap } from '../gis/GisMap';
import { CreateMissionModal } from './CreateMissionModal';
import { InterventionModal } from './InterventionModal';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  AlertTriangle, 
  Stethoscope, 
  MapPin, 
  FlaskConical, 
  Syringe, 
  Send, 
  FileCheck, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert,
  Activity,
  ExternalLink,
  ShieldCheck,
  Radio,
  Eye
} from 'lucide-react';

export const VetDashboard: React.FC = () => {
  const { state, triageCase, completeIntervention } = useSurveillanceStore();

  const [activeTab, setActiveTab] = useState<'alerts' | 'gis' | 'missions' | 'vaccination' | 'interventions'>('alerts');
  const [missionModalCase, setMissionModalCase] = useState<{
    id: string;
    village: string;
    clusterId?: string;
    coords: { lat: number; lng: number };
  } | null>(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const highRiskCases = state.cases.filter(c => c.riskLevel === 'HIGH');
  const activeCluster = state.clusters[0];

  return (
    <div className="space-y-6">
      {/* Vet Header & Command Stats (Section 15) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{t('commandCenter')}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
                  Officer: Dr. A. Sharma
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveillance Jurisdiction: District Animal Disease Surveillance & Rapid Response Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInterventionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Syringe className="w-4 h-4" /> {t('authorizeIntervention')} (Step 25)
            </button>
          </div>
        </div>

        {/* Command KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Active AI Alerts</span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              {highRiskCases.length} Cases
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Spatio-Temporal Clusters</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5">
              {state.clusters.filter(c => c.status !== 'CONTAINED').length} Active (CL-001)
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Dispatched Missions</span>
            <span className="text-2xl font-black text-blue-600 mt-0.5">
              {state.missions.length} Missions
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Lab Result Intake</span>
            <span className="text-2xl font-black text-purple-700 mt-0.5">
              {state.cases.filter(c => c.labResult).length} Certified
            </span>
          </div>
        </div>
      </div>

      {/* Vet Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{t('aiAlerts')} ({state.clusters.length})</span>
          {activeCluster && activeCluster.status === 'ACTIVE_OUTBREAK' && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gis')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'gis'
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> GIS Geospatial Intelligence
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'missions'
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Field Investigations ({state.missions.length})
        </button>

        <button
          onClick={() => setActiveTab('vaccination')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'vaccination'
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Syringe className="w-3.5 h-3.5" /> {t('vaccinationGaps')}
        </button>

        <button
          onClick={() => setActiveTab('interventions')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'interventions'
              ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Interventions ({state.interventions.length})
        </button>
      </div>

      {/* Tab 1: AI Alerts & Clusters (Section 16: VET REVIEWS AI ALERT) */}
      {activeTab === 'alerts' && (
        <div className="space-y-5">
          {/* Active High-Risk Cluster Review Card (CL-001) */}
          {activeCluster && (
            <div className="bg-white border-2 border-rose-300 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Step 16: Urgent AI Evidence Dossier
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {activeCluster.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{activeCluster.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Affecting Villages: <b className="text-slate-800">{activeCluster.villages.join(', ')}</b> • Total Cases: <b className="text-rose-600">{activeCluster.totalCases}</b> • Total Deaths: <b className="text-rose-600">{activeCluster.totalDeaths}</b>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-rose-600 tracking-tight">
                    {activeCluster.riskScore}<span className="text-sm font-semibold text-slate-400">/100</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">
                    Risk Level: {activeCluster.riskLevel}
                  </span>
                </div>
              </div>

              {/* AI Evidence Factors Grid (Section 16) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                  🤖 Automated AI Intelligence Signals & Epidemiological Evidence:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><b>Rapid increase:</b> 21 cumulative cases reported across 3 days</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><b>Symptom concordance:</b> Blisters, acute drooling, high fever</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><b>Geographic cluster:</b> Multi-village epicenter within 6.5 km</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><b>Historical deviation:</b> 3.8x above 5-year seasonal normal</span>
                  </div>
                </div>
              </div>

              {/* Triage Action Buttons (Section 16: Investigate / Monitor / Escalate) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-600 font-medium">
                  Veterinary Triage Decision Protocol:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Investigate Action */}
                  <button
                    onClick={() => {
                      const firstCase = state.cases.find(c => c.clusterId === activeCluster.id) || state.cases[0];
                      setMissionModalCase({
                        id: firstCase.id,
                        village: firstCase.village,
                        clusterId: activeCluster.id,
                        coords: firstCase.coordinates
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> {t('createMission')} (Step 17)
                  </button>

                  {/* Monitor Action */}
                  <button
                    onClick={() => {
                      const firstCase = state.cases.find(c => c.clusterId === activeCluster.id) || state.cases[0];
                      triageCase(firstCase.id, 'MONITOR', 'Instructed local dispensary to monitor daily rectal temperature and hydration.');
                      alert(`Case ${firstCase.id} triaged as MONITORING. Advisory sent to local staff.`);
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 border border-slate-300"
                  >
                    <Eye className="w-3.5 h-3.5" /> Monitor Closely
                  </button>

                  {/* Escalate Action */}
                  <button
                    onClick={() => {
                      const firstCase = state.cases.find(c => c.clusterId === activeCluster.id) || state.cases[0];
                      triageCase(firstCase.id, 'ESCALATE', 'Escalated to State Directorate of Animal Husbandry for emergency quarantine cordon.');
                      alert(`Emergency escalation notification transmitted to State Directorate!`);
                    }}
                    className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate Alert
                  </button>

                  {/* Authorize Ring Vaccination */}
                  <button
                    onClick={() => setIsInterventionModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Syringe className="w-3.5 h-3.5" /> {t('authorizeIntervention')} (Step 25)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of Individual Cases Awaiting Verification (Clickable Dossiers) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Reported Surveillance Cases Feed (Click any card to inspect full dossier)</span>
              <span className="text-xs text-slate-500 font-normal">{state.cases.length} Total Records</span>
            </h4>

            <div className="space-y-2">
              {state.cases.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setViewingCase(c)}
                  className="bg-white hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        {c.id} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.riskLevel === 'HIGH' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        Score {c.riskScore} • {c.riskLevel}
                      </span>
                      <span className="text-slate-500 text-[11px]">• {c.village} ({c.animalType})</span>
                    </div>
                    <p className="text-slate-600">
                      Symptoms: {c.symptoms.slice(0, 3).join(', ')} | Sick: {c.sickCount}, Dead: {c.deadCount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {c.labResult ? (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <FlaskConical className="w-3 h-3 text-purple-600" />
                        Lab {c.labResult.result}: {c.labResult.pathogenIdentified}
                      </span>
                    ) : c.missionId ? (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-medium">
                        Field Mission: {c.missionId} Active
                      </span>
                    ) : (
                      <button
                        onClick={() => setMissionModalCase({
                          id: c.id,
                          village: c.village,
                          clusterId: c.clusterId,
                          coords: c.coordinates
                        })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg transition-colors text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3 h-3" /> Assign Field Worker
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GIS Geospatial Intelligence */}
      {activeTab === 'gis' && (
        <div className="space-y-4">
          <GisMap />
        </div>
      )}

      {/* Tab 3: Field Investigations & Missions */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Active Field Worker Missions</h4>
            <div className="space-y-3">
              {state.missions.map(m => (
                <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.id}</span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                        {m.priority} PRIORITY
                      </span>
                      <span className="text-slate-500">Target: {m.targetVillage}</span>
                    </div>
                    <span className="bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {m.status}
                    </span>
                  </div>

                  <p className="text-slate-700"><b>Assigned Inspector:</b> {m.workerName} ({m.assignedToWorkerId})</p>
                  <p className="text-slate-500"><b>Instructions:</b> {m.instructions}</p>

                  {m.investigationDetails && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2 space-y-1">
                      <span className="text-emerald-700 font-bold block text-[11px]">✓ On-Site Ground Findings Verified:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
                        <div>Examined: <b>{m.investigationDetails.examinedCount}</b></div>
                        <div>Sick: <b>{m.investigationDetails.sickCount}</b></div>
                        <div>Dead: <b>{m.investigationDetails.deadCount}</b></div>
                        <div>Sample Taken: <b>{m.investigationDetails.sampleTaken ? `Yes (${m.investigationDetails.sampleId})` : 'No'}</b></div>
                      </div>
                      <p className="text-slate-500 text-[11px] pt-1">Notes: {m.investigationDetails.fieldNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Vaccination Coverage Tracking & Gaps */}
      {activeTab === 'vaccination' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Village-Level Herd Immunity & Vaccination Deficit Audit</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveillance rule: Any village under 70% coverage represents an acute vulnerability during transboundary outbreaks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.villages.map(v => {
                const isDeficit = v.coveragePercent < 60;
                return (
                  <div 
                    key={v.name}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isDeficit ? 'bg-rose-50/40 border-rose-200 shadow-sm' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{v.name}</h5>
                      {isDeficit && (
                        <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          DEFICIT GAP
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vaccine Coverage</span>
                        <span className={`font-bold ${isDeficit ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {v.coveragePercent}%
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isDeficit ? 'bg-rose-500' : 'bg-emerald-600'}`}
                          style={{ width: `${v.coveragePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
                      <span>Total: {v.totalLivestock}</span>
                      <span>Vaccinated: {v.vaccinatedLivestock}</span>
                    </div>

                    {isDeficit && (
                      <button
                        onClick={() => {
                          setIsInterventionModalOpen(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Syringe className="w-3.5 h-3.5" /> Deploy Emergency Ring Vaccines
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Interventions Log */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Authorized Containment Interventions</h4>
              <button
                onClick={() => setIsInterventionModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                + New Intervention Order
              </button>
            </div>

            {state.interventions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active intervention orders yet. Click "+ New Intervention Order" to deploy ring vaccination or quarantine.
              </p>
            ) : (
              <div className="space-y-2">
                {state.interventions.map(i => (
                  <div key={i.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{i.type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          i.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {i.status}
                        </span>
                        {i.status !== 'COMPLETED' && (
                          <button
                            onClick={() => completeIntervention(i.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[10px] font-bold shadow-sm transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700"><b>Target:</b> {i.targetVillage} | <b>Doses/Coverage:</b> {i.dosesAdministered || i.animalsQuarantined}</p>
                    <p className="text-slate-500"><b>Directives:</b> {i.notes}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Authorized by: {i.authorizedByVet} on {i.initiatedAt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {missionModalCase && (
        <CreateMissionModal
          isOpen={true}
          onClose={() => setMissionModalCase(null)}
          caseId={missionModalCase.id}
          village={missionModalCase.village}
          clusterId={missionModalCase.clusterId}
          coords={missionModalCase.coords}
        />
      )}

      {isInterventionModalOpen && (
        <InterventionModal
          isOpen={true}
          onClose={() => setIsInterventionModalOpen(false)}
          clusterId={activeCluster?.id}
          defaultVillage={activeCluster?.villages[1] || 'Village B (Kalyanpur)'}
        />
      )}

      {viewingCase && (
        <CaseDetailModal
          isOpen={true}
          onClose={() => setViewingCase(null)}
          caseItem={viewingCase}
          onAssignMission={() => {
            setMissionModalCase({
              id: viewingCase.id,
              village: viewingCase.village,
              clusterId: viewingCase.clusterId,
              coords: viewingCase.coordinates
            });
          }}
        />
      )}
    </div>
  );
};
